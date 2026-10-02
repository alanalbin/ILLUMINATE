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
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5));
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
    // Positioned deep in space, slightly elevated to frame the page beautifully
    blackHoleGroup.position.set(0, isMobile ? 6 : 10, -45);
    blackHoleGroup.rotation.x = 0.42;
    blackHoleGroup.rotation.z = -0.16;
    scene.add(blackHoleGroup);

    // 4A. Event Horizon (Schwarzschild Void Sphere)
    const horizonRadius = isMobile ? 12 : 16;
    const horizonGeo = new THREE.SphereGeometry(horizonRadius, isMobile ? 28 : 40, isMobile ? 28 : 40);
    const horizonMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      depthWrite: true,
    });
    const horizonMesh = new THREE.Mesh(horizonGeo, horizonMat);
    blackHoleGroup.add(horizonMesh);

    // Gravitational shadow falloff halo
    const shadowHaloGeo = new THREE.SphereGeometry(horizonRadius * 1.03, 32, 32);
    const shadowHaloMat = new THREE.MeshBasicMaterial({
      color: 0x070212,
      transparent: true,
      opacity: 0.95,
    });
    const shadowHaloMesh = new THREE.Mesh(shadowHaloGeo, shadowHaloMat);
    blackHoleGroup.add(shadowHaloMesh);

    // 4B. Photon Sphere (Einstein Ring)
    const photonRingGeo = new THREE.RingGeometry(horizonRadius * 1.04, horizonRadius * 1.18, 64);
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
      isMobile ? 1.0 : 1.4,
      isMobile ? 14 : 20,
      isMobile ? 60 : 96
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
      isMobile ? 0.6 : 0.9,
      12,
      isMobile ? 48 : 80
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
    // 5. KEPLERIAN ACCRETION DISK (Swirling Stardust & Relativistic Plasma)
    // =========================================================================
    // Glowing radial particle sprite
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 64;
    spriteCanvas.height = 64;
    const sCtx = spriteCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.2, 'rgba(240, 230, 255, 0.95)');
      grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.6)');
      grad.addColorStop(0.8, 'rgba(168, 85, 247, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(spriteCanvas);

    const accretionParticleCount = isMobile ? 260 : 520;
    const accretionGeo = new THREE.BufferGeometry();
    const accretionPositions = new Float32Array(accretionParticleCount * 3);
    const accretionColors = new Float32Array(accretionParticleCount * 3);

    interface AccretionParticle {
      radius: number;
      angle: number;
      angularSpeed: number;
      yOffset: number;
    }
    const accretionData: AccretionParticle[] = [];

    const minR = horizonRadius * 1.25;
    const maxR = horizonRadius * (isMobile ? 4.5 : 5.8);

    const colWhite = new THREE.Color(0xffffff);
    const colCyan = new THREE.Color(0x38bdf8);
    const colViolet = new THREE.Color(0xa855f7);
    const colDeep = new THREE.Color(0x6366f1);

    for (let i = 0; i < accretionParticleCount; i++) {
      const normR = Math.pow(Math.random(), 0.7);
      const radius = THREE.MathUtils.lerp(minR, maxR, normR);
      const angle = Math.random() * Math.PI * 2;
      // Keplerian orbital velocity: v ~ 1/sqrt(r)
      const angularSpeed = (4.8 / Math.sqrt(radius)) * (0.85 + Math.random() * 0.3);
      const yOffset = (Math.random() - 0.5) * (isMobile ? 1.4 : 2.2) * (radius / maxR);

      accretionData.push({ radius, angle, angularSpeed, yOffset });

      accretionPositions[i * 3] = Math.cos(angle) * radius;
      accretionPositions[i * 3 + 1] = yOffset;
      accretionPositions[i * 3 + 2] = Math.sin(angle) * radius;

      // Relativistic temperature gradient
      const tempColor = new THREE.Color();
      if (normR < 0.2) {
        tempColor.lerpColors(colWhite, colCyan, normR / 0.2);
      } else if (normR < 0.6) {
        tempColor.lerpColors(colCyan, colViolet, (normR - 0.2) / 0.4);
      } else {
        tempColor.lerpColors(colViolet, colDeep, (normR - 0.6) / 0.4);
      }
      accretionColors[i * 3] = tempColor.r;
      accretionColors[i * 3 + 1] = tempColor.g;
      accretionColors[i * 3 + 2] = tempColor.b;
    }

    accretionGeo.setAttribute('position', new THREE.BufferAttribute(accretionPositions, 3));
    accretionGeo.setAttribute('color', new THREE.BufferAttribute(accretionColors, 3));

    const accretionMat = new THREE.PointsMaterial({
      size: isMobile ? 3.5 : 4.8,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: isMobile ? 0.6 : 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const accretionMesh = new THREE.Points(accretionGeo, accretionMat);
    blackHoleGroup.add(accretionMesh);

    // =========================================================================
    // 6. RELATIVISTIC POLAR ASTROPHYSICAL JETS
    // =========================================================================
    const jetGroup = new THREE.Group();
    blackHoleGroup.add(jetGroup);

    const jetCoreGeo = new THREE.CylinderGeometry(0.3, 3.2, isMobile ? 45 : 65, 16, 1, true);
    const jetCoreMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const jetNorth = new THREE.Mesh(jetCoreGeo, jetCoreMat);
    jetNorth.position.y = isMobile ? 25 : 35;
    jetGroup.add(jetNorth);

    const jetSouth = new THREE.Mesh(jetCoreGeo, jetCoreMat);
    jetSouth.position.y = isMobile ? -25 : -35;
    jetSouth.rotation.x = Math.PI;
    jetGroup.add(jetSouth);

    // =========================================================================
    // 7. DISTANT WARPED COSMIC STARS (Deep Space Field)
    // =========================================================================
    const starCount = isMobile ? 60 : 130;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * (isMobile ? 320 : 450);
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * (isMobile ? 220 : 320);
      starPositions[i * 3 + 2] = THREE.MathUtils.lerp(-80, -320, Math.random());
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    const starMat = new THREE.PointsMaterial({
      size: isMobile ? 2.5 : 3.6,
      map: particleTexture,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const starsMesh = new THREE.Points(starGeo, starMat);
    scene.add(starsMesh);

    // =========================================================================
    // 8. SPACETIME GRAVITATIONAL WAVE RIPPLE (Click / Tap Shockwave)
    // =========================================================================
    const waveRingGeo = new THREE.RingGeometry(horizonRadius * 1.05, horizonRadius * 1.3, 64);
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

    const triggerGravitationalWave = (clientX?: number, clientY?: number) => {
      waveActive = true;
      waveProgress = 0;
      waveRingMat.opacity = 0.95;

      // Flare photon sphere and lights on gravitational burst
      photonRingMat.opacity = 1.0;
      accretionGlow1.intensity = isMobile ? 7.0 : 10.0;
      accretionGlow2.intensity = isMobile ? 6.0 : 8.5;
      pointerLight.intensity = isMobile ? 6.5 : 9.0;
    };

    // =========================================================================
    // 9. INTERACTION LISTENERS: Cursor Frame-Dragging & Smooth Scroll Orbit
    // =========================================================================
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    let targetScrollProgress = 0;
    let currentScrollProgress = 0;

    const handlePointerMove = (e: PointerEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;

      // Project pointer into 3D world space for responsive follower light
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      const vector = new THREE.Vector3(normX, normY, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = 150;
      const pos = camera.position.clone().add(dir.multiplyScalar(distance));
      pointerLight.position.lerp(pos, 0.22);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        targetX = (touch.clientX / window.innerWidth - 0.5) * 1.5;
        targetY = (touch.clientY / window.innerHeight - 0.5) * 1.5;
      }
    };

    const handleWindowClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, select, textarea, [role="button"]')) {
        return;
      }
      triggerGravitationalWave(e.clientX, e.clientY);
    };

    let cachedMaxScroll = 1000;
    const updateMaxScroll = () => {
      cachedMaxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };
    updateMaxScroll();

    const handleScroll = () => {
      const scrollY = window.scrollY;
      targetScrollProgress = Math.min(1, Math.max(0, scrollY / cachedMaxScroll));
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
    // 10. 60FPS RELATIVISTIC ANIMATION LOOP
    // =========================================================================
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isTabVisible) return;

      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      // Smooth scroll interpolation
      currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.06;

      // Pointer frame-dragging smoothing
      currentX += (targetX - currentX) * (isMobile ? 0.03 : 0.05);
      currentY += (targetY - currentY) * (isMobile ? 0.03 : 0.05);

      // Camera dynamic cosmic glide along the scroll journey
      if (!prefersReducedMotion) {
        const scrollCameraY = (isMobile ? 12 : 16) - currentScrollProgress * 22;
        const scrollCameraZ = (isMobile ? 190 : 175) - currentScrollProgress * 30;
        const scrollCameraTilt = Math.sin(currentScrollProgress * Math.PI) * 4;

        camera.position.x = currentX * (isMobile ? 8 : 16) + scrollCameraTilt;
        camera.position.y = -currentY * (isMobile ? 6 : 10) + scrollCameraY;
        camera.position.z = scrollCameraZ;
        camera.lookAt(0, isMobile ? 4 : 8, -30);

        // Relativistic Frame-Dragging: Black hole tilts towards pointer
        blackHoleGroup.rotation.y = time * 0.08 + currentX * 0.75 + currentScrollProgress * Math.PI * 0.8;
        blackHoleGroup.rotation.x = 0.42 + currentY * 0.45;
        blackHoleGroup.rotation.z = -0.16 + currentX * 0.2;

        // Distant stars subtle drift
        starsMesh.rotation.y = time * 0.01 + currentX * 0.1;
      }

      // Einstein Photon Ring Breathing & Look-At Camera
      const lensPulse = 1.0 + Math.sin(time * 3.0) * 0.03;
      photonRing.scale.set(lensPulse, lensPulse, lensPulse);
      photonRing.lookAt(camera.position);

      verticalLensing.rotation.y = Math.PI / 2 + Math.sin(time * 0.5) * 0.08;

      // -----------------------------------------------------------------------
      // Keplerian Accretion Disk Physics & Relativistic Doppler Beaming
      // -----------------------------------------------------------------------
      const posArr = accretionGeo.attributes.position.array as Float32Array;
      const colArr = accretionGeo.attributes.color.array as Float32Array;

      for (let i = 0; i < accretionParticleCount; i++) {
        const p = accretionData[i];
        p.angle += p.angularSpeed * delta * (1.0 + (waveActive ? 0.8 : 0));

        const px = Math.cos(p.angle) * p.radius;
        const pz = Math.sin(p.angle) * p.radius;
        const py = p.yOffset + Math.sin(time * 2.0 + p.radius * 0.4) * 0.4;

        posArr[i * 3] = px;
        posArr[i * 3 + 1] = py;
        posArr[i * 3 + 2] = pz;

        // Relativistic Doppler Beaming factor
        const doppler = Math.sin(p.angle + blackHoleGroup.rotation.y);
        const factor = THREE.MathUtils.clamp(1.0 + doppler * 0.28, 0.7, 1.3);
        colArr[i * 3] = Math.min(1.0, colArr[i * 3] * factor);
        colArr[i * 3 + 1] = Math.min(1.0, colArr[i * 3 + 1] * factor);
        colArr[i * 3 + 2] = Math.min(1.0, colArr[i * 3 + 2] * factor);
      }
      accretionGeo.attributes.position.needsUpdate = true;
      accretionGeo.attributes.color.needsUpdate = true;

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
      accretionGeo.dispose();
      accretionMat.dispose();
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
