'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function BackgroundCanvas3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  useEffect(() => {
    // 1. WebGL Capability Check
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

    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    // 2. Scene, Camera & Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05030a, 0.0016);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      1,
      1200
    );
    camera.position.z = 260;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 3. Volumetric Lights
    const ambientLight = new THREE.AmbientLight(0x3b0764, 1.2);
    scene.add(ambientLight);

    const primaryLight = new THREE.PointLight(0xa855f7, 3.5, 600);
    primaryLight.position.set(100, 80, 100);
    scene.add(primaryLight);

    const secondaryLight = new THREE.PointLight(0x6366f1, 2.8, 600);
    secondaryLight.position.set(-120, -60, 90);
    scene.add(secondaryLight);

    const accentLight = new THREE.PointLight(0xec4899, 2.0, 500);
    accentLight.position.set(0, 140, 40);
    scene.add(accentLight);

    // 4. Interactive Particle Field with Wave Physics
    const particleCount = isMobile ? 260 : 650;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * 650;
      const y = (Math.random() - 0.5) * 600;
      const z = (Math.random() - 0.5) * 450;

      particlePositions[i3] = x;
      particlePositions[i3 + 1] = y;
      particlePositions[i3 + 2] = z;

      originalPositions[i3] = x;
      originalPositions[i3 + 1] = y;
      originalPositions[i3 + 2] = z;

      particleVelocities[i3] = 0;
      particleVelocities[i3 + 1] = 0;
      particleVelocities[i3 + 2] = 0;

      particleSizes[i] = Math.random() * 2.8 + 1.2;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Custom Particle Glow Texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 30);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.2, 'rgba(216, 180, 254, 0.9)');
      grad.addColorStop(0.5, 'rgba(147, 51, 234, 0.45)');
      grad.addColorStop(0.8, 'rgba(79, 70, 229, 0.15)');
      grad.addColorStop(1, 'rgba(5, 3, 10, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(pCanvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: isMobile ? 4.5 : 5.5,
      map: particleTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 5. Dynamic Constellation Connector Lines (Web Lines)
    const maxLineConnections = isMobile ? 120 : 350;
    const linePositions = new Float32Array(maxLineConnections * 2 * 3);
    const lineColors = new Float32Array(maxLineConnections * 2 * 3);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const constellationLines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(constellationLines);

    // 6. Floating Holographic 3D Polyhedrons
    const holoGroup = new THREE.Group();
    scene.add(holoGroup);

    // Central Floating Crystal - Dual layer Icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(isMobile ? 24 : 34, 0);
    const icoInnerMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      roughness: 0.2,
      metalness: 0.85,
      transparent: true,
      opacity: 0.25,
      wireframe: false,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoInnerMat);
    icoMesh.position.set(isMobile ? 80 : 130, 30, -30);

    const icoWireMat = new THREE.MeshBasicMaterial({
      color: 0xd8b4fe,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const icoWire = new THREE.Mesh(icoGeo, icoWireMat);
    icoWire.scale.setScalar(1.05);
    icoMesh.add(icoWire);
    holoGroup.add(icoMesh);

    // Secondary Floating Octahedron on left
    const octGeo = new THREE.OctahedronGeometry(isMobile ? 18 : 26, 0);
    const octMat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5,
      roughness: 0.3,
      metalness: 0.7,
      transparent: true,
      opacity: 0.22,
    });
    const octMesh = new THREE.Mesh(octGeo, octMat);
    octMesh.position.set(isMobile ? -90 : -140, -45, -20);

    const octWireMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const octWire = new THREE.Mesh(octGeo, octWireMat);
    octWire.scale.setScalar(1.05);
    octMesh.add(octWire);
    holoGroup.add(octMesh);

    // Deep Perspective Torus Ring
    const torusGeo = new THREE.TorusGeometry(isMobile ? 32 : 46, 1.8, 14, 50);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x9333ea,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.position.set(0, -90, -110);
    torusMesh.rotation.x = Math.PI / 2.8;
    holoGroup.add(torusMesh);

    // 7. Interactive Touch & Pointer Tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    let isTouching = false;
    let touch3DX = 0;
    let touch3DY = 0;

    // Expanding shockwave ripple on tap/click
    interface Ripple {
      x: number;
      y: number;
      z: number;
      radius: number;
      maxRadius: number;
      strength: number;
      speed: number;
    }
    const ripples: Ripple[] = [];

    const triggerRipple = (clientX: number, clientY: number) => {
      // Map 2D screen coordinate to 3D world space approx
      const ndcX = (clientX / window.innerWidth) * 2 - 1;
      const ndcY = -(clientY / window.innerHeight) * 2 + 1;
      const worldX = ndcX * 150;
      const worldY = ndcY * 120;

      ripples.push({
        x: worldX,
        y: worldY,
        z: 0,
        radius: 1,
        maxRadius: isMobile ? 180 : 280,
        strength: 22,
        speed: isMobile ? 4.5 : 6,
      });

      // Limit concurrent ripples for smooth performance
      if (ripples.length > 4) ripples.shift();
    };

    const updatePointer = (clientX: number, clientY: number) => {
      targetMouseX = (clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (clientY / window.innerHeight - 0.5) * 2;
      touch3DX = targetMouseX * 180;
      touch3DY = -targetMouseY * 140;
    };

    const handlePointerMove = (e: PointerEvent) => {
      updatePointer(e.clientX, e.clientY);
    };

    const handlePointerDown = (e: PointerEvent) => {
      isTouching = true;
      updatePointer(e.clientX, e.clientY);
      triggerRipple(e.clientX, e.clientY);
    };

    const handlePointerUp = () => {
      isTouching = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updatePointer(touch.clientX, touch.clientY);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      isTouching = true;
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updatePointer(touch.clientX, touch.clientY);
        triggerRipple(touch.clientX, touch.clientY);
      }
    };

    const handleTouchEnd = () => {
      isTouching = false;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    // 8. Buttery-Smooth Scroll Parallax Tracking
    let targetScrollY = 0;
    let currentScrollY = 0;
    let scrollVelocity = 0;
    let lastScrollTime = performance.now();

    const handleScroll = () => {
      const now = performance.now();
      const dt = Math.max(1, now - lastScrollTime);
      const delta = window.scrollY - targetScrollY;
      scrollVelocity = delta / dt;
      targetScrollY = window.scrollY;
      lastScrollTime = now;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 10. Tab Visibility Optimization
    let isTabVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 11. Physics & Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isTabVisible) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      // Smooth Lerping for Pointer Parallax
      if (!prefersReducedMotion) {
        currentMouseX += (targetMouseX - currentMouseX) * 0.055;
        currentMouseY += (targetMouseY - currentMouseY) * 0.055;
        currentScrollY += (targetScrollY - currentScrollY) * 0.06;

        // Camera Gliding based on Scroll & Pointer
        const scrollFactor = currentScrollY / (document.body.scrollHeight || 1);
        camera.position.x = currentMouseX * 30;
        camera.position.y = -currentMouseY * 22 - (currentScrollY * 0.04);
        camera.position.z = 260 + Math.sin(scrollFactor * Math.PI * 2) * 35;
        camera.lookAt(0, -currentScrollY * 0.04, 0);

        // Smooth rotation of 3D holographic shapes
        icoMesh.rotation.x = elapsedTime * 0.15;
        icoMesh.rotation.y = elapsedTime * 0.18 + currentMouseX * 0.4;
        icoMesh.position.y = 30 + Math.sin(elapsedTime * 0.7) * 8 - (currentScrollY * 0.03);

        octMesh.rotation.x = elapsedTime * 0.12 - currentMouseY * 0.3;
        octMesh.rotation.z = elapsedTime * 0.16;
        octMesh.position.y = -45 + Math.cos(elapsedTime * 0.6) * 6 - (currentScrollY * 0.03);

        torusMesh.rotation.z = elapsedTime * 0.08 + (currentScrollY * 0.001);
        torusMesh.position.y = -90 - (currentScrollY * 0.04);

        // Ambient Light Oscillation
        primaryLight.position.x = 100 + Math.sin(elapsedTime * 0.5) * 30 + currentMouseX * 40;
        primaryLight.position.y = 80 + Math.cos(elapsedTime * 0.4) * 20;

        secondaryLight.position.x = -120 + Math.cos(elapsedTime * 0.45) * 25 - currentMouseX * 30;
        secondaryLight.position.y = -60 + Math.sin(elapsedTime * 0.55) * 20;

        // Update shockwave ripples
        for (let r = ripples.length - 1; r >= 0; r--) {
          const rip = ripples[r];
          rip.radius += rip.speed;
          rip.strength *= 0.95;
          if (rip.radius > rip.maxRadius || rip.strength < 0.2) {
            ripples.splice(r, 1);
          }
        }

        // Particle Physics: Drift + Touch Repulsion + Shockwave Ripples
        const pos = particleGeometry.attributes.position.array as Float32Array;
        const pointerRadiusSq = (isMobile ? 95 : 130) * (isMobile ? 95 : 130);

        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;

          // Natural undulating drift
          originalPositions[i3 + 1] -= 0.18;
          if (originalPositions[i3 + 1] < -320) {
            originalPositions[i3 + 1] = 320;
            originalPositions[i3] = (Math.random() - 0.5) * 650;
          }

          // Compute target position with subtle wave harmonic
          const waveX = Math.sin(elapsedTime * 0.8 + originalPositions[i3 + 1] * 0.02) * 3;
          const waveZ = Math.cos(elapsedTime * 0.6 + originalPositions[i3] * 0.02) * 3;
          const targetX = originalPositions[i3] + waveX;
          const targetY = originalPositions[i3 + 1];
          const targetZ = originalPositions[i3 + 2] + waveZ;

          // Touch / Pointer Repulsion
          let forceX = 0;
          let forceY = 0;
          const dx = pos[i3] - touch3DX;
          const dy = pos[i3 + 1] - touch3DY;
          const distSq = dx * dx + dy * dy;

          if (distSq < pointerRadiusSq && distSq > 1) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / (isMobile ? 95 : 130)) * (isTouching ? 14 : 7);
            forceX += (dx / dist) * force;
            forceY += (dy / dist) * force;
          }

          // Apply Shockwave Ripples
          for (let r = 0; r < ripples.length; r++) {
            const rip = ripples[r];
            const rdx = pos[i3] - rip.x;
            const rdy = pos[i3 + 1] - rip.y;
            const rDist = Math.sqrt(rdx * rdx + rdy * rdy);
            const distDiff = Math.abs(rDist - rip.radius);
            if (distDiff < 25) {
              const ripForce = (1 - distDiff / 25) * rip.strength * 0.35;
              forceX += (rdx / (rDist || 1)) * ripForce;
              forceY += (rdy / (rDist || 1)) * ripForce;
            }
          }

          // Spring damping towards target
          particleVelocities[i3] = (particleVelocities[i3] + forceX + (targetX - pos[i3]) * 0.04) * 0.88;
          particleVelocities[i3 + 1] = (particleVelocities[i3 + 1] + forceY + (targetY - pos[i3 + 1]) * 0.04) * 0.88;
          particleVelocities[i3 + 2] = (particleVelocities[i3 + 2] + (targetZ - pos[i3 + 2]) * 0.04) * 0.88;

          pos[i3] += particleVelocities[i3];
          pos[i3 + 1] += particleVelocities[i3 + 1];
          pos[i3 + 2] += particleVelocities[i3 + 2];
        }
        particleGeometry.attributes.position.needsUpdate = true;

        // Dynamic Constellation Connections
        let lineIdx = 0;
        const lineMaxDist = isMobile ? 42 : 55;
        const lineMaxDistSq = lineMaxDist * lineMaxDist;
        const lineArray = lineGeometry.attributes.position.array as Float32Array;
        const colorArray = lineGeometry.attributes.color.array as Float32Array;

        // Connect nearby particles with glowing purple/blue laser threads
        for (let i = 0; i < particleCount && lineIdx < maxLineConnections; i += 3) {
          const i3 = i * 3;
          for (let j = i + 1; j < particleCount && lineIdx < maxLineConnections; j += 4) {
            const j3 = j * 3;
            const lx = pos[i3] - pos[j3];
            const ly = pos[i3 + 1] - pos[j3 + 1];
            const lz = pos[i3 + 2] - pos[j3 + 2];
            const dSq = lx * lx + ly * ly + lz * lz;

            if (dSq < lineMaxDistSq) {
              const alpha = (1 - Math.sqrt(dSq) / lineMaxDist) * 0.6;
              const ptr = lineIdx * 6;

              lineArray[ptr] = pos[i3];
              lineArray[ptr + 1] = pos[i3 + 1];
              lineArray[ptr + 2] = pos[i3 + 2];

              lineArray[ptr + 3] = pos[j3];
              lineArray[ptr + 4] = pos[j3 + 1];
              lineArray[ptr + 5] = pos[j3 + 2];

              // Gradient color (violet to purple)
              colorArray[ptr] = 0.58 * alpha;
              colorArray[ptr + 1] = 0.2 * alpha;
              colorArray[ptr + 2] = 0.95 * alpha;

              colorArray[ptr + 3] = 0.38 * alpha;
              colorArray[ptr + 4] = 0.4 * alpha;
              colorArray[ptr + 5] = 0.98 * alpha;

              lineIdx++;
            }
          }
        }
        lineGeometry.setDrawRange(0, lineIdx * 2);
        lineGeometry.attributes.position.needsUpdate = true;
        lineGeometry.attributes.color.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 12. Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      particleGeometry.dispose();
      particleMaterial.dispose();
      particleTexture.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      icoGeo.dispose();
      icoInnerMat.dispose();
      icoWireMat.dispose();
      octGeo.dispose();
      octMat.dispose();
      octWireMat.dispose();
      torusGeo.dispose();
      torusMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        background: !webglSupported
          ? 'radial-gradient(circle at 50% 20%, rgba(124, 58, 237, 0.16) 0%, rgba(5, 3, 10, 0) 70%), #05030a'
          : 'transparent',
      }}
    />
  );
}
