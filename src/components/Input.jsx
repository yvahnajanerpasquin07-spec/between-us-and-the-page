export default function Input({ label, id, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="font-mono text-xs uppercase tracking-wide text-ink-soft">
          {label}
        </label>
      )}
      <input id={id} className={`input-field ${className}`} {...props} />
    </div>
  );
}
