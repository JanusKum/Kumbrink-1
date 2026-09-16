# Top 50 · Aktien der letzten 3 Monate

Kollaboration KI

Eine schlanke, Apple-Stocks-inspirierte Web-App, die immer die **50 US-Aktien
mit der besten Kursentwicklung der letzten 3 Monate** anzeigt – Kurs,
prozentuale Veränderung und Mini-Chart pro Titel. Die Daten aktualisieren
sich automatisch, es ist kein API-Key und kein eigener Server nötig.

## Wie es funktioniert

- **Universum:** Die aktuellen S&P-500-Mitglieder werden live aus einem
  offen lizenzierten, laufend gepflegten Datensatz geladen
  ([`datasets/s-and-p-500-companies`](https://github.com/datasets/s-and-p-500-companies)).
  Schlägt das fehl, springt das Skript auf eine lokale Fallback-Liste
  (`scripts/universe-fallback.json`) zurück.
- **Kurse:** Für jeden Titel wird die 3-Monats-Kurshistorie über die
  öffentliche Chart-API von Yahoo Finance abgerufen (kein API-Key nötig).
- **Ranking:** Alle Titel werden nach prozentualer Veränderung (aktueller
  Kurs vs. Kurs vor 3 Monaten) sortiert, die Top 50 werden veröffentlicht.
- **Auto-Update:** Ein GitHub-Actions-Workflow
  (`.github/workflows/update-data.yml`) läuft **alle 6 Stunden**, holt die
  frischen Daten, committet `public/data/top50.json` und deployt die Seite
  automatisch neu auf GitHub Pages. Kein manuelles Eingreifen nötig.

## Lokale Entwicklung

```bash
npm install
npm run dev          # Dev-Server
npm run fetch-data   # Aktuelle Top-50-Daten neu berechnen (public/data/top50.json)
npm run build         # Produktions-Build nach dist/
```

`public/data/top50.json` enthält zu Beginn Platzhalterdaten, damit die App
sofort lauffähig ist. Der Workflow ersetzt sie beim ersten Lauf durch echte
Marktdaten.

## Deployment (GitHub Pages)

1. In den Repository-Einstellungen unter **Settings → Pages** als Quelle
   **„GitHub Actions“** auswählen.
2. Den Branch `main` als Standard-Branch pushen/mergen – der Workflow
   `update-data.yml` baut und veröffentlicht die Seite automatisch bei jedem
   Push auf `main`, alle 6 Stunden und bei manuellem Start
   („Run workflow“ im Actions-Tab).
3. Falls die App unter einem anderen Pfad als `/Kumbrink-1/` läuft (z. B.
   Vercel/Netlify unter `/`), `VITE_BASE_PATH=/` beim Build setzen.

## Hinweise

- Kursdaten stammen von Yahoo Finance und dienen nur der Information –
  keine Anlageberatung, keine Gewährleistung für Richtigkeit oder
  Aktualität.
- Die S&P-500-Liste ändert sich gelegentlich (Index-Umstellungen); das
  Live-Universum bildet den jeweils aktuellen Stand möglichst genau ab.
