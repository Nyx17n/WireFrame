#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
WireMarket — Auto-Bump de Version & Packaging automatique lors d'un `git commit`.
Exécuté automatiquement par le hook Git `.git/hooks/pre-commit` (et `.githooks/pre-commit`).

Options manuelles :
  python bump_version.py           -> Incrémente le patch (ex: 1.6.0 -> 1.6.1)
  python bump_version.py --minor   -> Incrémente la version mineure (ex: 1.6.1 -> 1.7.0)
  python bump_version.py --major   -> Incrémente la version majeure (ex: 1.6.1 -> 2.0.0)
  python bump_version.py --set 1.8.0 -> Définit explicitement la version
"""

import datetime
import json
import os
import re
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent


def get_head_version() -> str:
    """Récupère la version enregistrée dans le dernier commit Git (HEAD:version.json)."""
    try:
        res = subprocess.run(
            ["git", "show", "HEAD:version.json"],
            cwd=str(ROOT_DIR),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=5,
        )
        if res.returncode == 0 and res.stdout.strip():
            data = json.loads(res.stdout)
            return str(data.get("version", "")).strip()
    except Exception:
        pass
    return ""


def parse_semver(ver_str: str):
    clean = re.sub(r"^v", "", str(ver_str or "1.6.0").strip(), flags=re.IGNORECASE)
    parts = [int(x) if x.isdigit() else 0 for x in clean.split(".")]
    while len(parts) < 3:
        parts.append(0)
    return parts[0], parts[1], parts[2]


def compute_next_version(current_ver: str, mode: str = "patch") -> str:
    major, minor, patch = parse_semver(current_ver)
    if mode == "major":
        return f"{major + 1}.0.0"
    if mode == "minor":
        return f"{major}.{minor + 1}.0"
    return f"{major}.{minor}.{patch + 1}"


def sync_version_in_files(new_ver: str, iso_date: str, fr_date: str):
    # 1. Mettre à jour version.json
    version_path = ROOT_DIR / "version.json"
    if version_path.exists():
        data = json.loads(version_path.read_text(encoding="utf-8"))
    else:
        data = {
            "version": new_ver,
            "date": iso_date,
            "title": "Mise à jour WireMarket",
            "repo": "Nyxo-17/wiremarket_v1",
            "zipUrl": "https://raw.githubusercontent.com/Nyxo-17/wiremarket_v1/main/WireMarket.zip",
            "changelog": [],
        }

    data["version"] = new_ver
    data["date"] = iso_date

    changelog = data.get("changelog")
    if isinstance(changelog, list) and len(changelog) > 0:
        changelog[0]["version"] = new_ver
        changelog[0]["date"] = fr_date

    version_path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    # 2. Mettre à jour index.html
    index_path = ROOT_DIR / "index.html"
    if index_path.exists():
        html = index_path.read_text(encoding="utf-8")
        html = re.sub(
            r'(<strong\s+id="settings-local-version"[^>]*>)v?[0-9]+\.[0-9]+\.[0-9]+(</strong>)',
            rf"\g<1>v{new_ver}\g<2>",
            html,
        )
        html = re.sub(
            r'(<div\s+class="changelog-ver-pill"\s+id="changelog-current-ver-pill">\s*VERSION INSTALLÉE\s*:\s*)v?[0-9]+\.[0-9]+\.[0-9]+(\s*</div>)',
            rf"\g<1>v{new_ver}\g<2>",
            html,
        )
        html = re.sub(
            r'(href="css/style\.css\?v=)[0-9]+\.[0-9]+\.[0-9]+(")',
            rf"\g<1>{new_ver}\g<2>",
            html,
        )
        html = re.sub(
            r'(src="js/app\.js\?v=)[0-9]+\.[0-9]+\.[0-9]+(")',
            rf"\g<1>{new_ver}\g<2>",
            html,
        )
        index_path.write_text(html, encoding="utf-8")

    # 3. Mettre à jour js/app.js (DEFAULT_VERSION_MANIFEST & UpdaterState)
    app_js_path = ROOT_DIR / "js" / "app.js"
    if app_js_path.exists():
        js = app_js_path.read_text(encoding="utf-8")
        # Remplacer version et date dans DEFAULT_VERSION_MANIFEST
        js = re.sub(
            r'(const\s+DEFAULT_VERSION_MANIFEST\s*=\s*\{\s*version:\s*")[0-9]+\.[0-9]+\.[0-9]+(")',
            rf"\g<1>{new_ver}\g<2>",
            js,
            count=1,
        )
        js = re.sub(
            r'(const\s+DEFAULT_VERSION_MANIFEST\s*=\s*\{\s*version:\s*"[^"]+",\s*date:\s*")[0-9]{4}-[0-9]{2}-[0-9]{2}(")',
            rf"\g<1>{iso_date}\g<2>",
            js,
            count=1,
        )
        # Remplacer la première entrée du changelog embarqué dans DEFAULT_VERSION_MANIFEST
        js = re.sub(
            r'(changelog:\s*\[\s*\{\s*version:\s*")[0-9]+\.[0-9]+\.[0-9]+(")',
            rf"\g<1>{new_ver}\g<2>",
            js,
            count=1,
        )
        js = re.sub(
            r'(remoteVersion:\s*")[0-9]+\.[0-9]+\.[0-9]+(")',
            rf"\g<1>{new_ver}\g<2>",
            js,
            count=1,
        )
        app_js_path.write_text(js, encoding="utf-8")


def compile_exe_if_needed():
    """Recompile WireMarket.exe si Launcher.cs existe et que csc.exe est disponible."""
    csc_path = Path(r"C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe")
    launcher_cs = ROOT_DIR / "Launcher.cs"
    exe_path = ROOT_DIR / "WireMarket.exe"
    ico_path = ROOT_DIR / "logo.ico"

    if not csc_path.exists() or not launcher_cs.exists():
        return

    try:
        # Vérifier si Launcher.cs est plus récent que WireMarket.exe
        if exe_path.exists() and launcher_cs.stat().st_mtime <= exe_path.stat().st_mtime:
            return
        cmd = [
            str(csc_path),
            "/nologo",
            "/target:winexe",
            f"/out:{exe_path}",
            "/r:System.IO.Compression.dll",
            "/r:System.IO.Compression.FileSystem.dll",
        ]
        if ico_path.exists():
            cmd.append(f"/win32icon:{ico_path}")
        cmd.append(str(launcher_cs))
        subprocess.run(cmd, cwd=str(ROOT_DIR), capture_output=True, timeout=15)
    except Exception:
        pass


def rebuild_zip():
    """Reconstruit WireMarket.zip (et met à jour la copie sur le Bureau si possible)."""
    zip_path = ROOT_DIR / "WireMarket.zip"
    items_to_pack = [
        "WireMarket.exe",
        "WireMarket.bat",
        "index.html",
        "version.json",
        "css",
        "js",
        "notification.mp3",
        "notification-bell.wav",
        "logo.ico",
        "logo.png",
        "server.py",
        "LISEZ-MOI.txt",
    ]

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for rel_name in items_to_pack:
            p = ROOT_DIR / rel_name
            if not p.exists():
                continue
            if p.is_file():
                zf.write(p, arcname=rel_name)
            elif p.is_dir():
                for sub in sorted(p.rglob("*")):
                    if sub.is_file():
                        arc = str(sub.relative_to(ROOT_DIR)).replace("\\", "/")
                        zf.write(sub, arcname=arc)

    # Copier sur le Bureau si présent
    desktop_zip = Path.home() / "Desktop" / "WireMarket.zip"
    if desktop_zip.parent.exists():
        try:
            shutil.copy2(zip_path, desktop_zip)
        except Exception:
            pass


def stage_updated_files():
    """Ajoute les fichiers de version et le .zip dans l'index Git du commit en cours."""
    files_to_stage = [
        "version.json",
        "index.html",
        "js/app.js",
        "WireMarket.zip",
    ]
    if (ROOT_DIR / "WireMarket.exe").exists():
        files_to_stage.append("WireMarket.exe")
    if (ROOT_DIR / "notification-bell.wav").exists():
        files_to_stage.append("notification-bell.wav")

    subprocess.run(
        ["git", "add", "--"] + files_to_stage,
        cwd=str(ROOT_DIR),
        capture_output=True,
        timeout=10,
    )


def main():
    args = sys.argv[1:]
    mode = "patch"
    explicit_ver = None
    from_hook = "--hook" in args

    if "--major" in args:
        mode = "major"
    elif "--minor" in args:
        mode = "minor"
    elif "--set" in args:
        idx = args.index("--set")
        if idx + 1 < len(args):
            explicit_ver = args[idx + 1].lstrip("vV").strip()

    version_path = ROOT_DIR / "version.json"
    current_ver = "1.6.0"
    if version_path.exists():
        try:
            current_ver = str(
                json.loads(version_path.read_text(encoding="utf-8")).get("version", "1.6.0")
            ).strip()
        except Exception:
            pass

    head_ver = get_head_version()

    if explicit_ver:
        new_ver = explicit_ver
    elif from_hook and head_ver and current_ver != head_ver:
        # Si l'utilisateur a déjà modifié manuellement version.json avant de commiter, on garde sa version
        new_ver = current_ver
    else:
        base_ver = head_ver if (from_hook and head_ver) else current_ver
        new_ver = compute_next_version(base_ver, mode)

    now = datetime.date.today()
    iso_date = now.strftime("%Y-%m-%d")
    fr_date = now.strftime("%d/%m/%Y")

    sync_version_in_files(new_ver, iso_date, fr_date)
    compile_exe_if_needed()
    rebuild_zip()

    if from_hook:
        stage_updated_files()

    print(f"[WireMarket Auto-Version] v{current_ver} -> v{new_ver} ({iso_date}) | WireMarket.zip mis a jour.")


if __name__ == "__main__":
    main()

