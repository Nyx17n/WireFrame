#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
WireMarket - Serveur Local & Proxy API Warframe Market
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
            sys.stdout.write(f"[WireMarket] {msg}\n")
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
            self.wfile.write(b'{"status":"ok","app":"WireMarket"}')
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
        print(f"  WireMarket - Serveur & Proxy API Warframe Market actif")
        print(f"  URL Locale : http://127.0.0.1:{PORT}")
        print(f"============================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[WireMarket] Arret du serveur.")


if __name__ == "__main__":
    main()

