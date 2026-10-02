'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface BackgroundCanvas3DProps {
  onReplayIntro?: () => void;
}

export default function BackgroundCanvas3D({ onReplayIntro }: BackgroundCanvas3DProps) {
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

    // 2. Deep Cosmic Scene, Fog & Perspective Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05030a, 0.0012);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      1400
    );
    // Positioned to view the majestic black hole tilted in cosmic perspective
    camera.position.set(0, isMobile ? 12 : 16, isMobile ? 190 : 175);
    camera.lookAt(0, isMobile ? 4 : 8, -30);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
      precision: isMobile ? 'mediump' : 'highp',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Optimization: Clamping pixelRatio prevents GPU fill-rate saturation on 3x Retina / 4K displays
    renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.25));
    if (!isMobile) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
    }
    container.appendChild(renderer.domElement);

    // 3. Cosmic Ambient & Accretion Lighting
    const ambientLight = new THREE.AmbientLight(0x0d0618, isMobile ? 2.0 : 1.6);
    scene.add(ambientLight);

    const accretionGlow1 = new THREE.PointLight(0xa855f7, isMobile ? 3.5 : 5.0, 500);
    accretionGlow1.position.set(50, 20, 40);
    scene.add(accretionGlow1);

    const accretionGlow2 = new THREE.PointLight(0x38bdf8, isMobile ? 3.0 : 4.5, 450);
    accretionGlow2.position.set(-50, -20, 30);
    scene.add(accretionGlow2);

    // Interactive Follower Light (trails user pointer)
    const pointerLight = new THREE.PointLight(0x60a5fa, isMobile ? 2.5 : 3.8, 320);
    pointerLight.position.set(0, 0, 80);
    scene.add(pointerLight);

    // =========================================================================
    // 4. THE BLACK HOLE SYSTEM (Singularity, Photon Sphere & Lensing Halo)
    // =========================================================================
    const blackHoleGroup = new THREE.Group();
    blackHoleGroup.position.set(0, isMobile ? 6 : 10, -45);
    blackHoleGroup.rotation.x = 0.42;
    blackHoleGroup.rotation.z = -0.16;
    scene.add(blackHoleGroup);

    // 4A. Event Horizon (Schwarzschild Void Sphere)
    const horizonRadius = isMobile ? 12 : 16;
    const horizonGeo = new THREE.SphereGeometry(horizonRadius, isMobile ? 24 : 32, isMobile ? 24 : 32);
    const horizonMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      depthWrite: true,
    });
    const horizonMesh = new THREE.Mesh(horizonGeo, horizonMat);
    blackHoleGroup.add(horizonMesh);

    // Gravitational shadow falloff halo
    const shadowHaloGeo = new THREE.SphereGeometry(horizonRadius * 1.03, 24, 24);
    const shadowHaloMat = new THREE.MeshBasicMaterial({
      color: 0x070212,
      transparent: true,
      opacity: 0.95,
    });
    const shadowHaloMesh = new THREE.Mesh(shadowHaloGeo, shadowHaloMat);
    blackHoleGroup.add(shadowHaloMesh);

    // 4B. Photon Sphere (Einstein Ring)
    const photonRingGeo = new THREE.RingGeometry(horizonRadius * 1.04, horizonRadius * 1.18, isMobile ? 36 : 64);
    const photonRingMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const photonRing = new THREE.Mesh(photonRingGeo, photonRingMat);
    blackHoleGroup.add(photonRing);

    // 4C. Gargantua Vertical Lensing Halo (Rear disk light bent over poles)
    const verticalLensingGeo = new THREE.TorusGeometry(
      horizonRadius * 1.28,
      isMobile ? 1.0 : 1.3,
      isMobile ? 10 : 14,
      isMobile ? 36 : 64
    );
    const verticalLensingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const verticalLensing = new THREE.Mesh(verticalLensingGeo, verticalLensingMat);
    verticalLensing.rotation.y = Math.PI / 2;
    blackHoleGroup.add(verticalLensing);

    // Secondary concentric lensing arch
    const secondaryLensingGeo = new THREE.TorusGeometry(
      horizonRadius * 1.48,
      isMobile ? 0.6 : 0.8,
      8,
      isMobile ? 32 : 54
    );
    const secondaryLensingMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
    });
    const secondaryLensing = new THREE.Mesh(secondaryLensingGeo, secondaryLensingMat);
    secondaryLensing.rotation.y = Math.PI / 2;
    blackHoleGroup.add(secondaryLensing);

    // =========================================================================
    // 5. HARDWARE-ACCELERATED ACCRETION DISK (Zero-CPU GPU Keplarian Rotation)
    // =========================================================================
    // By pre-allocating concentric particle sub-rings and rotating them directly
    // on the GPU in the vertex transform matrix, we eliminate all per-frame CPU
    // trigonometry loops and avoid PCIe buffer re-upload thrashing entirely!
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 64;
    spriteCanvas.height = 64;
    const sCtx = spriteCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.25, 'rgba(240, 230, 255, 0.95)');
      grad.addColorStop(0.55, 'rgba(56, 189, 248, 0.6)');
      grad.addColorStop(0.85, 'rgba(168, 85, 247, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(spriteCanvas);

    const minR = horizonRadius * 1.25;
    const maxR = horizonRadius * (isMobile ? 4.2 : 5.6);
    const rRange = maxR - minR;

    const colWhite = new THREE.Color(0xffffff);
    const colCyan = new THREE.Color(0x38bdf8);
    const colViolet = new THREE.Color(0xa855f7);
    const colDeep = new THREE.Color(0x6366f1);

    // Helper to generate a pre-baked static particle ring
    const createAccretionRing = (count: number, rStart: number, rEnd: number, startCol: THREE.Color, endCol: THREE.Color) => {
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const norm = Math.pow(Math.random(), 0.8);
        const r = THREE.MathUtils.lerp(rStart, rEnd, norm);
        const theta = Math.random() * Math.PI * 2;
        const y = (Math.random() - 0.5) * (isMobile ? 1.0 : 1.8) * (r / maxR);

        positions[i * 3] = Math.cos(theta) * r;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = Math.sin(theta) * r;

        const c = new THREE.Color().lerpColors(startCol, endCol, norm);
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const mat = new THREE.PointsMaterial({
        size: isMobile ? 3.2 : 4.6,
        map: particleTexture,
        vertexColors: true,
        transparent: true,
        opacity: isMobile ? 0.65 : 0.78,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      return new THREE.Points(geo, mat);
    };

    // 3 concentric rings rotating at Keplerian speeds (v ~ 1/sqrt(r))
    const innerRingCount = isMobile ? 90 : 160;
    const midRingCount = isMobile ? 110 : 200;
    const outerRingCount = isMobile ? 80 : 140;

    const innerRing = createAccretionRing(innerRingCount, minR, minR + rRange * 0.35, colWhite, colCyan);
    const midRing = createAccretionRing(midRingCount, minR + rRange * 0.28, minR + rRange * 0.72, colCyan, colViolet);
    const outerRing = createAccretionRing(outerRingCount, minR + rRange * 0.65, maxR, colViolet, colDeep);

    blackHoleGroup.add(innerRing);
    blackHoleGroup.add(midRing);
    blackHoleGroup.add(outerRing);

    // =========================================================================
    // 6. RELATIVISTIC POLAR ASTROPHYSICAL JETS
    // =========================================================================
    const jetGroup = new THREE.Group();
    blackHoleGroup.add(jetGroup);

    const jetCoreGeo = new THREE.CylinderGeometry(0.3, 2.8, isMobile ? 40 : 60, 12, 1, true);
    const jetCoreMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const jetNorth = new THREE.Mesh(jetCoreGeo, jetCoreMat);
    jetNorth.position.y = isMobile ? 22 : 32;
    jetGroup.add(jetNorth);

    const jetSouth = new THREE.Mesh(jetCoreGeo, jetCoreMat);
    jetSouth.position.y = isMobile ? -22 : -32;
    jetSouth.rotation.x = Math.PI;
    jetGroup.add(jetSouth);

    // =========================================================================
    // 7. DISTANT COSMIC STARS (Pre-computed Static VBO)
    // =========================================================================
    const starCount = isMobile ? 45 : 90;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * (isMobile ? 300 : 420);
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * (isMobile ? 200 : 300);
      starPositions[i * 3 + 2] = THREE.MathUtils.lerp(-80, -300, Math.random());
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    const starMat = new THREE.PointsMaterial({
      size: isMobile ? 2.2 : 3.4,
      map: particleTexture,
      transparent: true,
      opacity: 0.48,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const starsMesh = new THREE.Points(starGeo, starMat);
    scene.add(starsMesh);

    // =========================================================================
    // 8. SPACETIME GRAVITATIONAL WAVE RIPPLE (Click / Tap Shockwave)
    // =========================================================================
    const waveRingGeo = new THREE.RingGeometry(horizonRadius * 1.05, horizonRadius * 1.3, isMobile ? 32 : 48);
    const waveRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const waveRing = new THREE.Mesh(waveRingGeo, waveRingMat);
    blackHoleGroup.add(waveRing);

    let waveActive = false;
    let waveProgress = 0;

    const triggerGravitationalWave = () => {
      waveActive = true;
      waveProgress = 0;
      waveRingMat.opacity = 0.95;

      photonRingMat.opacity = 1.0;
      accretionGlow1.intensity = isMobile ? 6.0 : 8.5;
      accretionGlow2.intensity = isMobile ? 5.5 : 7.5;
      pointerLight.intensity = isMobile ? 5.5 : 8.0;
    };

    // =========================================================================
    // 9. HIGH-PERFORMANCE INTERACTION LISTENERS (Zero Allocations in Event Loop)
    // =========================================================================
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    let targetScrollProgress = 0;
    let currentScrollProgress = 0;

    // Pre-allocated scratch vectors to prevent GC pauses during pointer moves
    const _scratchVec = new THREE.Vector3();
    const _scratchDir = new THREE.Vector3();
    const _scratchPos = new THREE.Vector3();

    const handlePointerMove = (e: PointerEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;

      _scratchVec.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1, 0.5);
      _scratchVec.unproject(camera);
      _scratchDir.copy(_scratchVec).sub(camera.position).normalize();
      _scratchPos.copy(camera.position).addScaledVector(_scratchDir, 150);
      pointerLight.position.lerp(_scratchPos, 0.22);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        targetX = (touch.clientX / window.innerWidth - 0.5) * 1.4;
        targetY = (touch.clientY / window.innerHeight - 0.5) * 1.4;
      }
    };

    const handleWindowClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, select, textarea, [role="button"]')) {
        return;
      }
      triggerGravitationalWave();
    };

    let cachedMaxScroll = 1000;
    const updateMaxScroll = () => {
      cachedMaxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };
    updateMaxScroll();

    const handleScroll = () => {
      targetScrollProgress = Math.min(1, Math.max(0, window.scrollY / cachedMaxScroll));
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('click', handleWindowClick, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const handleResize = () => {
      if (!container) return;
      updateMaxScroll();
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    let isTabVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // =========================================================================
    // 10. BUTTERY-SMOOTH 60/120FPS GPU ACCELERATED RENDER LOOP
    // =========================================================================
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isTabVisible) return;

      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      // Smooth scroll interpolation
      currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.07;

      // Pointer frame-dragging smoothing
      currentX += (targetX - currentX) * (isMobile ? 0.04 : 0.06);
      currentY += (targetY - currentY) * (isMobile ? 0.04 : 0.06);

      // Camera dynamic cosmic glide along the scroll journey
      if (!prefersReducedMotion) {
        const scrollCameraY = (isMobile ? 12 : 16) - currentScrollProgress * 22;
        const scrollCameraZ = (isMobile ? 190 : 175) - currentScrollProgress * 30;
        const scrollCameraTilt = Math.sin(currentScrollProgress * Math.PI) * 4;

        camera.position.x = currentX * (isMobile ? 7 : 14) + scrollCameraTilt;
        camera.position.y = -currentY * (isMobile ? 5 : 9) + scrollCameraY;
        camera.position.z = scrollCameraZ;
        camera.lookAt(0, isMobile ? 4 : 8, -30);

        // Relativistic Frame-Dragging: Black hole tilts smoothly toward pointer
        blackHoleGroup.rotation.y = time * 0.08 + currentX * 0.75 + currentScrollProgress * Math.PI * 0.8;
        blackHoleGroup.rotation.x = 0.42 + currentY * 0.45;
        blackHoleGroup.rotation.z = -0.16 + currentX * 0.2;

        // Distant stars slow drift
        starsMesh.rotation.y = time * 0.01;
      }

      // Einstein Photon Ring Breathing & Look-At Camera
      const lensPulse = 1.0 + Math.sin(time * 3.0) * 0.03;
      photonRing.scale.set(lensPulse, lensPulse, lensPulse);
      photonRing.lookAt(camera.position);

      verticalLensing.rotation.y = Math.PI / 2 + Math.sin(time * 0.5) * 0.08;

      // -----------------------------------------------------------------------
      // Pure GPU Keplarian Accretion Ring Rotations (Zero CPU VBO re-uploads!)
      // -----------------------------------------------------------------------
      const speedMultiplier = waveActive ? 1.8 : 1.0;
      innerRing.rotation.y += delta * 0.95 * speedMultiplier;
      midRing.rotation.y += delta * 0.55 * speedMultiplier;
      outerRing.rotation.y += delta * 0.32 * speedMultiplier;

      // -----------------------------------------------------------------------
      // Spacetime Gravitational Wave Ripple
      // -----------------------------------------------------------------------
      if (waveActive) {
        waveProgress += delta * 1.8;
        const waveScale = 1.0 + waveProgress * 4.5;
        waveRing.scale.set(waveScale, waveScale, waveScale);
        waveRingMat.opacity = Math.max(0, 0.95 * (1.0 - waveProgress));

        if (waveProgress >= 1.0) {
          waveActive = false;
        }
      }

      // Lighting decay back to baseline
      const baseGlow1 = isMobile ? 3.5 : 5.0;
      const baseGlow2 = isMobile ? 3.0 : 4.5;
      const basePointer = isMobile ? 2.5 : 3.8;

      if (accretionGlow1.intensity > baseGlow1) {
        accretionGlow1.intensity += (baseGlow1 - accretionGlow1.intensity) * 0.05;
      }
      if (accretionGlow2.intensity > baseGlow2) {
        accretionGlow2.intensity += (baseGlow2 - accretionGlow2.intensity) * 0.05;
      }
      if (pointerLight.intensity > basePointer) {
        pointerLight.intensity += (basePointer - pointerLight.intensity) * 0.05;
      }
      if (photonRingMat.opacity > 0.9) {
        photonRingMat.opacity += (0.9 - photonRingMat.opacity) * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('click', handleWindowClick);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      horizonGeo.dispose();
      horizonMat.dispose();
      shadowHaloGeo.dispose();
      shadowHaloMat.dispose();
      photonRingGeo.dispose();
      photonRingMat.dispose();
      verticalLensingGeo.dispose();
      verticalLensingMat.dispose();
      secondaryLensingGeo.dispose();
      secondaryLensingMat.dispose();

      innerRing.geometry.dispose();
      (innerRing.material as THREE.Material).dispose();
      midRing.geometry.dispose();
      (midRing.material as THREE.Material).dispose();
      outerRing.geometry.dispose();
      (outerRing.material as THREE.Material).dispose();

      jetCoreGeo.dispose();
      jetCoreMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      waveRingGeo.dispose();
      waveRingMat.dispose();
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
        background: 'radial-gradient(ellipse at 50% 35%, #0f0724 0%, #05030a 70%, #020106 100%)',
      }}
      aria-hidden="true"
    />
  );
}
