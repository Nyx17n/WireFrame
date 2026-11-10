#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
WireFrame - Serveur Local & Proxy API Warframe Market
Permet d'interroger https://api.warframe.market et de charger les images
sans blocage CORS ni erreur de certificat SSL.
"""

import http.server
import socketserver
import urllib.request
import urllib.error
import urllib.parse
import ssl
import os
import sys
import json
import time
import shutil
import zipfile
import tempfile

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8484
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

# Contexte SSL tolérant (évite les erreurs si l'horloge système est décalée)
SSL_CTX = ssl._create_unverified_context()

# Cache mémoire simple pour accélérer la navigation entre onglets
# Clé -> (timestamp, status, headers_dict, body_bytes)
CACHE = {}
CACHE_TTL = {
    "items_list": 3600,      # Catalogue complet des items : 1h
    "item_detail": 600,      # Détails d'un item / set : 10 min
    "statistics": 300,       # Statistiques 48h/90j : 5 min
    "orders": 20,            # Ordres en direct : 20 sec
    "asset": 86400           # Images et icônes : 24h
}


def get_cache_ttl(path):
    if path.startswith("/assets/"):
        return CACHE_TTL["asset"]
    if path in ("/api/v2/items", "/api/v1/items"):
        return CACHE_TTL["items_list"]
    if "/statistics" in path:
        return CACHE_TTL["statistics"]
    if "/orders" in path:
        return CACHE_TTL["orders"]
    return CACHE_TTL["item_detail"]


class WireMarketHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT_DIR, **kwargs)

    def log_message(self, format, *args):
        # Journalisation propre et discrète dans la console Batch
        msg = format % args
        if not any(ext in msg for ext in (".png", ".jpg", ".svg", ".ico", "/assets/")):
            sys.stdout.write(f"[WireFrame] {msg}\n")
            sys.stdout.flush()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        req_path = parsed.path
        query = f"?{parsed.query}" if parsed.query else ""

        # Endpoint de santé pour le script Batch
        if req_path == "/__health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(b'{"status":"ok","app":"WireFrame"}')
            return

        # Endpoint de contrôle de fenêtre (Toujours au premier plan / Mode Compact)
        if req_path == "/__window":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')
            return

        # Proxy Worldstate Warframe (Rotations Duviri, Cycles Jour/Nuit, Mises à prix, Baro Ki'Teer)
        if req_path == "/worldstate":
            self.proxy_request("https://api.warframestat.us/pc/?language=fr", req_path, is_api=False)
            return

        # Vérification des mises à jour GitHub (Releases + main/version.json)
        if req_path == "/__update/check":
            self.handle_update_check()
            return

        # Téléchargement & installation sécurisée de WireFrame.zip avec Rollback anti-blocage antivirus
        if req_path == "/__update/apply":
            self.handle_update_apply(parsed.query)
            return

        # Proxy API Warframe Market (/api/v2/... ou /api/v1/...)
        if req_path.startswith("/api/"):
            target_path = req_path[4:]  # retire "/api" -> "/v2/..."
            target_url = f"https://api.warframe.market{target_path}{query}"
            self.proxy_request(target_url, req_path, is_api=True)
            return

        # Proxy Assets / Images Warframe Market (/assets/...)
        if req_path.startswith("/assets/"):
            asset_subpath = req_path[8:]  # retire "/assets/"
            target_url = f"https://warframe.market/static/assets/{asset_subpath}{query}"
            self.proxy_request(target_url, req_path, is_api=False)
            return

        # Fichiers statiques locaux (HTML, CSS, JS)
        return super().do_GET()

    def fetch_json_safe(self, url, timeout=10):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "WireMarket-Updater/1.6"})
            with urllib.request.urlopen(req, context=SSL_CTX, timeout=timeout) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception:
            return None

    def handle_update_check(self):
        local_path = os.path.join(ROOT_DIR, "version.json")
        local_data = {"version": "1.6.0"}
        if os.path.exists(local_path):
            try:
                with open(local_path, "r", encoding="utf-8") as f:
                    local_data = json.load(f)
            except Exception:
                pass

        remote_data = self.fetch_json_safe(f"https://gitlab.com/nyxo_17/wiremarket_v1/-/raw/main/version.json?t={int(time.time())}")
        if not remote_data:
            remote_data = self.fetch_json_safe(f"https://raw.githubusercontent.com/Nyxo-17/wiremarket_v1/main/version.json?t={int(time.time())}")
        release_data = self.fetch_json_safe("https://api.github.com/repos/Nyxo-17/wiremarket_v1/releases/latest")

        payload = json.dumps({
            "status": "ok",
            "local": local_data,
            "remote": remote_data,
            "githubRelease": release_data
        }).encode("utf-8")
        self.send_ResponseData(200, "application/json; charset=utf-8", payload, cached=False)

    def handle_update_apply(self, query_str):
        params = urllib.parse.parse_qs(query_str or "")
        zip_url = "https://gitlab.com/nyxo_17/wiremarket_v1/-/raw/main/WireFrame.zip"
        if "zipUrl" in params and params["zipUrl"]:
            cand = params["zipUrl"][0]
            if cand.startswith(("https://gitlab.com/nyxo_17/", "https://github.com/Nyxo-17/", "https://raw.githubusercontent.com/Nyxo-17/", "https://objects.githubusercontent.com/")):
                zip_url = cand

        temp_dir = tempfile.mkdtemp(prefix="WireFrame_Update_")
        zip_path = os.path.join(temp_dir, "WireFrame.zip")
        extract_dir = os.path.join(temp_dir, "extracted")
        try:
            req = urllib.request.Request(zip_url, headers={"User-Agent": "WireFrame-Updater/1.6"})
            with urllib.request.urlopen(req, context=SSL_CTX, timeout=45) as resp:
                with open(zip_path, "wb") as out_f:
                    shutil.copyfileobj(resp, out_f)

            with zipfile.ZipFile(zip_path, "r") as zf:
                zf.extractall(extract_dir)

            source_root = extract_dir
            if not os.path.exists(os.path.join(source_root, "index.html")):
                subs = [os.path.join(extract_dir, d) for d in os.listdir(extract_dir) if os.path.isdir(os.path.join(extract_dir, d))]
                if len(subs) == 1 and os.path.exists(os.path.join(subs[0], "index.html")):
                    source_root = subs[0]

            exe_status = "unchanged"
            for root, dirs, files in os.walk(source_root):
                rel_dir = os.path.relpath(root, source_root)
                if rel_dir.startswith(".git"):
                    continue
                target_sub = ROOT_DIR if rel_dir == "." else os.path.join(ROOT_DIR, rel_dir)
                os.makedirs(target_sub, exist_ok=True)
                for fname in files:
                    src_file = os.path.join(root, fname)
                    dst_file = os.path.join(target_sub, fname)
                    if fname.lower() in ("wireframe.exe", "wiremarket.exe"):
                        bak_file = dst_file + ".bak"
                        try:
                            if os.path.exists(bak_file):
                                try:
                                    os.remove(bak_file)
                                except Exception:
                                    pass
                            if os.path.exists(dst_file):
                                os.replace(dst_file, bak_file)
                            shutil.copy2(src_file, dst_file)
                            exe_status = "updated_from_zip"
                        except Exception:
                            if not os.path.exists(dst_file) and os.path.exists(bak_file):
                                try:
                                    os.replace(bak_file, dst_file)
                                except Exception:
                                    pass
                            exe_status = "antivirus_protected_rollback"
                    else:
                        try:
                            shutil.copy2(src_file, dst_file)
                        except Exception:
                            pass

            CACHE.clear()
            ok_body = json.dumps({"status": "ok", "exeStatus": exe_status, "message": "Mise à jour installée avec succès !"}).encode("utf-8")
            self.send_ResponseData(200, "application/json; charset=utf-8", ok_body, cached=False)
        except Exception as e:
            err_body = json.dumps({"status": "error", "message": str(e)}).encode("utf-8")
            self.send_ResponseData(500, "application/json; charset=utf-8", err_body, cached=False)
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    def proxy_request(self, target_url, req_path, is_api=True):
        lang = self.headers.get("X-WM-Language", "fr")
        platform = self.headers.get("X-WM-Platform", "pc")
        crossplay = self.headers.get("X-WM-Crossplay", "true")
        force_refresh = self.headers.get("X-WM-Refresh", "false") == "true"

        cache_key = f"{target_url}|{lang}|{platform}|{crossplay}" if is_api else target_url
        ttl = get_cache_ttl(req_path)
        now = time.time()

        if not force_refresh and cache_key in CACHE:
            ts, status, content_type, body = CACHE[cache_key]
            if now - ts < ttl:
                self.send_ResponseData(status, content_type, body, cached=True)
                return

        headers = {
            "User-Agent": "WireMarket/1.0 (Windows; Warframe Market Browser)",
            "Accept": "application/json" if is_api else "*/*",
        }
        if is_api:
            headers["Language"] = lang
            headers["Platform"] = platform
            headers["Crossplay"] = crossplay

        try:
            req = urllib.request.Request(target_url, headers=headers)
            with urllib.request.urlopen(req, context=SSL_CTX, timeout=15) as resp:
                status = resp.status
                content_type = resp.headers.get("Content-Type", "application/json; charset=utf-8")
                body = resp.read()
                CACHE[cache_key] = (now, status, content_type, body)
                self.send_ResponseData(status, content_type, body, cached=False)
        except urllib.error.HTTPError as e:
            err_body = e.read() if e.fp else json.dumps({"error": str(e)}).encode("utf-8")
            self.send_ResponseData(e.code, "application/json; charset=utf-8", err_body, cached=False)
        except Exception as e:
            err_json = json.dumps({
                "error": "network_error",
                "message": str(e),
                "target": target_url
            }).encode("utf-8")
            self.send_ResponseData(502, "application/json; charset=utf-8", err_json, cached=False)

    def send_ResponseData(self, status, content_type, body, cached=False):
        try:
            self.send_response(status)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("X-WireMarket-Cache", "HIT" if cached else "MISS")
            if content_type.startswith("image/"):
                self.send_header("Cache-Control", "public, max-age=86400")
            self.end_headers()
            self.wfile.write(body)
        except (ConnectionAbortedError, BrokenPipeError):
            pass


class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def main():
    os.chdir(ROOT_DIR)
    with ThreadedHTTPServer(("127.0.0.1", PORT), WireMarketHandler) as httpd:
        print(f"============================================================")
        print(f"  WireFrame - Serveur & Proxy API Warframe Market actif")
        print(f"  URL Locale : http://127.0.0.1:{PORT}")
        print(f"============================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[WireFrame] Arret du serveur.")


if __name__ == "__main__":
    main()

