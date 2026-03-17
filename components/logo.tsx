export function LogoMark({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      width={size}
      height={size}
      className={className}
    >
      <rect width="64" height="64" rx="14" fill="#22d3ee" />
      <path
        d="M22 48V16H34C38.4 16 42 17.6 44.2 20.2C46.4 22.8 47 26 47 28.5C47 31 46.4 34.2 44.2 36.8C42 39.4 38.4 41 34 41H30V48H22ZM30 33.5H33.5C35 33.5 36.2 33 37 32.2C37.8 31.4 38.2 30.2 38.2 28.5C38.2 26.8 37.8 25.6 37 24.8C36.2 24 35 23.5 33.5 23.5H30V33.5Z"
        fill="#020206"
      />
    </svg>
  );
}

export function LogoFull({ height = 28, className = '' }: { height?: number; className?: string }) {
  const width = (height / 48) * 200;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 48"
      fill="none"
      width={width}
      height={height}
      className={className}
    >
      <rect width="48" height="48" rx="11" fill="#22d3ee" />
      <path
        d="M16.5 36V12H25.5C28.8 12 31.5 13.2 33.2 15.2C34.9 17.2 35.5 19.6 35.5 22C35.5 24.4 34.9 26.8 33.2 28.8C31.5 30.8 28.8 32 25.5 32H23V36H16.5ZM23 26H25.2C26.3 26 27.2 25.6 27.8 25C28.4 24.4 28.7 23.4 28.7 22C28.7 20.6 28.4 19.6 27.8 19C27.2 18.4 26.3 18 25.2 18H23V26Z"
        fill="#020206"
      />
      <text
        x="60"
        y="34"
        fontFamily="var(--font-public-sans), system-ui, sans-serif"
        fontWeight="700"
        fontSize="26"
        letterSpacing="-0.5"
        fill="currentColor"
      >
        Pushify
      </text>
    </svg>
  );
}
