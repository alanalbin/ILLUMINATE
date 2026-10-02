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

    // 2. Deep Space Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05030a, 0.0016);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      1200
    );
    camera.position.set(0, 0, isMobile ? 240 : 210);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 3. Dynamic Cybernetic Lighting
    const ambientLight = new THREE.AmbientLight(0x1a0d33, 1.5);
    scene.add(ambientLight);

    const purpleGlow = new THREE.PointLight(0xa855f7, 3.0, 700);
    purpleGlow.position.set(110, 80, 100);
    scene.add(purpleGlow);

    const cyanGlow = new THREE.PointLight(0x38bdf8, 2.4, 600);
    cyanGlow.position.set(-110, -70, 90);
    scene.add(cyanGlow);

    // Interactive Follower Light
    const pointerLight = new THREE.PointLight(0xc084fc, 5.0, 480);
    pointerLight.position.set(0, 0, 90);
    scene.add(pointerLight);

    // =========================================================================
    // 4. NEW INTERACTIVE CENTERPIECE: QUANTUM DYSON GYROSCOPE & CELESTIAL PULSAR
    // =========================================================================
    const gyroscopeGroup = new THREE.Group();
    gyroscopeGroup.position.set(0, isMobile ? 0 : 5, -45);
    scene.add(gyroscopeGroup);

    // 4A. Inner Pulsating Plasma Singularity
    const plasmaGeo = new THREE.SphereGeometry(isMobile ? 10 : 15, 24, 24);
    const plasmaMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const plasmaMesh = new THREE.Mesh(plasmaGeo, plasmaMat);
    gyroscopeGroup.add(plasmaMesh);

    // 4B. Faceted Quantum Icosahedron Core
    const polyGeo = new THREE.IcosahedronGeometry(isMobile ? 18 : 27, 1);
    const polyMat = new THREE.MeshPhongMaterial({
      color: 0x8b5cf6,
      emissive: 0x4c1d95,
      specular: 0x38bdf8,
      shininess: 100,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const polyMesh = new THREE.Mesh(polyGeo, polyMat);
    gyroscopeGroup.add(polyMesh);

    // 4C. Tri-Axial Laser Gyroscope Rings (Orthogonal Gimbal Planes)
    const ringRadius1 = isMobile ? 36 : 52;
    const ringRadius2 = isMobile ? 48 : 70;
    const ringRadius3 = isMobile ? 62 : 90;

    const ring1Geo = new THREE.TorusGeometry(ringRadius1, 0.7, 14, 80);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    gyroscopeGroup.add(ring1Mesh);

    const ring2Geo = new THREE.TorusGeometry(ringRadius2, 0.65, 14, 80);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.x = Math.PI / 2.8;
    gyroscopeGroup.add(ring2Mesh);

    const ring3Geo = new THREE.TorusGeometry(ringRadius3, 0.6, 14, 80);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: 0xe879f9,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });
    const ring3Mesh = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3Mesh.rotation.y = Math.PI / 3;
    ring3Mesh.rotation.z = Math.PI / 5;
    gyroscopeGroup.add(ring3Mesh);

    // 4D. Glowing Orbiting Photon Satellites (Racing along the gimbal rings)
    const satGeo = new THREE.SphereGeometry(isMobile ? 1.6 : 2.4, 12, 12);
    const satMatViolet = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
    });
    const satMatCyan = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      blending: THREE.AdditiveBlending,
    });

    const satMesh1 = new THREE.Mesh(satGeo, satMatViolet);
    const satMesh2 = new THREE.Mesh(satGeo, satMatViolet);
    const satMesh3 = new THREE.Mesh(satGeo, satMatCyan);
    const satMesh4 = new THREE.Mesh(satGeo, satMatCyan);
    gyroscopeGroup.add(satMesh1);
    gyroscopeGroup.add(satMesh2);
    gyroscopeGroup.add(satMesh3);
    gyroscopeGroup.add(satMesh4);

    // 4E. Outer Celestial Geodesic Astrolabe Cage
    const cageGeo = new THREE.DodecahedronGeometry(isMobile ? 74 : 110, 1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x7c3aed,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    gyroscopeGroup.add(cageMesh);

    // =========================================================================
    // 5. INTERACTIVE VORTEX ACCRETION PARTICLES (Swirling Cosmic Star Dust)
    // =========================================================================
    const particleCount = isMobile ? 48 : 100;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleOrbits: { radius: number; angle: number; speed: number; yOffset: number; ySpeed: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const radius = THREE.MathUtils.lerp(isMobile ? 35 : 55, isMobile ? 150 : 220, Math.random());
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.2 + Math.random() * 0.4) * (Math.random() > 0.5 ? 1 : -1);
      const yOffset = (Math.random() - 0.5) * 90;
      const ySpeed = (Math.random() - 0.5) * 0.4;

      particleOrbits.push({ radius, angle, speed, yOffset, ySpeed });

      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = yOffset;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // High fidelity glowing circular sprite
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.2, 'rgba(192, 132, 252, 0.9)');
      grad.addColorStop(0.6, 'rgba(56, 189, 248, 0.4)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(pCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: isMobile ? 5.5 : 7.0,
      map: particleTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particlesMesh = new THREE.Points(particleGeo, particleMat);
    scene.add(particlesMesh);

    // =========================================================================
    // 6. INTERACTIVE EXPANDING SUPERNOVA SHOCKWAVE (Click/Tap Reaction)
    // =========================================================================
    const shockwaveGeo = new THREE.RingGeometry(1, 3.5, 48);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveMesh.position.set(0, 0, -20);
    scene.add(shockwaveMesh);

    // =========================================================================
    // 7. USER INTERACTION: Touch/Pointer Tracking, Shockwave & Smooth Scroll
    // =========================================================================
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    let shockwaveActive = false;
    let shockwaveProgress = 0;

    let targetScrollProgress = 0;
    let currentScrollProgress = 0;
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;

    const triggerShockwave = (clientX?: number, clientY?: number) => {
      shockwaveActive = true;
      shockwaveProgress = 0;
      shockwaveMat.opacity = 0.9;

      if (clientX !== undefined && clientY !== undefined) {
        const normX = (clientX / window.innerWidth - 0.5) * 160;
        const normY = -(clientY / window.innerHeight - 0.5) * 120;
        shockwaveMesh.position.set(normX, normY, -20);
      } else {
        shockwaveMesh.position.set(0, 0, -20);
      }

      pointerLight.intensity = 8.5;
    };

    const handlePointerMove = (e: PointerEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;

      // Project pointer into 3D world space
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      const vector = new THREE.Vector3(normX, normY, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = 160;
      const pos = camera.position.clone().add(dir.multiplyScalar(distance));
      pointerLight.position.lerp(pos, 0.25);
    };

    // Passive touch support for mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        targetX = (touch.clientX / window.innerWidth - 0.5) * 1.6;
        targetY = (touch.clientY / window.innerHeight - 0.5) * 1.6;
      }
    };

    const handleWindowClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, select, textarea, [role="button"]')) {
        return;
      }
      triggerShockwave(e.clientX, e.clientY);
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      targetScrollProgress = Math.min(1, Math.max(0, scrollY / maxScroll));
      scrollVelocity = Math.abs(scrollY - lastScrollY);
      lastScrollY = scrollY;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('click', handleWindowClick, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    handleScroll();

    const handleResize = () => {
      if (!container) return;
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
    // 8. HIGH-PERFORMANCE 60FPS ANIMATION LOOP
    // =========================================================================
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isTabVisible) return;

      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      // Smooth scroll interpolation
      currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.08;
      scrollVelocity *= 0.92;

      // Parallax camera tilt & smooth scroll descent
      if (!prefersReducedMotion) {
        currentX += (targetX - currentX) * (isMobile ? 0.03 : 0.05);
        currentY += (targetY - currentY) * (isMobile ? 0.03 : 0.05);

        const scrollCameraY = -currentScrollProgress * (isMobile ? 80 : 130);
        const scrollCameraZ = (isMobile ? 240 : 210) - Math.sin(currentScrollProgress * Math.PI) * 40;
        const scrollCameraTilt = Math.sin(currentScrollProgress * Math.PI * 2) * 4;

        camera.position.x = currentX * (isMobile ? 8 : 15) + scrollCameraTilt;
        camera.position.y = -currentY * (isMobile ? 6 : 10) + scrollCameraY;
        camera.position.z = scrollCameraZ;
        camera.lookAt(0, scrollCameraY * 0.5, 0);

        // Core Pulsar Pulse Animation (Breathing rhythm)
        const pulse = 1 + Math.sin(time * 3.2) * 0.12;
        plasmaMesh.scale.set(pulse, pulse, pulse);
        plasmaMat.opacity = 0.75 + Math.sin(time * 3.2) * 0.2;

        // Interactive Lean of Gyroscope towards pointer
        const scrollRot = currentScrollProgress * Math.PI * 2.2;
        gyroscopeGroup.rotation.x = currentY * 0.35 + Math.sin(time * 0.4) * 0.1;
        gyroscopeGroup.rotation.y = currentX * 0.45 + time * 0.15 + scrollRot;
        gyroscopeGroup.position.y = (isMobile ? 0 : 5) + Math.sin(time * 0.8) * 4;

        // Polyhedral core rotation
        polyMesh.rotation.y = -time * 0.25 - scrollRot * 0.8;
        polyMesh.rotation.x = time * 0.15;

        // Concentric Laser Rings Independent Rotations
        ring1Mesh.rotation.z = time * 0.25 + scrollRot * 0.4;
        ring2Mesh.rotation.x = Math.PI / 2.8 + time * 0.2;
        ring2Mesh.rotation.y = -time * 0.18;
        ring3Mesh.rotation.z = time * 0.14 - scrollRot * 0.3;

        // Outer Astrolabe Cage Slow Counter-Spin
        cageMesh.rotation.y = -time * 0.08;
        cageMesh.rotation.x = Math.sin(time * 0.3) * 0.15;

        // Position Orbiting Photon Satellites
        const satSpeed1 = time * 1.4;
        satMesh1.position.set(
          Math.cos(satSpeed1) * ringRadius1,
          Math.sin(satSpeed1) * ringRadius1,
          0
        );
        satMesh2.position.set(
          Math.cos(satSpeed1 + Math.PI) * ringRadius1,
          Math.sin(satSpeed1 + Math.PI) * ringRadius1,
          0
        );

        const satSpeed2 = time * 1.1;
        satMesh3.position.set(
          Math.cos(satSpeed2) * ringRadius2,
          0,
          Math.sin(satSpeed2) * ringRadius2
        );
        satMesh4.position.set(
          Math.cos(satSpeed2 + Math.PI) * ringRadius2,
          0,
          Math.sin(satSpeed2 + Math.PI) * ringRadius2
        );
      }

      // Pointer Light Intensity Decay
      if (pointerLight.intensity > 5.0) {
        pointerLight.intensity += (5.0 - pointerLight.intensity) * 0.06;
      }

      // 3D Shockwave Expansion
      if (shockwaveActive) {
        shockwaveProgress += delta * 3.2;
        const scale = 1 + shockwaveProgress * 36;
        shockwaveMesh.scale.set(scale, scale, scale);
        shockwaveMat.opacity = Math.max(0, 0.9 * (1 - shockwaveProgress));

        if (shockwaveProgress >= 1) {
          shockwaveActive = false;
        }
      }

      // Swirling Vortex Particle Physics
      const pPositions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const orbit = particleOrbits[i];
        orbit.angle += orbit.speed * delta * (1 + scrollVelocity * 0.02);
        orbit.yOffset += orbit.ySpeed * delta * 15;

        if (orbit.yOffset > 70) orbit.yOffset = -70;
        if (orbit.yOffset < -70) orbit.yOffset = 70;

        // Particle vortex position
        pPositions[i * 3] = Math.cos(orbit.angle) * orbit.radius;
        pPositions[i * 3 + 1] = orbit.yOffset;
        pPositions[i * 3 + 2] = Math.sin(orbit.angle) * orbit.radius;
      }
      particleGeo.attributes.position.needsUpdate = true;

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

      plasmaGeo.dispose();
      plasmaMat.dispose();
      polyGeo.dispose();
      polyMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      satGeo.dispose();
      satMatViolet.dispose();
      satMatCyan.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      particleTexture.dispose();
      shockwaveGeo.dispose();
      shockwaveMat.dispose();
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
