'use client';

import { useState, useEffect } from 'react';

const JAPANESE_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

export function MatrixBackground() {
  const [chars, setChars] = useState<string[]>([]);

  useEffect(() => {
    const count = 500;
    const generated = Array.from({ length: count }, () =>
      JAPANESE_CHARS[Math.floor(Math.random() * JAPANESE_CHARS.length)]
    );
    setChars(generated);
  }, []);

  if (chars.length === 0) return null;

  return (
    <div className="matrix-bg" aria-hidden="true">
      {chars.map((char, i) => (
        <span key={i}>{char}</span>
      ))}
    </div>
  );
}
