export const pointMaterialShader = {
  uniforms: {
    uTime: { value: 0 },
    uAccentHue: { value: 200 },
  },
  vertexShader: `
    uniform float uTime;
    varying vec3 vPos;
    varying float vDepth;

    void main() {
      vPos = position;
      vDepth = gl_Position.z;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      
      // Pulse based on depth
      float pulse = sin(uTime * 2.0 + position.z * 3.0) * 0.3 + 0.7;
      gl_PointSize = pulse * 2.0 + 1.0;
    }
  `,
  fragmentShader: `
    uniform float uAccentHue;
    varying vec3 vPos;
    varying float vDepth;

    // Convert HSL to RGB
    vec3 hslToRgb(float h, float s, float l) {
      vec3 c = vec3(s * mix(1.0, min(l, 1.0 - l), 1.0));
      vec3 p = abs(fract(h + vec3(1.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0) - 1.0;
      return l + c * (clamp(p, 0.0, 1.0) * 2.0 - 1.0);
    }

    void main() {
      // Create circular point
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      if (dist > 0.5) discard;

      // Soft falloff
      float alpha = (1.0 - dist * 2.0) * 0.8;

      // Use accent hue, with slight variation
      float h = (uAccentHue / 360.0 + sin(vPos.x + vPos.y) * 0.05);
      float s = 0.8;
      float l = 0.55;

      vec3 color = hslToRgb(h, s, l);
      
      gl_FragColor = vec4(color, alpha);
    }
  `,
};
