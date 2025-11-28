'use client';

const JAPANESE_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

// Generar caracteres de forma determinista (pseudo-aleatorio basado en índice)
function getChar(index: number): string {
  const charIndex = (index * 7 + 13) % JAPANESE_CHARS.length;
  return JAPANESE_CHARS[charIndex];
}

// Pre-generar array de 500 caracteres
const CHARS = Array.from({ length: 500 }, (_, i) => getChar(i));

export function MatrixBackground() {
  return (
    <div className="matrix-bg" aria-hidden="true">
      {CHARS.map((char, i) => (
        <span key={i}>{char}</span>
      ))}
    </div>
  );
}
