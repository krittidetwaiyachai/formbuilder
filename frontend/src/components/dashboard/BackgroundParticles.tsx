import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

interface BackgroundParticlesProps {
  count?: number;
}

export default function BackgroundParticles({ count = 20 }: BackgroundParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 10 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ opacity: 0, x: `${particle.x}%`, y: `${particle.y}%` }}
          animate={{
            opacity: [0.1, 0.4, 0.1],
            y: [`${particle.y}%`, `${particle.y - 20}%`, `${particle.y}%`],
            x: [`${particle.x}%`, `${particle.x + 5}%`, `${particle.x}%`],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: particle.delay,
          }}
          className="absolute rounded-full bg-gradient-to-br from-indigo-100/30 to-purple-100/30 blur-xl"
          style={{
            width: particle.size * 5,
            height: particle.size * 5,
          }}
        />
      ))}
    </div>
  );
}
