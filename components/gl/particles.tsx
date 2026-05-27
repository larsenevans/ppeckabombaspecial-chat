'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { simulationMaterialShader, velocityMaterialShader } from './shaders/simulationMaterial';
import { pointMaterialShader } from './shaders/pointMaterial';
import { useTheme } from '@/lib/theme-context';

const PARTICLE_COUNT = 2000;
const GRID_SIZE = Math.ceil(Math.sqrt(PARTICLE_COUNT));

export function Particles() {
  const { camera, gl } = useThree();
  const { darkAccentHue, lightAccentHue } = useTheme();
  
  const pointsRef = useRef<THREE.Points>(null);
  const simulationRef = useRef<{
    scene: THREE.Scene;
    positionTarget: THREE.WebGLRenderTarget;
    velocityTarget: THREE.WebGLRenderTarget;
    velocityMaterial: THREE.ShaderMaterial;
    simulationMaterial: THREE.ShaderMaterial;
  } | null>(null);

  // Initialize simulation render targets and materials
  useMemo(() => {
    const positionData = new Float32Array(PARTICLE_COUNT * 3);
    const velocityData = new Float32Array(PARTICLE_COUNT * 3);

    // Initialize positions and velocities randomly
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positionData[i * 3] = (Math.random() - 0.5) * 4;
      positionData[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positionData[i * 3 + 2] = (Math.random() - 0.5) * 4;

      velocityData[i * 3] = (Math.random() - 0.5) * 0.2;
      velocityData[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
      velocityData[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
    }

    // Create data textures
    const positionTexture = new THREE.DataTexture(positionData, GRID_SIZE, GRID_SIZE, THREE.RGBAFormat, THREE.FloatType);
    const velocityTexture = new THREE.DataTexture(velocityData, GRID_SIZE, GRID_SIZE, THREE.RGBAFormat, THREE.FloatType);
    positionTexture.needsUpdate = true;
    velocityTexture.needsUpdate = true;

    // Create render targets
    const positionTarget = new THREE.WebGLRenderTarget(GRID_SIZE, GRID_SIZE, {
      type: THREE.FloatType,
      format: THREE.RGBAFormat,
    });
    const velocityTarget = new THREE.WebGLRenderTarget(GRID_SIZE, GRID_SIZE, {
      type: THREE.FloatType,
      format: THREE.RGBAFormat,
    });

    // Copy initial data
    gl.copyTextureToTexture(positionTexture, positionTarget.texture, undefined as any);
    gl.copyTextureToTexture(velocityTexture, velocityTarget.texture, undefined as any);

    // Create simulation materials
    const simulationMaterial = new THREE.ShaderMaterial({
      ...simulationMaterialShader,
      uniforms: {
        ...simulationMaterialShader.uniforms,
        uPositions: { value: positionTarget.texture },
        uVelocities: { value: velocityTarget.texture },
      },
    });

    const velocityMaterial = new THREE.ShaderMaterial({
      ...velocityMaterialShader,
      uniforms: {
        ...velocityMaterialShader.uniforms,
        uVelocities: { value: velocityTarget.texture },
      },
    });

    // Setup simulation scene
    const simScene = new THREE.Scene();
    const simGeom = new THREE.BufferGeometry();
    const simQuad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      simulationMaterial
    );
    simScene.add(simQuad);

    simulationRef.current = {
      scene: simScene,
      positionTarget,
      velocityTarget,
      velocityMaterial,
      simulationMaterial,
    };

    return () => {
      positionTexture.dispose();
      velocityTexture.dispose();
      positionTarget.dispose();
      velocityTarget.dispose();
      simulationMaterial.dispose();
      velocityMaterial.dispose();
    };
  }, [gl]);

  // Setup points geometry
  useMemo(() => {
    if (!pointsRef.current || !simulationRef.current) return;

    const positionData = new Float32Array(PARTICLE_COUNT * 3);
    const uvData = new Float32Array(PARTICLE_COUNT * 2);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (i % GRID_SIZE) / GRID_SIZE;
      const y = Math.floor(i / GRID_SIZE) / GRID_SIZE;
      uvData[i * 2] = x;
      uvData[i * 2 + 1] = y;

      positionData[i * 3] = (Math.random() - 0.5) * 4;
      positionData[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positionData[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positionData, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvData, 2));

    pointsRef.current.geometry.dispose();
    pointsRef.current.geometry = geometry;
  }, []);

  // Update accent hue
  useEffect(() => {
    if (!pointsRef.current) return;
    const material = pointsRef.current.material as THREE.ShaderMaterial;
    // Use dark theme hue if in dark mode, otherwise light
    const accentHue = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? darkAccentHue 
      : lightAccentHue;
    material.uniforms.uAccentHue.value = accentHue;
  }, [darkAccentHue, lightAccentHue]);

  // Animation loop
  useFrame(({ clock }) => {
    if (!simulationRef.current || !pointsRef.current) return;

    const time = clock.getElapsedTime();
    const deltaTime = Math.min(clock.getDelta(), 0.016); // Cap at 60fps

    const sim = simulationRef.current;
    const pointMaterial = pointsRef.current.material as THREE.ShaderMaterial;

    // Update uniforms
    sim.simulationMaterial.uniforms.uTime.value = time;
    sim.simulationMaterial.uniforms.uDeltaTime.value = deltaTime;
    sim.velocityMaterial.uniforms.uTime.value = time;
    pointMaterial.uniforms.uTime.value = time;

    // Step 1: Update velocities
    const oldRenderTarget = gl.getRenderTarget();
    gl.setRenderTarget(sim.velocityTarget);
    gl.render(new THREE.Scene(), new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100));

    // Step 2: Update positions
    sim.simulationMaterial.uniforms.uVelocities.value = sim.velocityTarget.texture;
    sim.simulationMaterial.uniforms.uPositions.value = sim.positionTarget.texture;
    
    const posTarget = sim.positionTarget;
    gl.setRenderTarget(posTarget);
    gl.render(sim.scene, new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100));

    // Step 3: Update point positions from texture
    if (pointsRef.current && pointsRef.current.geometry) {
      const positionAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
      const uvAttr = pointsRef.current.geometry.getAttribute('uv') as THREE.BufferAttribute;
      
      if (positionAttr && uvAttr) {
        const positions = positionAttr.array as Float32Array;
        const uvs = uvAttr.array as Float32Array;
        
        // Read from position target texture
        const pixelBuffer = new Uint8Array(GRID_SIZE * GRID_SIZE * 4);
        gl.readRenderTargetPixels(posTarget, 0, 0, GRID_SIZE, GRID_SIZE, pixelBuffer);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const pixelIndex = i * 4;
          const u = (pixelBuffer[pixelIndex] / 255) * 2 - 1;
          const v = (pixelBuffer[pixelIndex + 1] / 255) * 2 - 1;
          const w = (pixelBuffer[pixelIndex + 2] / 255) * 2 - 1;

          positions[i * 3] = u;
          positions[i * 3 + 1] = v;
          positions[i * 3 + 2] = w;
        }

        positionAttr.needsUpdate = true;
      }
    }

    gl.setRenderTarget(oldRenderTarget);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <shaderMaterial {...pointMaterialShader} />
    </points>
  );
}
