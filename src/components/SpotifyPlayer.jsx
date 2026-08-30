import { toSpotifyEmbedUrl } from '../utils/spotify';

export default function SpotifyPlayer({ spotifyUrl }) {
  const embedUrl = toSpotifyEmbedUrl(spotifyUrl);
  if (!embedUrl) return null;

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
