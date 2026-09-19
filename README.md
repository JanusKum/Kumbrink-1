# ChartPuls

Kollaboration KI

Eine schlanke, Apple-Stocks-inspirierte Web-App für einen schnellen Überblick
über den Aktienmarkt: die **50 US-Aktien mit der besten Kursentwicklung der
letzten 3 Monate** – Kurs, prozentuale Veränderung und Mini-Chart pro Titel.
Die Daten aktualisieren sich automatisch, es ist kein API-Key und kein
eigener Server nötig.

## Wie es funktioniert

- **Universum:** Die aktuellen S&P-500-Mitglieder werden live aus einem
  offen lizenzierten, laufend gepflegten Datensatz geladen
  ([`datasets/s-and-p-500-companies`](https://github.com/datasets/s-and-p-500-companies)).
  Schlägt das fehl, springt das Skript auf eine lokale Fallback-Liste
  (`scripts/universe-fallback.json`) zurück.
- **Kurse:** Für jeden Titel wird die 3-Monats-Kurshistorie über die
  öffentliche Chart-API von Yahoo Finance abgerufen (kein API-Key nötig).
- **Top 20 wertvollste Unternehmen:** Yahoos Endpunkt für Live-Marktkapitalisierung
  verlangt einen Auth-Crumb, den unauthentifizierte Anfragen nicht bekommen
  (getestet: durchgehend HTTP 401). Statt uns auf eine fragile Umgehung zu
  verlassen, nutzen wir eine manuell kuratierte, öffentlich bekannte Liste der
  größten S&P-500-Unternehmen (`scripts/top20-market-cap.json`) – Kurs und
  Performance für diese Titel sind weiterhin zu 100 % live geladen, nur die
  Auswahl/Reihenfolge der 20 Unternehmen ist kuratiert statt live berechnet.
- **Ranking:** Alle Titel werden nach prozentualer Veränderung (aktueller
  Kurs vs. Kurs vor 3 Monaten) sortiert – daraus entstehen die Top 50
  Performer sowie die stärksten Branchen (Durchschnittsperformance je Sektor,
  mit eigenen Top 10).
- **Startseite:** Zeigt 4 Aktien aus dem Pool der größten 1-Wochen-Kursbewegungen
  (Gewinner und Verlierer, berechnet aus den ohnehin schon geladenen
  3-Monats-Kursdaten, keine zusätzlichen Anfragen) – die dramatischste
  Bewegung der Woche ist garantiert dabei, der Rest wird zufällig aus
  demselben Pool ergänzt – sowie einen Markt-News-Feed von öffentlichen
  RSS-Feeds (CNBC, mit MarketWatch als Fallback) – nur echte Schlagzeilen
  und Bilder mit Link zur Originalquelle, keine erfundenen Zitate oder
  Inhalte.
- **Detailansicht:** Zeigt den Kurs über 5 Zeiträume (1 Tag, 1 Woche, 1 Monat,
  3 Monate, 1 Jahr). Der Chart ist per Maus/Touch scrubbbar – beim Ziehen
  über den Verlauf werden Preis und Zeitpunkt der berührten Stelle live
  angezeigt.
- **Auto-Update:** Ein GitHub-Actions-Workflow
  (`.github/workflows/update-data.yml`) läuft **alle 6 Stunden**, holt die
  frischen Daten, committet `public/data/market.json` und deployt die Seite
  automatisch neu auf GitHub Pages. Kein manuelles Eingreifen nötig.
- **Installierbar (PWA):** Die App lässt sich über „Zum Home-Bildschirm
  hinzufügen“ (iOS/Safari) bzw. „App installieren“ (Android/Chrome) wie
  eine native App installieren – mit eigenem Icon, Standalone-Fenster ohne
  Browserleiste und Offline-Fallback auf die zuletzt geladenen Kurse. Ein
  Service Worker (`vite-plugin-pwa`) aktualisiert sich automatisch im
  Hintergrund bei jedem neuen Deploy.

## Lokale Entwicklung

```bash
npm install
npm run dev          # Dev-Server
npm run fetch-data   # Aktuelle Marktdaten neu berechnen (public/data/market.json)
npm run build         # Produktions-Build nach dist/
```

`public/data/market.json` enthält zu Beginn Platzhalterdaten, damit die App
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
