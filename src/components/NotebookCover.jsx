console.log('Cover LOADED')
const MATERIALS = {
  kraft: {
    label: 'Kraft',
    base: '#c9a876',
    texture: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, transparent 1px, transparent 3px)',
    ringColor: '#2b2b2b',
  },
  velvet: {
    label: 'Velvet',
    base: '#7a1f2b',
    texture: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), transparent 60%)',
    ringColor: '#c9a24b',
  },
  leather: {
    label: 'Leather',
    base: '#3a2a1e',
    texture:
      'repeating-linear-gradient(135deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 2px, transparent 2px, transparent 6px)',
    ringColor: '#8a8a8a',
  },
};

export function materialOptions() {
  return Object.entries(MATERIALS).map(([value, m]) => ({ value, label: m.label }));
}

export default function NotebookCover({
  title,
  description,
  date,
  coverColor,
  coverMaterial = 'kraft',
  coverImageUrl,
  readOnly,
  ringCount = 11,
}) {
  const material = MATERIALS[coverMaterial] ?? MATERIALS.kraft;
  const bg = coverColor || material.base;

  return (
    <div className="relative h-full w-full pl-5">
      {/* page stack peeking out */}
      <div className="absolute inset-0 left-5 translate-x-1 translate-y-1 rounded-r-2xl rounded-l-sm bg-[#f5efe0]" />
      <div className="absolute inset-0 left-5 translate-x-[2px] translate-y-[2px] rounded-r-2xl rounded-l-sm bg-[#faf6ea]" />

      {/* cover */}
      <div
        className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-r-2xl rounded-l-sm p-6 pl-9 shadow-lg ring-1 ring-black/25"
        style={{
          backgroundColor: bg,
          backgroundImage: coverImageUrl
            ? `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.45)), url(${coverImageUrl}), ${material.texture}`
            : material.texture,
          backgroundSize: coverImageUrl ? 'cover, cover, auto' : 'auto',
          backgroundPosition: coverImageUrl ? 'center, center, center' : 'center',
        }}
      >
        <div />
        <div className="relative flex flex-1 flex-col items-center justify-center px-2 text-center">
          <h3 className="font-display text-xl text-white drop-shadow-sm">{title}</h3>
          {description && (
            <p className="mt-2 line-clamp-3 font-body text-sm text-white/85">{description}</p>
          )}
        </div>
        <div className="relative flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wide text-white/70">{date}</span>
          {readOnly && (
            <span className="font-mono text-[10px] uppercase tracking-wide text-moss">View only</span>
          )}
        </div>
      </div>

      {/* spiral binding */}
      <div className="absolute left-0 top-0 z-10 flex h-full w-7 flex-col items-center justify-evenly py-2">
        {Array.from({ length: ringCount }).map((_, i) => (
          <svg key={i} width="20" height="18" viewBox="0 0 20 18" className="drop-shadow-sm">
            <path
              d="M4 2 C -1 6, -1 12, 4 16 M4 2 C 9 2, 16 2, 16 2 M4 16 C 9 16, 16 16, 16 16"
              stroke={material.ringColor}
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            <ellipse cx="16" cy="2" rx="2.5" ry="2" fill={material.ringColor} />
            <ellipse cx="16" cy="16" rx="2.5" ry="2" fill={material.ringColor} />
          </svg>
        ))}
      </div>
    </div>
  );
}