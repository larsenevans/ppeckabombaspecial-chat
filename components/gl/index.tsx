'use client';

import { Canvas } from '@react-three/fiber';
import { Particles } from './particles';
import { useTheme } from '@/lib/theme-context';

export function ParticleCanvas() {
  const { particlesEnabled } = useTheme();

  if (!particlesEnabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas
        camera={{
          position: [0, 0, 1.5],
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <Particles />
      </Canvas>
    </div>
  );
}
