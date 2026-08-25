export function AmanahMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path
        d="M16 3.5 27 8.2v7.4c0 7.1-4.6 11.6-11 13.4C9.6 27.2 5 22.7 5 15.6V8.2L16 3.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M16 11.2c2.4 0 4.2 1.7 4.2 4.2S18.4 19.6 16 19.6 11.8 17.9 11.8 15.4 13.6 11.2 16 11.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="16" cy="15.4" r="1.15" fill="currentColor" />
    </svg>
  );
}
