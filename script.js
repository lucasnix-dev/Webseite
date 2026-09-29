// ---- CONFIG -------------------------------------------------------
// Deine Discord User-ID (Entwicklermodus an -> Rechtsklick auf deinen
// Namen -> "ID kopieren"). Wird für das Discord-Widget gebraucht.
const DISCORD_USER_ID = "REPLACE_WITH_YOUR_DISCORD_ID";
// ---------------------------------------------------------------------

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---- Sound-Toggle für den Hintergrund -------------------------
const soundBtn = document.getElementById("soundToggle");
const bgSound = document.getElementById("bgSound");
if (soundBtn && bgSound) {
  let soundOn = false;
  const label = soundBtn.querySelector(".sound-label");
  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    if (soundOn) {
      bgSound.volume = 0.4;
      bgSound.play().catch(() => {});
      if (label) label.textContent = "Sound ausmachen";
    } else {
      bgSound.pause();
      if (label) label.textContent = "Sound anmachen";
    }
  });
}

// ---- Spotify (über die eigene /api/spotify Serverless-Function) ---
async function loadSpotify() {
  const value = document.getElementById("spotifyValue");
  if (!value) return;
  try {
    const res = await fetch("/api/spotify");
    const data = await res.json();

    if (!data.isPlaying) {
      value.textContent = "Gerade nichts aktiv";
      value.className = "status-value val-offline";
      return;
    }

    value.className = "status-value val-active";
    value.textContent = `${data.title} — ${data.artist}`;
  } catch (e) {
    value.textContent = "Nicht erreichbar";
    value.className = "status-value val-offline";
  }
}

// ---- Discord (über Lanyard's öffentliche API, kein Backend nötig) -
async function loadDiscord() {
  const value = document.getElementById("discordValue");
  const sub = document.getElementById("discordSub");
  const pip = document.getElementById("discordPip");
  if (!value) return;

  if (!DISCORD_USER_ID || DISCORD_USER_ID.startsWith("REPLACE")) {
    value.textContent = "Nicht konfiguriert";
    value.className = "status-value val-offline";
    return;
  }

  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
    const json = await res.json();
    if (!json.success) throw new Error("lanyard error");
    const d = json.data;

    const statusMap = {
      online: { label: "Online", cls: "val-online", pip: "pip-online" },
      idle: { label: "Abwesend", cls: "val-idle", pip: "pip-idle" },
      dnd: { label: "Beschäftigt", cls: "val-dnd", pip: "pip-dnd" },
      offline: { label: "Offline", cls: "val-offline", pip: "pip-offline" },
    };
    const s = statusMap[d.discord_status] || statusMap.offline;

    value.textContent = s.label;
    value.className = `status-value ${s.cls}`;
    if (pip) pip.className = `pip ${s.pip}`;

    const activity = (d.activities || []).find(a => a.type !== 4 && a.name !== "Spotify");
    if (sub) sub.textContent = activity ? `Aktiv: ${activity.name}` : "";
  } catch (e) {
    value.textContent = "Nicht erreichbar";
    value.className = "status-value val-offline";
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

loadSpotify();
loadDiscord();
setInterval(loadSpotify, 30000); // alle 30s
setInterval(loadDiscord, 20000); // alle 20s
