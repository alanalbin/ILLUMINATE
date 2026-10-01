'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function BackgroundCanvas3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  useEffect(() => {
    // 1. WebGL Support Verification
    try {
      const testCanvas = document.createElement('canvas');
      const gl =
        testCanvas.getContext('webgl2') ||
        testCanvas.getContext('webgl') ||
        testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    // 2. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05030a, 0.0018);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.set(0, 0, 220);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // 3. Calm Volumetric Ambient Lights
    const ambientLight = new THREE.AmbientLight(0x2e1065, 0.8);
    scene.add(ambientLight);

    const primaryGlow = new THREE.PointLight(0x9333ea, 2.0, 500);
    primaryGlow.position.set(80, 50, 60);
    scene.add(primaryGlow);

    const secondaryGlow = new THREE.PointLight(0x4f46e5, 1.4, 500);
    secondaryGlow.position.set(-80, -40, 40);
    scene.add(secondaryGlow);

    // 4. Soft Glowing Particle Texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.25, 'rgba(192, 132, 252, 0.8)');
      grad.addColorStop(0.6, 'rgba(126, 34, 206, 0.25)');
      grad.addColorStop(1, 'rgba(5, 3, 10, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(pCanvas);

    // 5. Serene Starfield (Slow, Gentle Floating Embers)
    const starCount = isMobile ? 120 : 260;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starSpeeds = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      starPositions[i3] = (Math.random() - 0.5) * 500;
      starPositions[i3 + 1] = (Math.random() - 0.5) * 450;
      starPositions[i3 + 2] = (Math.random() - 0.5) * 350;
      starSpeeds[i] = 0.04 + Math.random() * 0.05; // Slow, majestic drift
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: isMobile ? 3.5 : 4.5,
      map: particleTexture,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 6. Single Elegant Geometric Celestial Wireframe
    const geoGroup = new THREE.Group();
    scene.add(geoGroup);

    // Primary Icosahedron (Very thin, meditative rotation)
    const icoGeo = new THREE.IcosahedronGeometry(isMobile ? 28 : 38, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    icoMesh.position.set(0, 10, -30);
    geoGroup.add(icoMesh);

    // Concentric Inner Octahedron
    const octGeo = new THREE.OctahedronGeometry(isMobile ? 16 : 22, 0);
    const octMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.14,
    });
    const octMesh = new THREE.Mesh(octGeo, octMat);
    octMesh.position.set(0, 10, -30);
    geoGroup.add(octMesh);

    // Distant Slow Torus Ring in Background
    const torusGeo = new THREE.TorusGeometry(isMobile ? 55 : 85, 1.2, 12, 60);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.07,
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.position.set(0, -10, -90);
    torusMesh.rotation.x = Math.PI / 3;
    geoGroup.add(torusMesh);

    // 7. Heavily Damped Smooth Pointer & Scroll Tracking
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handlePointerMove = (e: PointerEvent) => {
      // Extremely subtle, normalized range (-1 to 1)
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // 8. Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 9. Tab Visibility Pause (Saves battery & prevents jumps when switching tabs)
    let isTabVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 10. Calm, Ultra-Smooth Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isTabVisible) return;

      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      // Heavily damped, gentle micro-movement (no jitter or sudden leaps)
      if (!prefersReducedMotion) {
        currentX += (targetX - currentX) * 0.02;
        currentY += (targetY - currentY) * 0.02;

        camera.position.x = currentX * 6; // Max 6 units offset
        camera.position.y = -currentY * 4;
        camera.lookAt(0, 0, 0);

        // Calm, constant slow rotation (0.04 to 0.06 rad/sec - peaceful and relaxing)
        icoMesh.rotation.y = time * 0.04;
        icoMesh.rotation.x = time * 0.025;

        octMesh.rotation.y = -time * 0.035;
        octMesh.rotation.z = time * 0.02;

        torusMesh.rotation.z = time * 0.015;

        // Very slow ambient light drift (over 20s cycle)
        primaryGlow.position.x = 80 + Math.sin(time * 0.2) * 20;
        primaryGlow.position.y = 50 + Math.cos(time * 0.15) * 15;
      }

      // Peaceful Starfield Drift (imperceptible, continuous smooth upward drift)
      const positions = starGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        // Slow float upwards
        positions[i3 + 1] += starSpeeds[i] * 0.6;
        if (positions[i3 + 1] > 220) {
          positions[i3 + 1] = -220;
          positions[i3] = (Math.random() - 0.5) * 500;
        }
      }
      starGeometry.attributes.position.needsUpdate = true;

      // Gentle twinkle brightness pulse
      starMaterial.opacity = 0.45 + Math.sin(time * 0.6) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // 11. Clean Teardown
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      starGeometry.dispose();
      starMaterial.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      octGeo.dispose();
      octMat.dispose();
      torusGeo.dispose();
      torusMat.dispose();
      particleTexture.dispose();
      renderer.dispose();
    };
  }, []);

  if (!webglSupported) {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-[#05030a]"
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #0d0722 0%, #05030a 70%, #030107 100%)',
      }}
      aria-hidden="true"
    />
  );
}
