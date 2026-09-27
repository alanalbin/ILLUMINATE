'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createProceduralPhone, PhoneMeshes } from './phone-geometry';

interface PhoneSceneProps {
  scrollProgress?: number; // 0.0 to 1.0 (fallback)
  progressRef?: React.RefObject<number>; // Smooth ref for zero React re-render performance
  isMobile?: boolean;
}

export default function PhoneScene({ scrollProgress = 0, progressRef, isMobile = false }: PhoneSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const meshesRef = useRef<PhoneMeshes | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);

  const [webglSupported, setWebglSupported] = useState(true);

  // Keep target progress updated from prop if progressRef not provided
  useEffect(() => {
    if (!progressRef) {
      targetProgressRef.current = Math.max(0, Math.min(1, scrollProgress));
    }
  }, [scrollProgress, progressRef]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. WebGL Support Verification
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 700;

    // 2. Three.js Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    // Camera distance tailored to fit phone model comfortably in dedicated container
    camera.position.set(0, 0, isMobile ? 8.4 : 7.2);

    // 3. High-Quality WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Professional Studio Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xfdf4ff, 1.1);
    scene.add(ambientLight);

    // Key Light: Soft studio white from upper-right
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(5.5, 7.5, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Rim Light: Vivid violet from rear-left to carve titanium bevels
    const rimLight = new THREE.DirectionalLight(0xa855f7, 4.2);
    rimLight.position.set(-6, 4, -5);
    scene.add(rimLight);

    // Top Light: Gentle white highlight on top curve
    const topLight = new THREE.DirectionalLight(0xe9d5ff, 2.0);
    topLight.position.set(0, 8, 2);
    scene.add(topLight);

    // Bottom Bounce: Dark purple bounce
    const bottomLight = new THREE.DirectionalLight(0x431407, 1.2);
    bottomLight.position.set(0, -6, 3);
    scene.add(bottomLight);

    // 5. Add Procedural iPhone Pro Model
    const phone = createProceduralPhone();
    meshesRef.current = phone;
    scene.add(phone.rootGroup);

    // 6. Responsive Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.position.z = w < 640 ? 8.4 : 7.2;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 7. Render Loop with Smooth Inertial Damping
    let lastRenderProgress = -1;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      // Determine target progress from ref or prop
      let target = targetProgressRef.current;
      if (progressRef && typeof progressRef.current === 'number') {
        target = Math.max(0, Math.min(1, progressRef.current));
      }

      const current = currentProgressRef.current;
      const lerpSpeed = 0.085; // Buttery smooth easing without lag
      currentProgressRef.current += (target - current) * lerpSpeed;

      const p = currentProgressRef.current;
      const phoneMeshes = meshesRef.current;

      if (phoneMeshes) {
        // Update screen texture when scroll moves significantly
        if (Math.abs(p - lastRenderProgress) > 0.005) {
          phoneMeshes.updateScreenTexture(p);
          lastRenderProgress = p;
        }

        const {
          rootGroup,
          frontGlassMesh,
          screenMesh,
          frameMesh,
          rearGlassMesh,
          cameraPlateau,
          cameraLensesGroup,
          sideButtonsGroup,
        } = phoneMeshes;

        let rotY = 0;
        let rotX = 0;
        let rotZ = 0;
        let posY = 0;
        let explosionFactor = 0;

        // --- CHOREOGRAPHED SCROLL SEQUENCE ---
        if (p < 0.22) {
          // STAGE 1: Hero elegant three-quarter view
          const sub = p / 0.22;
          rotY = 0.38 * (1 - sub * 0.45);
          rotX = 0.12 * (1 - sub * 0.4);
          rotZ = -0.02 * (1 - sub);
          posY = 0;
          explosionFactor = 0;
        } else if (p < 0.40) {
          // STAGE 2: Rotate to face user, camera approaches
          const sub = (p - 0.22) / 0.18;
          rotY = 0.21 * (1 - sub);
          rotX = 0.07 * (1 - sub);
          rotZ = 0;
          posY = 0;
          explosionFactor = 0;
        } else if (p < 0.52) {
          // STAGE 3: Screen flat focal point
          rotY = 0;
          rotX = 0;
          rotZ = 0;
          posY = 0;
          explosionFactor = 0;
        } else if (p < 0.74) {
          // STAGE 4 & 5: Exploded 3D view separation!
          const sub = (p - 0.52) / 0.22;
          explosionFactor = Math.sin((sub * Math.PI) / 2);

          rotY = -0.34 * explosionFactor;
          rotX = 0.14 * explosionFactor;
          rotZ = -0.02 * explosionFactor;
          posY = 0.1 * explosionFactor;
        } else if (p < 0.90) {
          // STAGE 6: Reassembly (collapsing back smoothly)
          const sub = (p - 0.74) / 0.16;
          explosionFactor = 1 - Math.sin((sub * Math.PI) / 2);

          rotY = -0.34 * explosionFactor;
          rotX = 0.14 * explosionFactor;
          rotZ = -0.02 * explosionFactor;
          posY = 0.1 * explosionFactor;
        } else {
          // STAGE 7: Solid reassembled resting state
          explosionFactor = 0;
          rotY = 0.05;
          rotX = 0.02;
          rotZ = 0;
          posY = -0.03;
        }

        // Apply orientation to root phone group (strictly centered within container)
        rootGroup.rotation.y = rotY;
        rootGroup.rotation.x = rotX;
        rootGroup.rotation.z = rotZ;
        rootGroup.position.set(0, posY, 0);

        // --- CONTROLLED 3D COMPONENT OFFSETS ALONG DELIBERATE AXES ---
        // Front Ceramic Glass: moves forward along +Z
        frontGlassMesh.position.z = 0.115 + explosionFactor * (isMobile ? 0.45 : 0.72);

        // OLED Display: moves forward moderately along +Z
        screenMesh.position.z = 0.111 + explosionFactor * (isMobile ? 0.28 : 0.45);

        // Titanium Frame: stays anchored at Z = 0
        frameMesh.position.z = 0;

        // Rear Matte Frosted Glass: separates backward along -Z
        rearGlassMesh.position.z = -0.112 - explosionFactor * (isMobile ? 0.35 : 0.58);

        // Camera Plateau: detaches backward from rear panel (-Z and slight +Y)
        cameraPlateau.position.z = -0.138 - explosionFactor * (isMobile ? 0.65 : 1.05);
        cameraPlateau.position.y = 1.62 + explosionFactor * 0.1;

        // Triple Camera Lenses: separate dramatically backward along -Z
        cameraLensesGroup.position.z = -0.138 - explosionFactor * (isMobile ? 0.95 : 1.45);
        cameraLensesGroup.position.y = 1.62 + explosionFactor * 0.18;

        // Side Buttons: slide outward along X
        sideButtonsGroup.position.x = explosionFactor * 0.18;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      renderer.dispose();
      if (container && renderer.domElement) {
        container.innerHTML = '';
      }
    };
  }, [isMobile, progressRef]);

  if (!webglSupported) {
    return null;
  }

  return (
    <div
      ref={mountRef}
      className="w-full h-full pointer-events-none flex items-center justify-center relative overflow-hidden"
      style={{ touchAction: 'pan-y' }}
      aria-hidden="true"
    />
  );
}
