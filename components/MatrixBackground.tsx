'use client';

import { useMemo } from 'react';

const JAPANESE_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

export function MatrixBackground() {
  const chars = useMemo(() => {
    const count = 500; // Número de caracteres
    return Array.from({ length: count }, () =>
      JAPANESE_CHARS[Math.floor(Math.random() * JAPANESE_CHARS.length)]
    );
  }, []);

  return (
    <div className="matrix-bg" aria-hidden="true">
      {chars.map((char, i) => (
        <span key={i}>{char}</span>
      ))}
    </div>
  );
}
