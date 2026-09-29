// Vercel serverless function: /api/spotify
// Reads the currently-playing (or, if nothing is playing, the
// most recently played) track from Spotify, using a long-lived
// refresh token stored as an environment variable so the client
// never sees your Spotify credentials.
//
// Required environment variables (set them in Vercel -> Project ->
// Settings -> Environment Variables, see README.md for how to get them):
//   SPOTIFY_CLIENT_ID
//   SPOTIFY_CLIENT_SECRET
//   SPOTIFY_REFRESH_TOKEN

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played?limit=1";

async function getAccessToken() {
  const basic = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: process.env.SPOTIFY_REFRESH_TOKEN,
    }),
  });

  if (!res.ok) {
    throw new Error(`token refresh failed: ${res.status}`);
  }
  const data = await res.json();
  return data.access_token;
}

export default async function handler(req, res) {
  // Cache each response for a few seconds so a burst of page loads
  // doesn't hammer the Spotify API.
  res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate");

  try {
    const accessToken = await getAccessToken();

    const nowRes = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // 204 = nothing currently playing
    if (nowRes.status === 200) {
      const song = await nowRes.json();
      if (song && song.item) {
        return res.status(200).json({
          isPlaying: true,
          title: song.item.name,
          artist: song.item.artists.map((a) => a.name).join(", "),
          albumImageUrl: song.item.album.images[0]?.url ?? null,
          songUrl: song.item.external_urls.spotify,
        });
      }
    }

    // fall back to most recently played track
    const recentRes = await fetch(RECENTLY_PLAYED_ENDPOINT, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const recent = await recentRes.json();
    const track = recent.items?.[0]?.track;

    if (!track) {
      return res.status(200).json({ isPlaying: false });
    }

    return res.status(200).json({
      isPlaying: false,
      title: track.name,
      artist: track.artists.map((a) => a.name).join(", "),
      albumImageUrl: track.album.images[0]?.url ?? null,
      songUrl: track.external_urls.spotify,
    });
  } catch (err) {
    return res.status(500).json({ isPlaying: false, error: "spotify_unavailable" });
  }
}
