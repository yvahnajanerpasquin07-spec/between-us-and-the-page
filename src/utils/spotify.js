// Turns a normal Spotify share link into an embeddable iframe src.
// Accepts track, album, playlist and episode links.
const SPOTIFY_URL_PATTERN =
  /open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/;

export function toSpotifyEmbedUrl(spotifyUrl) {
  if (!spotifyUrl) return null;
  const match = spotifyUrl.match(SPOTIFY_URL_PATTERN);
  if (!match) return null;
  const [, type, id] = match;
  return `https://open.spotify.com/embed/${type}/${id}`;
}

export function isValidSpotifyUrl(spotifyUrl) {
  return SPOTIFY_URL_PATTERN.test(spotifyUrl ?? '');
}
