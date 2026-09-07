import { useState } from 'react';

export default function Input({
  label,
  id,
  className = '',
  type,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';

  const inputType =
    isPassword && showPassword
      ? 'text'
      : type;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={id}
          className="font-mono text-xs uppercase tracking-wide text-ink-soft"
        >
          {label}
        </label>
      )}

      <div className="relative w-full">
        <input
          id={id}
          type={inputType}
          className={`
            input-field
            w-full
            box-border
            rounded-md
            border
            border-ink-soft/30
            bg-paper
            px-3
            py-2.5
            text-sm
            text-ink
            outline-none
            transition-all
            duration-200
            placeholder:text-ink-soft/50
            focus:border-ink-soft
            focus:ring-2
            focus:ring-ink-soft/10
            ${isPassword ? 'pr-12' : ''}
            ${className}
          `}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() =>
              setShowPassword((current) => !current)
            }
            className="
              absolute
              right-1.5
              top-1/2
              -translate-y-1/2
              w-9
              h-9
              rounded-md
              flex
              items-center
              justify-center
              text-ink-soft
              transition-all
              duration-200
              hover:bg-ink-soft/10
              hover:text-ink
              active:scale-95
              focus:outline-none
              focus:ring-2
              focus:ring-ink-soft/20
            "
            aria-label={
              showPassword
                ? 'Hide password'
                : 'Show password'
            }
            title={
              showPassword
                ? 'Hide password'
                : 'Show password'
            }
          >
            {showPassword ? (
              /* Eye with slash - password is visible */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2 2l20 20" />

                <path d="M6.7 6.7C4.7 8.1 3.2 10 2 12c2.5 4.1 6 6 10 6 1.7 0 3.3-.3 4.7-.9" />

                <path d="M9.9 4.2C10.6 4.1 11.3 4 12 4c4 0 7.5 1.9 10 6-1 1.7-2.2 3.2-3.7 4.4" />

                <path d="M14.1 14.1A3 3 0 0 1 9.9 9.9" />
              </svg>
            ) : (
              /* Normal eye - password is hidden */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />

                <circle
                  cx="12"
                  cy="12"
                  r="3"
                />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}