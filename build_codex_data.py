import urllib.request
import json
import re
import os

BASE_URL = "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/"

def fetch_json(filename):
    url = BASE_URL + filename
    print(f"Fetching {url}...")
    req = urllib.request.Request(url, headers={"User-Agent": "WireMarket-Codex-Builder/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))

def slugify(text):
    text = (text or "").lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")

def clean_text(text):
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", "", str(text))
    return text.strip()

def norm_chance(val):
    if not val:
        return 0.0
    val = float(val)
    if val <= 1.0:
        return round(val * 100.0, 2)
    return round(val, 2)

PART_TRANSLATIONS = {
    "Blueprint": "Schéma Principal",
    "Chassis": "Châssis",
    "Neuroptics": "Neuroptiques",
    "Systems": "Systèmes",
    "Barrel": "Canon",
    "Receiver": "Culasse",
    "Stock": "Crosse",
    "Blade": "Lame",
    "Hilt": "Garde",
    "Handle": "Poignée",
    "Link": "Lien",
    "String": "Corde",
    "Grip": "Prise",
    "Lower Limb": "Branche Inférieure",
    "Upper Limb": "Branche Supérieure",
    "Gauntlet": "Gantelet",
    "Pouch": "Pochette",
    "Stars": "Étoiles",
    "Carapace": "Carapace",
    "Cerebrum": "Cerveau",
    "Harness": "Harnais",
    "Wings": "Ailes",
    "Head": "Tête",
    "Motor": "Moteur",
    "Guard": "Garde",
    "Disc": "Disque",
    "Boot": "Botte",
    "Chain": "Chaîne",
    "Core": "Cœur",
    "Heatsink": "Dissipateur",
    "Ornament": "Ornement",
    "Subcortex": "Subcortex",
    "Band": "Bande",
    "Buckle": "Boucle",
    "Blades": "Lames",
    "Aegis": "Égide"
}

GENERIC_PART_ICONS = {
    "Blueprint": "GenericComponent.png",
    "Chassis": "GenericWarframeChassis.png",
    "Neuroptics": "GenericWarframeHelmet.png",
    "Systems": "GenericWarframeSystems.png",
    "Barrel": "GenericWeaponBarrel.png",
    "Receiver": "GenericWeaponReceiver.png",
    "Stock": "GenericWeaponStock.png",
    "Blade": "GenericWeaponBlade.png",
    "Hilt": "GenericWeaponHilt.png",
    "Handle": "GenericWeaponHilt.png",
    "Link": "GenericComponentLatch.png",
    "String": "GenericGunStock.png",
    "Grip": "GenericWeaponHilt.png",
    "Lower Limb": "GenericWeaponBlade.png",
    "Upper Limb": "GenericWeaponBlade.png",
    "Gauntlet": "GenericWeaponHilt.png",
    "Pouch": "GenericComponentLatch.png",
    "Stars": "GenericWeaponBlade.png",
    "Carapace": "GenericWarframeChassis.png",
    "Cerebrum": "GenericWarframeHelmet.png",
    "Harness": "GenericWarframeChassis.png",
    "Wings": "GenericWarframeSystems.png"
}

INTERNAL_EXCLUDED_NAMES = {
    "entratifragmentbase",
    "entratilabdogtag",
    "genericdojocolorpigment",
    "hexsyndicatedogtag",
    "legendarymodfuser",
    "orofusexf",
    "zarimandogtag",
    "cortichrome"
}

PLANETARY_RESOURCE_GUIDE = {
    "Orokin Cell": {
        "planets": "Saturne, Cérès, Deimos (et Boss : Général Sargas Ruk / Lech Kril)",
        "bestFarm": [
            {"loc": "Saturne - Helene (Défense Grineer)", "chance": 100.0, "rarity": "Très fréquent (Ennemis & Conteneurs)"},
            {"loc": "Cérès - Gabii (Survie Dark Sector +20% Ressources)", "chance": 100.0, "rarity": "Très fréquent (Ennemis & Conteneurs)"},
            {"loc": "Saturne - Tethys (Assassinat Général Sargas Ruk)", "chance": 97.42, "rarity": "Boss + Réseaux de Cellules"},
            {"loc": "Cérès - Exta (Assassinat Lech Kril & Vor)", "chance": 97.42, "rarity": "Double Boss + Conteneurs"}
        ],
        "utility": "Ressource rare essentielle de la Fonderie : indispensable pour fabriquer quasiment toutes les Warframes Prime, les Armes Prime, les Réacteurs/Catalyseurs Orokin et les Formas. Sert aussi aux Sécrétions du Helminth (Synthétiques)."
    },
    "Argon Crystal": {
        "planets": "Néant (Void) uniquement — Ressource instable (se désintègre après 24h UTC)",
        "bestFarm": [
            {"loc": "Néant - Ani / Mot (Survie)", "chance": 100.0, "rarity": "Ennemis du Néant & Dépôts de Pegmatite d'Argon"},
            {"loc": "Néant - Hepit / Ukko (Capture rapide + Caches)", "chance": 100.0, "rarity": "Dépôts de Pegmatite d'Argon"},
            {"loc": "Néant - Taranis (Défense)", "chance": 100.0, "rarity": "Vagues d'ennemis du Néant"}
        ],
        "utility": "Ressource rare du Néant utilisée pour fabriquer de nombreuses Warframes, Armes et l'Incubateur. Attention : les Cristaux d'Argon diminuent de moitié chaque jour à 00h00 UTC. Utile aussi au Helminth (Bile)."
    },
    "Plastids": {
        "planets": "Saturne, Uranus, Phobos, Pluton, Éris",
        "bestFarm": [
            {"loc": "Uranus - Ophelia (Survie)", "chance": 100.0, "rarity": "Ennemis & Carapaces de Plastides (+ Tellure/Polymère)"},
            {"loc": "Saturne - Piscinas (Survie Dark Sector +26% Ressources)", "chance": 100.0, "rarity": "Ennemis & Conteneurs"},
            {"loc": "Phobos - Zeugma (Survie Dark Sector)", "chance": 100.0, "rarity": "Ennemis & Conteneurs"}
        ],
        "utility": "Matériau de fabrication incontournable demandé en centaines ou milliers d'unités pour les châssis/systèmes de Warframes, les armes et les consommables d'escouade. Utile au Helminth (Phéromones)."
    },
    "Neural Sensors": {
        "planets": "Jupiter, Forteresse Kuva",
        "bestFarm": [
            {"loc": "Jupiter - Themisto (Assassinat Alad V)", "chance": 97.42, "rarity": "Boss Alad V (1 à 2 par run d'1 min)"},
            {"loc": "Jupiter - Cameria (Survie Dark Sector +20% Ressources)", "chance": 100.0, "rarity": "Ennemis & Réseaux Neuronaux"},
            {"loc": "Jupiter - Io (Défense)", "chance": 100.0, "rarity": "Vagues Corpus & Conteneurs"}
        ],
        "utility": "Composant rare principalement requis pour fabriquer les Neuroptiques de presque toutes les Warframes ainsi que les Réacteurs/Catalyseurs et Formas. Utile au Helminth (Synthétiques)."
    },
    "Tellurium": {
        "planets": "Uranus (Missions Submersibles) & Toutes les missions Archwing / Railjack",
        "bestFarm": [
            {"loc": "Uranus - Ophelia (Survie Submersible)", "chance": 100.0, "rarity": "Tous les ennemis (avec Nekros/Khora)"},
            {"loc": "Neptune - Salacia (Défense Mobile Archwing)", "chance": 100.0, "rarity": "Ennemis Archwing en masse"},
            {"loc": "Récompense de Connexion Quotidienne", "chance": 25.0, "rarity": "Tribut Quotidien"}
        ],
        "utility": "Métal rare d'origine spatiale requis pour les équipements Archwing, les armes avancées, certaines Warframes (Titania, Wukong, Yareli...) et les recherches de Dojo."
    },
    "Polymer Bundle": {
        "planets": "Uranus, Vénus, Mercure",
        "bestFarm": [
            {"loc": "Uranus - Assur (Survie Dark Sector +26% Ressources)", "chance": 100.0, "rarity": "Ennemis Infestés & Conteneurs"},
            {"loc": "Uranus - Ophelia (Survie)", "chance": 100.0, "rarity": "Ennemis Grineer & Conteneurs"},
            {"loc": "Vénus - Malva (Survie Dark Sector)", "chance": 100.0, "rarity": "Ennemis & Boîtes de Polymère"}
        ],
        "utility": "Indispensable en grande quantité pour fabriquer les Restaurations d'Énergie d'Escouade (x100), les Warframes, les armes et les composants d'Archwing. Utile au Helminth (Synthétiques)."
    },
    "Nitain Extract": {
        "planets": "Boutique des Ondes Nocturnes (Nightwave), Sabotages (Caches), Goules",
        "bestFarm": [
            {"loc": "Ondes Nocturnes - Boutique d'Offrandes (15 Jetons = x5 Nitain)", "chance": 100.0, "rarity": "Achat garanti (Recommandé)"},
            {"loc": "Mises à prix Purge des Goules (Plaines d'Eidolon)", "chance": 5.95, "rarity": "Récompense de Mise à prix"},
            {"loc": "Sabotage du Réacteur (3/3 Caches trouvées)", "chance": 2.0, "rarity": "Rare (Rotation C)"}
        ],
        "utility": "Ressource spéciale requise pour fabriquer plus de 25 Warframes (Vauban Prime, Saryn Prime, Ivara, Wisp...) et de nombreuses armes, ainsi que l'Aura Forma."
    },
    "Oxium": {
        "planets": "Toutes les planètes Corpus (Drones Oxium Osprey)",
        "bestFarm": [
            {"loc": "Jupiter - Io (Défense Corpus)", "chance": 100.0, "rarity": "100% de drop sur chaque Drone Oxium détruit"},
            {"loc": "Pluton - Outer Terminus (Défense Corpus)", "chance": 100.0, "rarity": "100% de drop sur chaque Drone Oxium"},
            {"loc": "Vénus / Neptune - Missions Corpus", "chance": 100.0, "rarity": "Drones Oxium Osprey"}
        ],
        "utility": "Alliage Corpus plus léger que l'air lâché à 100% par les Drones Oxium (tuez-les avant qu'ils ne s'autodétruisent !). Essentiel pour Vauban Prime (7 000 Oxium), Zephyr, le Segment d'Incubateur et les armes Corpus. Utile au Helminth (Oxydes)."
    },
    "Cryotic": {
        "planets": "Toutes les missions d'Excavation (Terre, Vénus, Phobos, Europe, Pluton)",
        "bestFarm": [
            {"loc": "Terre - Everest / Tikal (Excavation)", "chance": 100.0, "rarity": "100 Cryotiques garantis par Excavateur terminé"},
            {"loc": "Pluton - Hieracon (Excavation Dark Sector)", "chance": 100.0, "rarity": "100 Cryotiques par Excavateur + Reliques"},
            {"loc": "Circuit de Duviri / Fissures d'Excavation", "chance": 100.0, "rarity": "100 Cryotiques par Excavateur (+ Bonus Fissure)"}
        ],
        "utility": "Obtenu exclusivement en mission d'Excavation (100 Cryotiques par excavateur complet, 200 avec un Booster de Ressources). Requis en grande quantité pour Sibear (30 000), Vauban Prime (9 000), Trinity Prime (9 000), Frost, Glaxion et le Pyrotic Alloy. Utile au Helminth (Bile)."
    },
    "Gallium": {
        "planets": "Mars, Uranus",
        "bestFarm": [
            {"loc": "Uranus - Ophelia / Assur (Survie)", "chance": 100.0, "rarity": "Ennemis & Dépôts de Gallium"},
            {"loc": "Mars - Wahiba (Survie Dark Sector +20% Ressources)", "chance": 100.0, "rarity": "Ennemis & Conteneurs"},
            {"loc": "Mars - War (Assassinat Lieutenant Lech Kril)", "chance": 97.42, "rarity": "Boss + Conteneurs"}
        ],
        "utility": "Métal rare utilisé dans la fabrication de nombreuses Warframes (Rhino, Frost, Nekros, Nova...) et d'armes Tenno/Corpus. Utile au Helminth (Oxydes)."
    },
    "Morphics": {
        "planets": "Mercure, Mars, Phobos, Europe, Pluton",
        "bestFarm": [
            {"loc": "Mars - War (Assassinat Lech Kril) / Mercure - Tolstoj (Vor)", "chance": 97.42, "rarity": "Boss + Stabilisateurs de Morphics"},
            {"loc": "Mars - Wahiba / Phobos - Memphis (Dark Sector)", "chance": 100.0, "rarity": "Ennemis & Conteneurs"}
        ],
        "utility": "Solide amorphe Orokin requis pour fabriquer les armes de départ et intermédiaires, les Warframes et le Soma/Gorgon. Utile au Helminth (Bile)."
    },
    "Control Module": {
        "planets": "Néant (Void), Europe, Neptune",
        "bestFarm": [
            {"loc": "Néant - Mot / Ani / Taranis", "chance": 100.0, "rarity": "Tombe en très grande quantité sur les ennemis du Néant"},
            {"loc": "Europe - Cholistan / Neptune - Kelashin", "chance": 100.0, "rarity": "Ennemis & Conteneurs"}
        ],
        "utility": "Processeur d'autonomie robotique utilisé pour fabriquer les Systèmes de Warframes, les Sentinelles, les Compagnons MOA et les armes Corpus. Utile au Helminth (Synthétiques)."
    },
    "Rubedo": {
        "planets": "Terre, Lune (Lua), Phobos, Europe, Pluton, Sedna, Néant",
        "bestFarm": [
            {"loc": "Phobos - Zeugma / Terre - Coba (Dark Sector)", "chance": 100.0, "rarity": "Formations de Rubedo & Ennemis"},
            {"loc": "Néant - Toutes les missions", "chance": 100.0, "rarity": "Ennemis & Conteneurs"}
        ],
        "utility": "Minerai cristallin rouge utilisé pour les châssis et systèmes de Warframes et de nombreuses armes. Utile au Helminth (Calx)."
    },
    "Alloy Plate": {
        "planets": "Vénus, Phobos, Cérès, Jupiter, Pluton, Sedna",
        "bestFarm": [
            {"loc": "Cérès - Gabii (Survie Dark Sector +20% Ressources)", "chance": 100.0, "rarity": "Ennemis Grineer & Conteneurs"},
            {"loc": "Vénus - Malva / Sedna - Amarna", "chance": 100.0, "rarity": "Ennemis & Conteneurs"}
        ],
        "utility": "Plaque d'acier renforcée très commune utilisée pour l'armure des Warframes, le Segment de Fonderie Kavat (120 000 Plaques d'Alliage) et les armes. Utile au Helminth (Oxydes)."
    },
    "Ferrite": {
        "planets": "Terre, Mercure, Neptune, Néant (Void), Zariman",
        "bestFarm": [
            {"loc": "Néant - Ani / Mot (Survie)", "chance": 100.0, "rarity": "Ennemis & Dépôts de Ferrite"},
            {"loc": "Mercure - Apollodorus (Survie)", "chance": 100.0, "rarity": "Ennemis & Conteneurs"}
        ],
        "utility": "Métal de base très utilisé dans les schémas d'armes, de Warframes et de consommables (Décodeurs, Restaurations). Utile au Helminth (Oxydes)."
    },
    "Nano Spores": {
        "planets": "Saturne, Neptune, Éris, Deimos",
        "bestFarm": [
            {"loc": "Éris - Akkad / Zabala (Dark Sector Infesté)", "chance": 100.0, "rarity": "Ennemis Infestés en masse"},
            {"loc": "Saturne - Piscinas / Helene", "chance": 100.0, "rarity": "Ennemis & Cultures de Spores"}
        ],
        "utility": "Spores Technocytes utilisées en milliers d'unités pour les Restaurations d'Escouade (Énergie, Santé, Munitions), les armes Infestées et le Helminth (Phéromones)."
    },
    "Salvage": {
        "planets": "Mars, Jupiter, Sedna, Forteresse Kuva",
        "bestFarm": [
            {"loc": "Jupiter - Cameria / Io", "chance": 100.0, "rarity": "Ennemis Corpus & Débris Compactés"},
            {"loc": "Mars - Wahiba (Survie Dark Sector)", "chance": 100.0, "rarity": "Ennemis & Conteneurs"}
        ],
        "utility": "Métaux récupérés utilisés en grande quantité pour fabriquer les armes Grineer/Corpus, les Warframes et alimenter le Helminth (Oxydes)."
    },
    "Circuits": {
        "planets": "Vénus, Cérès, Forteresse Kuva",
        "bestFarm": [
            {"loc": "Cérès - Gabii / Seimeni (Dark Sector)", "chance": 100.0, "rarity": "Ennemis & Boîtiers de Circuits"},
            {"loc": "Vénus - Malva (Survie Dark Sector)", "chance": 100.0, "rarity": "Ennemis & Conteneurs"}
        ],
        "utility": "Composants électroniques nécessaires pour les casques/systèmes de Warframes et les armes énergétiques. Utile au Helminth (Synthétiques)."
    },
    "Hexenon": {
        "planets": "Jupiter (Amalgames & Missions de la Cité Gazière)",
        "bestFarm": [
            {"loc": "Jupiter - Cameria (Survie Dark Sector)", "chance": 100.0, "rarity": "Ennemis de Jupiter & Amalgames"},
            {"loc": "Jupiter - Disruption (Ganymede)", "chance": 7.5, "rarity": "Récompense de Rotation + Ennemis"},
            {"loc": "Jupiter - Ropalolyste / Io", "chance": 100.0, "rarity": "Ennemis Amalgames"}
        ],
        "utility": "Carburant réactif récolté sur Jupiter, indispensable pour fabriquer Wisp (1 200 Hexenon), ainsi que les armes Fulmin, Komorex, Cyanex et l'opérateur."
    },
    "Kuva": {
        "planets": "Forteresse Kuva, Siphons/Déluges à Kuva, Arbitrages, Route de l'Acier, Zariman",
        "bestFarm": [
            {"loc": "Boutique d'Honneurs de la Route de l'Acier (Teshin) / Palladino (Iron Wake)", "chance": 100.0, "rarity": "Échange garanti (35 000 Kuva / sem. chez Palladino)"},
            {"loc": "Zariman - Archimedian Yonta (35 000 Kuva contre 5 Plumes du Néant Pinion)", "chance": 100.0, "rarity": "Échange hebdomadaire"},
            {"loc": "Survie Kuva (Taveuni - Forteresse Kuva) / Déluges à Kuva", "chance": 100.0, "rarity": "200 Kuva par capsule + 1 200 par Déluge"}
        ],
        "utility": "Fluide écarlate Orokin utilisé principalement pour recycler (Reroll) les Mods Riven jusqu'à obtenir des statistiques parfaites (God Roll), ainsi que pour fabriquer Nidus, Harrow, Octavia, Gara et certaines armes (Zarr, Kesheg, Orvius)."
    },
    "Entrati Lanthorn": {
        "planets": "Zariman Ten-Zero & Laboratoires d'Albrecht (Deimos - Sanctum Anatomica)",
        "bestFarm": [
            {"loc": "Deimos - Sanctum Anatomica (Élimination des Nécramites / Gruzzlings)", "chance": 35.0, "rarity": "Nécramites, Gruzzlings & Mises à prix"},
            {"loc": "Zariman - Mises à prix & Extermination (Halako Perimeter)", "chance": 15.0, "rarity": "Récompenses de Mise à prix & Conteneurs"}
        ],
        "utility": "Balise cérémonielle Entrati requise pour monter de rang auprès des Irréductibles (Holdfasts) du Zariman, et pour fabriquer Gyre, Voruna, Qorvex, Dante et les armes Incarnon (Phenmor, Laetum, Praedos, Innodem, Felarx)."
    },
    "Aya": {
        "planets": "Mises à prix des Mondes Ouverts (Cetus, Fortuna, Deimos) & Packs de Reliques",
        "bestFarm": [
            {"loc": "Deimos (Puy de Cambion) - Mise à prix Niveau 40-60 (Brute Force)", "chance": 33.0, "rarity": "25% à 50% par étape de Mise à prix"},
            {"loc": "Fortuna (Vallée Orbis) / Cetus - Mises à prix Niveau 40-60", "chance": 28.0, "rarity": "Étapes de Mise à prix"}
        ],
        "utility": "Mémoire Orokin échangeable auprès de Varzia (Bazar de Maroo sur Mars ou directement depuis le Marché) contre des Reliques Prime Vaultées de la Résurgence Prime !"
    },
    "Forma": {
        "planets": "Reliques du Néant (Fissures), Ondes Nocturnes, Lua (Énigmes Musicales Octavia), Peste Étoilée",
        "bestFarm": [
            {"loc": "Fissures du Néant — Ouverture de Reliques Lith / Meso / Neo / Axi", "chance": 25.33, "rarity": "Schéma de Forma (Commun / Inhabituel)"},
            {"loc": "Lua - Plato / Copernicus (Salle secrète de l'Énigme Musicale Orokin)", "chance": 12.5, "rarity": "Forma déjà construit dans le conteneur"},
            {"loc": "Événement Peste Étoilée (Plaines d'Eidolon - Nakak)", "chance": 100.0, "rarity": "Forma construit contre 3 000 Réputation"}
        ],
        "utility": "Matériau Orokin indispensable pour polariser un emplacement de Mod sur une Warframe, une Arme ou un Compagnon (réduit de moitié le drain du Mod) et pour fabriquer toutes les armes de Dojo (Kuva, Tenet, Clan) ainsi que l'Exilus Adapter."
    }
}

def main():
    fr_map = fetch_json("i18n/fr.json")
    res_raw = fetch_json("Resources.json")
    misc_raw = fetch_json("Misc.json")
    comps_raw = fetch_json("Components.json")
    wf_raw = fetch_json("Warframes.json")
    prim_raw = fetch_json("Primary.json")
    sec_raw = fetch_json("Secondary.json")
    melee_raw = fetch_json("Melee.json")
    mods_raw = fetch_json("Mods.json")
    relics_raw = fetch_json("Relics.json")

    # Index Components, Resources, Misc, Warframes, and Weapons by uniqueName (preferring entries with imageName)
    comp_by_uname = {}
    for source_list in (comps_raw, res_raw, misc_raw, wf_raw, prim_raw, sec_raw, melee_raw):
        for c in source_list:
            u = c.get("uniqueName")
            if not u:
                continue
            prev = comp_by_uname.get(u)
            if not prev or (not prev.get("imageName") and c.get("imageName")):
                comp_by_uname[u] = c

    # Process Relics
    relics = []
    seen_rel = set()
    for rel in relics_raw:
        en_name = (rel.get("name") or "").strip()
        if not en_name.endswith(" Intact"):
            continue
        clean_en = en_name[:-7].strip()
        slug = slugify(clean_en)
        if not slug or slug in seen_rel:
            continue
        seen_rel.add(slug)

        uname = rel.get("uniqueName") or ""
        fr_info = fr_map.get(uname) or {}
        name_fr = clean_text(fr_info.get("name") or clean_en)
        name_fr = re.sub(r"\s*\(Intacte\)\s*$", "", name_fr, flags=re.IGNORECASE).strip()

        era = clean_en.split(" ")[0] if " " in clean_en else "Relic"
        raw_drops = rel.get("drops") or rel.get("locations") or []
        is_vaulted = bool(rel.get("vaulted")) and len(raw_drops) == 0

        rewards_out = []
        for rw in (rel.get("rewards") or []):
            item_obj = rw.get("item") or {}
            rw_uname = item_obj.get("uniqueName") or ""
            rw_fr = fr_map.get(rw_uname) or {}
            rw_en = (item_obj.get("name") or "").strip()
            rw_name_fr = clean_text(rw_fr.get("name") or rw_en)
            chance = round(rw.get("chance") or 0, 2)
            if chance >= 20:
                tier = "Commun (Bronze)"
                rad_chance = 16.67
            elif chance >= 10:
                tier = "Inhabituel (Argent)"
                rad_chance = 20.0
            else:
                tier = "Rare (Or)"
                rad_chance = 10.0

            rewards_out.append({
                "name": rw_name_fr,
                "en": rw_en,
                "tier": tier,
                "chance": chance,
                "radChance": rad_chance
            })

        rewards_out.sort(key=lambda x: x["chance"], reverse=True)

        drops_out = []
        sorted_drops = sorted(raw_drops, key=lambda d: d.get("chance") or 0, reverse=True)
        for d in sorted_drops[:20]:
            drops_out.append({
                "loc": d.get("location") or "",
                "chance": norm_chance(d.get("chance")),
                "rarity": d.get("rarity") or ""
            })

        relics.append({
            "id": slug,
            "name": name_fr,
            "en": clean_en,
            "era": era,
            "img": rel.get("imageName") or "LithRelicIntact.png",
            "vaulted": is_vaulted,
            "tradable": bool(rel.get("tradable", True)),
            "rewards": rewards_out,
            "drops": drops_out
        })

    era_order = {"Lith": 0, "Meso": 1, "Neo": 2, "Axi": 3, "Requiem": 4, "Vanguard": 5}
    relics.sort(key=lambda x: (0 if not x["vaulted"] else 1, era_order.get(x["era"], 9), x["en"].lower()))

    # Reverse crafting index
    used_for_by_uname = {}
    used_for_by_name = {}
    items_by_en_lower = {}

    def resolve_component_details(comp):
        c_uname = comp.get("uniqueName") or ""
        ref = comp_by_uname.get(c_uname) or {}
        # Prefer ref.get("name") when comp.get("name") is missing or is an internal class name
        c_en = (ref.get("name") or comp.get("name") or "").strip()
        if not c_en and c_uname:
            if c_uname.endswith("Blueprint"):
                c_en = "Blueprint"
            elif c_uname.endswith("ChassisComponent") or c_uname.endswith("Chassis"):
                c_en = "Chassis"
            elif c_uname.endswith("HelmetComponent") or c_uname.endswith("Neuroptics"):
                c_en = "Neuroptics"
            elif c_uname.endswith("SystemsComponent") or c_uname.endswith("Systems"):
                c_en = "Systems"
            else:
                c_en = c_uname.split("/")[-1]

        if c_en in PART_TRANSLATIONS:
            c_name_fr = PART_TRANSLATIONS[c_en]
        else:
            c_fr = fr_map.get(c_uname) or {}
            raw_fr = clean_text(c_fr.get("name") or "")
            c_name_fr = raw_fr if (raw_fr and not raw_fr.startswith("-")) else c_en

        c_img = comp.get("imageName") or ref.get("imageName") or GENERIC_PART_ICONS.get(c_en, "GenericComponent.png")
        if c_en == "Forma":
            c_img = "Forma.png"
        elif c_en == "Kuva":
            c_img = "Kuva.png"

        raw_drops = comp.get("drops") or ref.get("drops") or []

        seen_locs = set()
        c_drops = []
        for d in raw_drops:
            loc = (d.get("location") or "").strip()
            if not loc:
                continue
            if any(q in loc for q in ("(Exceptional)", "(Flawless)", "(Radiant)")):
                base_loc = re.sub(r"\s*\((?:Exceptional|Flawless|Radiant)\)\s*", "", loc).strip()
                if base_loc in seen_locs:
                    continue
            seen_locs.add(loc)
            c_drops.append({
                "part": c_name_fr,
                "loc": loc,
                "chance": norm_chance(d.get("chance")),
                "rarity": d.get("rarity") or ""
            })

        return c_uname, c_en, c_name_fr, c_img, c_drops

    def register_craft_user(parent_id, parent_cat, parent_name_fr, parent_img, components):
        if not components:
            return
        for comp in components:
            c_uname, c_en, c_name_fr, c_img, _ = resolve_component_details(comp)
            c_count = comp.get("itemCount") or 1
            if c_en in PART_TRANSLATIONS:
                continue
            entry = {
                "id": parent_id,
                "cat": parent_cat,
                "name": parent_name_fr,
                "count": c_count,
                "img": parent_img
            }
            if c_uname:
                used_for_by_uname.setdefault(c_uname, []).append(entry)
            if c_en:
                used_for_by_name.setdefault(c_en.lower(), []).append(entry)

    # Process Warframes
    warframes = []
    seen_wf = set()
    for w in wf_raw:
        en_name = (w.get("name") or "").strip()
        slug = slugify(en_name)
        if not slug or slug in seen_wf:
            continue
        seen_wf.add(slug)

        uname = w.get("uniqueName") or ""
        fr_info = fr_map.get(uname) or {}
        name_fr = clean_text(fr_info.get("name") or en_name)
        desc_fr = clean_text(fr_info.get("description") or w.get("description") or "")
        passive_fr = clean_text(fr_info.get("passiveDescription") or w.get("passiveDescription") or "")
        img = w.get("imageName") or ""

        # Use the dedicated Helminth image uploaded by the user!
        if slug == "helminth":
            img = "helminth.jpg"
            if not desc_fr:
                desc_fr = "Le Helminth réside dans l'Infirmerie de votre Orbiteur. Il permet d'assimiler (subsumer) les Warframes standards pour infuser leurs compétences sur n'importe quelle autre Warframe, d'installer des Fragments d'Archonte et de débloquer 13 compétences exclusives du Helminth."

        items_by_en_lower[en_name.lower()] = {"id": slug, "cat": "warframes", "name": name_fr, "count": 1, "img": img}
        register_craft_user(slug, "warframes", name_fr, img, w.get("components"))

        fr_abs_map = {}
        for fa in (fr_info.get("abilities") or []):
            if fa.get("abilityUniqueName"):
                fr_abs_map[fa["abilityUniqueName"]] = fa
        abilities = []
        for ab in (w.get("abilities") or []):
            au = ab.get("uniqueName") or ""
            fa = fr_abs_map.get(au) or {}
            abilities.append({
                "name": clean_text(fa.get("abilityName") or ab.get("name") or ""),
                "desc": clean_text(fa.get("description") or ab.get("description") or ""),
                "img": ab.get("imageName") or ""
            })

        comps_out = []
        all_drops = []
        for comp in (w.get("components") or []):
            c_uname, c_en, c_name_fr, c_img, c_drops = resolve_component_details(comp)
            all_drops.extend(c_drops[:8])
            comps_out.append({
                "name": c_name_fr,
                "en": c_en,
                "resSlug": slugify(c_en) if c_en not in PART_TRANSLATIONS else "",
                "count": comp.get("itemCount") or 1,
                "img": c_img,
                "drops": c_drops[:8]
            })

        for d in (w.get("drops") or [])[:12]:
            all_drops.append({
                "part": name_fr,
                "loc": d.get("location") or "",
                "chance": norm_chance(d.get("chance")),
                "rarity": d.get("rarity") or ""
            })

        warframes.append({
            "id": slug,
            "name": name_fr,
            "en": en_name,
            "img": img,
            "desc": desc_fr,
            "prime": bool(w.get("isPrime") or "Prime" in en_name),
            "vaulted": bool(w.get("vaulted")),
            "mr": w.get("masteryReq") or 0,
            "hp": w.get("health") or 0,
            "sh": w.get("shield") or 0,
            "ar": w.get("armor") or 0,
            "enMax": w.get("power") or 0,
            "spd": w.get("sprintSpeed") or 1.0,
            "aura": w.get("aura") or "",
            "pol": w.get("polarities") or [],
            "passive": passive_fr,
            "abilities": abilities,
            "components": comps_out,
            "drops": all_drops[:30]
        })

    warframes.sort(key=lambda x: x["name"].lower())

    # Process Weapons
    weapons = []
    seen_wp = set()
    weapon_sources = [
        ("Principale", "primary", prim_raw),
        ("Secondaire", "secondary", sec_raw),
        ("Mêlée", "melee", melee_raw)
    ]
    for slot_label, slot_key, raw_list in weapon_sources:
        for wp in raw_list:
            en_name = (wp.get("name") or "").strip()
            slug = slugify(en_name)
            if not slug or slug in seen_wp:
                continue
            seen_wp.add(slug)

            uname = wp.get("uniqueName") or ""
            fr_info = fr_map.get(uname) or {}
            name_fr = clean_text(fr_info.get("name") or en_name)
            desc_fr = clean_text(fr_info.get("description") or wp.get("description") or "")
            img = wp.get("imageName") or ""

            items_by_en_lower[en_name.lower()] = {"id": slug, "cat": "weapons", "name": name_fr, "count": 1, "img": img}
            register_craft_user(slug, "weapons", name_fr, img, wp.get("components"))

            comps_out = []
            all_drops = []
            for comp in (wp.get("components") or []):
                c_uname, c_en, c_name_fr, c_img, c_drops = resolve_component_details(comp)
                all_drops.extend(c_drops[:6])
                comps_out.append({
                    "name": c_name_fr,
                    "en": c_en,
                    "resSlug": slugify(c_en) if c_en not in PART_TRANSLATIONS else "",
                    "count": comp.get("itemCount") or 1,
                    "img": c_img,
                    "drops": c_drops[:6]
                })

            for d in (wp.get("drops") or [])[:12]:
                all_drops.append({
                    "part": name_fr,
                    "loc": d.get("location") or "",
                    "chance": norm_chance(d.get("chance")),
                    "rarity": d.get("rarity") or ""
                })

            weapons.append({
                "id": slug,
                "name": name_fr,
                "en": en_name,
                "img": img,
                "desc": desc_fr,
                "slot": slot_key,
                "slotLabel": slot_label,
                "type": wp.get("type") or slot_label,
                "prime": bool(wp.get("isPrime") or "Prime" in en_name),
                "vaulted": bool(wp.get("vaulted")),
                "tradable": bool(wp.get("tradable")),
                "mr": wp.get("masteryReq") or 0,
                "cc": round((wp.get("criticalChance") or 0) * 100, 1),
                "cd": round(wp.get("criticalMultiplier") or 0, 1),
                "sc": round((wp.get("procChance") or 0) * 100, 1),
                "fr": round(wp.get("fireRate") or 0, 2),
                "dmg": round(wp.get("totalDamage") or 0, 1),
                "disp": wp.get("omegaAttenuation") or wp.get("disposition") or 1,
                "components": comps_out,
                "drops": all_drops[:25]
            })

    weapons.sort(key=lambda x: x["name"].lower())

    # Process Resources (sort candidates so entries WITH imageName come before StoreItems without imageName)
    resources = []
    seen_res = set()
    combined_res_raw = list(res_raw)
    for m in misc_raw:
        m_type = m.get("type") or ""
        m_uname = m.get("uniqueName") or ""
        m_name = (m.get("name") or "").strip()
        if m_type in ("Resource", "Alloy", "Cut Gem", "Fish Part", "Eidolon Shard", "Ayatan Star", "Ayatan Sculpture", "Pet Resource") or (m_uname in used_for_by_uname) or (m_name.lower() in used_for_by_name):
            combined_res_raw.append(m)

    combined_res_raw.sort(key=lambda r: (0 if r.get("imageName") else 1, 0 if not str(r.get("uniqueName") or "").startswith("/Lotus/StoreItems/") else 1))

    for r in combined_res_raw:
        en_name = (r.get("name") or "").strip()
        if not en_name:
            continue
        low_en = en_name.lower()
        if low_en in INTERNAL_EXCLUDED_NAMES:
            continue
        if " " not in en_name and any(x in low_en for x in ("bundle", "endo", "storeitem", "rawmelee", "rawpistol", "rawrifle", "rawshotgun", "rawmodular", "autoshared", "dogtag", "pigment", "fragmentbase", "modfuser")):
            continue
        if low_en.startswith("<archwing>"):
            continue

        slug = slugify(en_name)
        if not slug or slug in seen_res:
            continue

        uname = r.get("uniqueName") or ""
        fr_info = fr_map.get(uname) or {}
        name_fr = clean_text(fr_info.get("name") or en_name)
        desc_fr = clean_text(fr_info.get("description") or r.get("description") or "")
        img = r.get("imageName") or ""
        if en_name == "Forma":
            img = "Forma.png"
        elif en_name == "Kuva":
            img = "Kuva.png"
        if not img:
            continue

        seen_res.add(slug)

        uf_raw = list(used_for_by_uname.get(uname, [])) + list(used_for_by_name.get(low_en, []))
        parents_names = []
        for p in (r.get("parents") or []):
            if p.startswith("<") or "Skin" in p or "Helmet" in p:
                continue
            p_clean = re.sub(r"\s+(?:Chassis|Neuroptics|Systems|Blueprint|Barrel|Receiver|Stock|Blade|Hilt)$", "", p).strip()
            matched_item = items_by_en_lower.get(p.lower()) or items_by_en_lower.get(p_clean.lower())
            if matched_item:
                uf_raw.append(matched_item)
            else:
                parents_names.append(p)

        uf_seen = set()
        used_for = []
        for u in uf_raw:
            if u["id"] not in uf_seen:
                uf_seen.add(u["id"])
                used_for.append(u)

        drops_out = []
        guide = PLANETARY_RESOURCE_GUIDE.get(en_name)
        if guide:
            for bf in guide.get("bestFarm", []):
                drops_out.append({
                    "loc": bf["loc"],
                    "chance": bf["chance"],
                    "rarity": bf["rarity"]
                })

        for d in (r.get("drops") or [])[:25]:
            drops_out.append({
                "loc": d.get("location") or "",
                "chance": norm_chance(d.get("chance")),
                "rarity": d.get("rarity") or ""
            })

        planets_hint = guide["planets"] if guide else ""
        if not planets_hint and desc_fr:
            m_loc = re.search(r"(?:Lieu|Location|Emplacement)\s*:\s*([^\n]+)", desc_fr, re.IGNORECASE)
            if m_loc:
                planets_hint = m_loc.group(1).strip()

        resources.append({
            "id": slug,
            "name": name_fr,
            "en": en_name,
            "img": img,
            "desc": desc_fr,
            "type": r.get("type") or "Resource",
            "tradable": bool(r.get("tradable")),
            "planets": planets_hint,
            "utility": guide["utility"] if guide else "",
            "drops": drops_out[:25],
            "totalUsedFor": len(used_for),
            "usedFor": used_for[:80],
            "parents": parents_names[:30]
        })

    resources.sort(key=lambda x: (0 if x["en"] in PLANETARY_RESOURCE_GUIDE else (1 if x["totalUsedFor"] > 0 else 2), x["name"].lower()))

    # Process Mods
    mods_by_slug = {}
    for m in mods_raw:
        en_name = (m.get("name") or "").strip()
        if not en_name or en_name.startswith("Riven") or "Riven Mod" in en_name:
            continue
        uname = m.get("uniqueName") or ""
        if "/Beginner/" in uname or "/Intermediate/" in uname or "/PvP" in uname:
            continue
        if not m.get("imageName"):
            continue
        slug = slugify(en_name)
        if not slug:
            continue

        fusion = m.get("fusionLimit") or 0
        drops_len = len(m.get("drops") or [])
        prev = mods_by_slug.get(slug)
        if prev and (prev["_fusion"] > fusion or (prev["_fusion"] == fusion and prev["_drops_len"] >= drops_len)):
            continue

        fr_info = fr_map.get(uname) or {}
        name_fr = clean_text(fr_info.get("name") or en_name)

        stats_max = []
        fr_lstats = fr_info.get("levelStats") or []
        en_lstats = m.get("levelStats") or []
        if fr_lstats and isinstance(fr_lstats[-1], dict):
            stats_max = [clean_text(s) for s in (fr_lstats[-1].get("stats") or []) if s]
        elif en_lstats and isinstance(en_lstats[-1], dict):
            stats_max = [clean_text(s) for s in (en_lstats[-1].get("stats") or []) if s]
        if not stats_max and m.get("description"):
            stats_max = [clean_text(m.get("description"))]

        drops_out = []
        sorted_drops = sorted(m.get("drops") or [], key=lambda d: d.get("chance") or 0, reverse=True)
        for d in sorted_drops[:20]:
            drops_out.append({
                "loc": d.get("location") or "",
                "chance": norm_chance(d.get("chance")),
                "rarity": d.get("rarity") or ""
            })

        mods_by_slug[slug] = {
            "id": slug,
            "name": name_fr,
            "en": en_name,
            "img": m.get("imageName") or "",
            "type": m.get("type") or "Mod",
            "compat": m.get("compatName") or "",
            "pol": m.get("polarity") or "",
            "rarity": m.get("rarity") or "Common",
            "drain": m.get("baseDrain") or 0,
            "maxRank": fusion,
            "tradable": bool(m.get("tradable")),
            "stats": stats_max,
            "drops": drops_out,
            "_fusion": fusion,
            "_drops_len": drops_len
        }

    mods = []
    for k, v in mods_by_slug.items():
        v.pop("_fusion", None)
        v.pop("_drops_len", None)
        mods.append(v)
    mods.sort(key=lambda x: x["name"].lower())

    dataset = {
        "resources": resources,
        "warframes": warframes,
        "weapons": weapons,
        "mods": mods,
        "relics": relics
    }

    os.makedirs("js", exist_ok=True)
    out_path = os.path.join("js", "codex-data.js")
    json_str = json.dumps(dataset, ensure_ascii=False, separators=(",", ":"))
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("// Auto-generated Warframe Codex & Farming Database for WireMarket\n")
        f.write("window.WM_CODEX_DATA = ")
        f.write(json_str)
        f.write(";\n")

    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"Done! Wrote {out_path} ({size_mb:.2f} MB)")
    print(f"Counts -> Resources: {len(resources)}, Warframes: {len(warframes)}, Weapons: {len(weapons)}, Mods: {len(mods)}, Relics: {len(relics)}")

if __name__ == "__main__":
    main()
