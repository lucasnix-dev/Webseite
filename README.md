# Persönliche Seite — Discord-Moderator / Communities

Home, Projekte, Socials, Kontakt, Tools — mit GIF-Hintergrund,
Sound-Button, Profil-Card mit Live-Discord- und Live-Spotify-Status, und
einem Communities-Bereich für Server, in denen du Mod/Admin bist.

## Struktur

```
site/
├── index.html        Home: Hero, Profil-Card (Discord/Spotify live), Communities
├── projekte.html      Grid für eigene Projekte/Bots
├── socials.html         Discord/Twitch/Instagram als Karten
├── kontakt.html          Kontakt: Discord + E-Mail
├── tools.html             Tool-Übersicht (Front-End-Vorlage, siehe unten)
├── login.html              Login-Vorlage für "Zugang erforderlich"
├── style.css
├── script.js              Sound-Toggle, Spotify-Fetch, Discord/Lanyard-Fetch
├── api/
│   └── spotify.js          Serverless Function für den Spotify-Token-Refresh
└── assets/                 hier kommen deine eigenen Dateien rein
```

## Wichtig: Tools/Login sind nur die Optik

`tools.html` und `login.html` sehen genauso aus wie bei zsimonn.de, sind
aber **nur die Vorderseite** — kein echtes Login, kein echter Datei-Upload.
Um daraus etwas Funktionierendes zu machen (Benutzerkonten, Datei-Hosting,
QR-Code-Erzeugung, Short-Links), bräuchtest du eine echte Backend-Logik
(z. B. eine kleine Datenbank + Auth über Vercel/Serverless-Functions, oder
einen Dienst wie Supabase). Sag Bescheid, wenn du das als nächsten Schritt
willst — das ist ein eigenes, größeres Stück Arbeit.

## 1. Eigene Inhalte eintragen

Alle Platzhalter durchsuchen und ersetzen (in allen HTML-Dateien):
- `DEIN NAME` → dein Discord-Name
- die `#`-Links bei Discord/Twitch/Instagram-Buttons
- bei den Community-Karten: `SERVER NAME`, die Rolle (z. B. "Head-Admin"),
  und den `#`-Link auf den jeweiligen Server-Invite
- bei `projekte.html`: `PROJEKT NAME` + Beschreibung + Tags
- `mail@example.de` in `kontakt.html`

## 2. Eigene Medien einbinden (assets/)

Lege deine eigenen Dateien im Ordner `assets/` ab, mit genau diesen Namen
(oder passe die Pfade in den HTML-Dateien an):

- `assets/background.gif` — das Loop-GIF im Hintergrund (läuft auf allen
  Seiten gedimmt im Hintergrund). Falls dir die Dateigröße eines GIFs zu
  groß wird: ein kurzes `.mp4` ist meist deutlich kleiner — dazu in jeder
  HTML-Datei den `<img class="bg-gif" src="assets/background.gif">` durch
  `<video autoplay muted loop playsinline><source src="assets/background.mp4" type="video/mp4"></video>`
  ersetzen (sieht optisch identisch aus, lädt aber schneller).
- `assets/sound.mp3` — der Ton für den "Sound anmachen"-Button
- `assets/avatar.jpg` — dein Profilbild (Nav oben links + Profil-Card)
- `assets/community-1.jpg` bis `community-4.jpg` — Bilder für die
  Community-Karten (einfach mehr/weniger `<article class="community-card">`
  Blöcke in `index.html` kopieren/löschen, wenn du mehr oder weniger
  Server hast)

## 3. Discord-Widget einrichten (Lanyard)

1. Trete dem [Lanyard Discord-Server](https://discord.gg/lanyard) bei — Lanyard
   beobachtet deine Präsenz nur, solange du auf diesem Server bist.
2. Aktiviere in Discord den Entwicklermodus (Einstellungen → Erweitert →
   Entwicklermodus), dann Rechtsklick auf deinen eigenen Namen → "ID kopieren".
3. Trage diese ID in `script.js` bei `DISCORD_USER_ID` ein.

Keine weiteren Zugangsdaten nötig, Lanyard ist öffentlich lesbar.

## 4. Spotify-Widget einrichten

1. Lege eine App im [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   an. Trage als Redirect-URI `https://example.com/callback` ein.
2. Notiere dir **Client ID** und **Client Secret** der App.
3. Hole dir einmalig einen **Refresh Token** über den Authorization-Code-Flow:
   - Öffne im Browser (Client ID + Redirect-URI ersetzen):
     ```
     https://accounts.spotify.com/authorize?client_id=DEINE_CLIENT_ID&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-currently-playing%20user-read-recently-played
     ```
   - Kopiere den `code`-Wert aus der Redirect-URL.
   - Tausche ihn gegen einen Refresh Token:
     ```
     curl -X POST https://accounts.spotify.com/api/token \
       -H "Authorization: Basic BASE64(client_id:client_secret)" \
       -d grant_type=authorization_code \
       -d code=DEIN_CODE \
       -d redirect_uri=https://example.com/callback
     ```
4. Trage in Vercel als Environment Variables ein:
   `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`.

## 5. Hosting + Domain an einem Ort: Vercel (empfohlen)

- Hosting: kostenloser Hobby-Plan reicht komplett aus (0 €/Monat).
- Domain: unter Project → Settings → Domains → "Buy" direkt bei Vercel
  kaufen (z. B. `.gg`, `.me`, `.dev`), meist 10–20 €/Jahr — passt locker
  in dein 5 €/Monat-Budget, alles an einer Stelle.

**Deploy-Schritte:**
1. Repo (diesen Ordner, inkl. `assets/`) auf GitHub pushen.
2. Auf [vercel.com](https://vercel.com) mit GitHub einloggen → "Add New Project"
   → Repo auswählen → Deploy (kein Build-Step nötig, reines HTML/JS).
3. Unter Project → Settings → Environment Variables die drei Spotify-Variablen
   eintragen, danach einmal neu deployen.
4. Unter Project → Settings → Domains deine Domain kaufen/verbinden.

## 6. Lokal testen

```
npm i -g vercel
vercel dev
```

Startet die Seite inklusive `/api/spotify` lokal unter `http://localhost:3000`.
