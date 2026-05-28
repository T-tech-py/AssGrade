'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

type PassConfettiProps = {
  pieces?: number;
};

export function PassConfetti({ pieces = 26 }: PassConfettiProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: pieces }, (_, index) => ({
        id: index,
        left: 4 + ((index * 97) % 92),
        delay: (index % 8) * 0.14,
        duration: 2.8 + (index % 5) * 0.3,
        rotate: -180 + ((index * 53) % 360),
        width: 7 + (index % 4) * 2,
        height: 14 + (index % 5) * 3,
        color:
          index % 4 === 0
            ? '#d7f75b'
            : index % 4 === 1
              ? '#7dd3a7'
              : index % 4 === 2
                ? '#facc62'
                : '#ffffff',
      })),
    [pieces],
  );

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute top-0 rounded-full opacity-90"
          style={{
            left: `${particle.left}%`,
            width: particle.width,
            height: particle.height,
            backgroundColor: particle.color,
            filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.14))',
          }}
          initial={{ y: -48, x: 0, rotate: 0, opacity: 0 }}
          animate={{
            y: ['0%', '45%', '100%'],
            x: [0, particle.id % 2 === 0 ? 18 : -18, particle.id % 2 === 0 ? -10 : 10],
            rotate: [0, particle.rotate * 0.5, particle.rotate],
            opacity: [0, 1, 0.9, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}
