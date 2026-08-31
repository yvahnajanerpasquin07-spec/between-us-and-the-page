import { toSpotifyEmbedUrl } from '../utils/spotify';

export default function SpotifyPlayer({ spotifyUrl, active = true }) {
  const embedUrl = toSpotifyEmbedUrl(spotifyUrl);
  if (!embedUrl) return null;

  // If not active, render a placeholder to preserve layout but don't set the iframe src
  if (!active) {
    return <div style={{ width: '100%', height: 152 }} className="rounded-sm" />;
  }

  return (
    <iframe
      title="Spotify player"
      src={embedUrl}
      width="100%"
      height="152"
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="rounded-sm"
    />
  );
}
