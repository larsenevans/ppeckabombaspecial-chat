import { noiseFunction } from './utils';

export const simulationMaterialShader = {
  uniforms: {
    uTime: { value: 0 },
    uDeltaTime: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(uv * 2.0 - 1.0, 0.0, 1.0);
    }
  `,
  fragmentShader: `
    ${noiseFunction}
    
    varying vec2 vUv;
    uniform sampler2D uPositions;
    uniform sampler2D uVelocities;
    uniform float uTime;
    uniform float uDeltaTime;

    void main() {
      vec2 uv = vUv;
      vec3 pos = texture2D(uPositions, uv).xyz;
      vec3 vel = texture2D(uVelocities, uv).xyz;

      // Apply noise-based forces
      vec3 force = vec3(0.0);
      force += fbm(pos * 0.5 + vec3(0.0, uTime * 0.3, 0.0), 3, 0.5, 1.0, 2.0, 0.5) * vec3(0.02, 0.02, 0.02);
      
      // Attract to center loosely
      vec3 centerAttract = -pos * 0.005;
      force += centerAttract;

      // Apply damping
      vel *= 0.98;
      vel += force * uDeltaTime;

      // Update position
      pos += vel * uDeltaTime;

      // Bounds wrapping
      if (pos.x > 2.0) pos.x -= 4.0;
      if (pos.x < -2.0) pos.x += 4.0;
      if (pos.y > 2.0) pos.y -= 4.0;
      if (pos.y < -2.0) pos.y += 4.0;
      if (pos.z > 2.0) pos.z -= 4.0;
      if (pos.z < -2.0) pos.z += 4.0;

      gl_FragColor = vec4(pos, 1.0);
    }
  `,
};

export const velocityMaterialShader = {
  uniforms: {
    uTime: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(uv * 2.0 - 1.0, 0.0, 1.0);
    }
  `,
  fragmentShader: `
    ${noiseFunction}
    
    varying vec2 vUv;
    uniform sampler2D uVelocities;
    uniform float uTime;

    void main() {
      vec3 vel = texture2D(uVelocities, vUv).xyz;
      
      // Gentle evolution of velocities
      vel += fbm(vUv + vec3(uTime * 0.2, 0.0, 0.0), 2, 0.1, 1.5, 2.0, 0.5) * vec3(0.01, 0.01, 0.01);
      vel *= 0.99;

      gl_FragColor = vec4(vel, 1.0);
    }
  `,
};
