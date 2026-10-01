'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Move3d, Sparkles, X } from 'lucide-react';

interface BackgroundCanvas3DProps {
  onReplayIntro?: () => void;
}

export default function BackgroundCanvas3D({ onReplayIntro }: BackgroundCanvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [showHint, setShowHint] = useState<boolean>(true);
  const [activeInteractions, setActiveInteractions] = useState<number>(0);

  useEffect(() => {
    // 1. WebGL Verification
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

    // 2. Clean, Deep-Space Scene & Perspective Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05030a, 0.0016);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      1200
    );
    camera.position.set(0, 0, 210);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 3. Dynamic Interactive Lighting
    const ambientLight = new THREE.AmbientLight(0x1a0d33, 1.2);
    scene.add(ambientLight);

    const softPurpleGlow = new THREE.PointLight(0xa855f7, 2.5, 600);
    softPurpleGlow.position.set(90, 60, 80);
    scene.add(softPurpleGlow);

    const softCyanGlow = new THREE.PointLight(0x38bdf8, 2.0, 500);
    softCyanGlow.position.set(-90, -50, 70);
    scene.add(softCyanGlow);

    // Real-time Cursor Follower Light
    const pointerLight = new THREE.PointLight(0xc084fc, 4.5, 420);
    pointerLight.position.set(0, 0, 90);
    scene.add(pointerLight);

    // =========================================================================
    // 4. FLOATING CELESTIAL PRISM & GYROSCOPIC RINGS (Drag & Scroll Reactive)
    // =========================================================================
    const prismGroup = new THREE.Group();
    prismGroup.position.set(0, 10, -40);
    scene.add(prismGroup);

    // 4A. Outer Faceted Holographic Icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(isMobile ? 32 : 48, 1);
    const icoMat = new THREE.MeshPhongMaterial({
      color: 0x7c3aed,
      emissive: 0x3b0764,
      specular: 0xc084fc,
      shininess: 90,
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    prismGroup.add(icoMesh);

    // Semi-translucent inner crystal face
    const innerFaceGeo = new THREE.IcosahedronGeometry(isMobile ? 31.4 : 47.1, 0);
    const innerFaceMat = new THREE.MeshPhongMaterial({
      color: 0x9333ea,
      emissive: 0x2e1065,
      specular: 0x38bdf8,
      shininess: 100,
      transparent: true,
      opacity: 0.16,
      flatShading: true,
    });
    const innerFaceMesh = new THREE.Mesh(innerFaceGeo, innerFaceMat);
    prismGroup.add(innerFaceMesh);

    // 4B. Inner Concentric Octahedron Core
    const octGeo = new THREE.OctahedronGeometry(isMobile ? 18 : 28, 0);
    const octMat = new THREE.MeshPhongMaterial({
      color: 0x38bdf8,
      emissive: 0x0369a1,
      specular: 0xffffff,
      shininess: 100,
      wireframe: true,
      transparent: true,
      opacity: 0.42,
    });
    const octMesh = new THREE.Mesh(octGeo, octMat);
    prismGroup.add(octMesh);

    // 4C. Primary Celestial Orbital Ring
    const ring1Geo = new THREE.TorusGeometry(isMobile ? 65 : 98, 1.0, 12, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Mesh.rotation.x = Math.PI / 3;
    prismGroup.add(ring1Mesh);

    // 4D. Secondary Orthogonal Gyroscopic Ring
    const ring2Geo = new THREE.TorusGeometry(isMobile ? 78 : 115, 0.8, 12, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.y = Math.PI / 4;
    ring2Mesh.rotation.x = -Math.PI / 5;
    prismGroup.add(ring2Mesh);

    // 4E. Interactive Expanding 3D Shockwave Ring (Triggers on click)
    const shockwaveGeo = new THREE.RingGeometry(1, 3.5, 36);
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
    // 5. INTERACTIVE LUMINESCENT EMBERS (Cosmic particle field with parallax)
    // =========================================================================
    const emberCount = isMobile ? 38 : 65;
    const emberGeo = new THREE.BufferGeometry();
    const emberPositions = new Float32Array(emberCount * 3);
    const emberBaseSpeeds = new Float32Array(emberCount);
    const emberOriginalPos = new Float32Array(emberCount * 3);

    for (let i = 0; i < emberCount; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * 480;
      const y = (Math.random() - 0.5) * 360;
      const z = (Math.random() - 0.5) * 280;

      emberPositions[i3] = x;
      emberPositions[i3 + 1] = y;
      emberPositions[i3 + 2] = z;

      emberOriginalPos[i3] = x;
      emberOriginalPos[i3 + 1] = y;
      emberOriginalPos[i3 + 2] = z;

      emberBaseSpeeds[i] = 0.03 + Math.random() * 0.06;
    }

    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));

    // High quality glowing circle sprite
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.2, 'rgba(192, 132, 252, 0.8)');
      grad.addColorStop(0.6, 'rgba(147, 51, 234, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 64, 64);
    }
    const emberTexture = new THREE.CanvasTexture(pCanvas);

    const emberMat = new THREE.PointsMaterial({
      size: isMobile ? 5.0 : 6.5,
      map: emberTexture,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const embersField = new THREE.Points(emberGeo, emberMat);
    scene.add(embersField);

    // =========================================================================
    // 6. SILKY HOLOGRAPHIC WAVE RIBBON (Harmonic mesh)
    // =========================================================================
    const waveGeo = new THREE.PlaneGeometry(450, 280, 24, 16);
    waveGeo.rotateX(-Math.PI / 2.35);
    waveGeo.translate(0, -70, -65);

    const waveMat = new THREE.MeshBasicMaterial({
      color: 0x7c3aed,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    scene.add(waveMesh);

    // =========================================================================
    // 7. USER INTERACTION: Drag to Orbit, Click Shockwave, Parallax & Scroll Physics
    // =========================================================================
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    let isDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let manualRotX = 0;
    let manualRotY = 0;
    let dragVelocityX = 0;
    let dragVelocityY = 0;

    let shockwaveActive = false;
    let shockwaveProgress = 0;

    let targetScrollProgress = 0;
    let currentScrollProgress = 0;
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;

    // Trigger 3D Holographic Shockwave
    const triggerShockwave = (clientX?: number, clientY?: number) => {
      shockwaveActive = true;
      shockwaveProgress = 0;
      shockwaveMat.opacity = 0.85;

      if (clientX !== undefined && clientY !== undefined) {
        const normX = (clientX / window.innerWidth - 0.5) * 160;
        const normY = -(clientY / window.innerHeight - 0.5) * 120;
        shockwaveMesh.position.set(normX, normY, -20);
      } else {
        shockwaveMesh.position.set(0, 0, -20);
      }

      // Flash pointer light on impact
      pointerLight.intensity = 7.0;
      setActiveInteractions((prev) => prev + 1);
    };

    // Pointer Move: Update Parallax and 3D Pointer Light
    const handlePointerMove = (e: PointerEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;

      // Project pointer into 3D world coordinates for pointerLight
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      const vector = new THREE.Vector3(normX, normY, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = 160;
      const pos = camera.position.clone().add(dir.multiplyScalar(distance));
      pointerLight.position.lerp(pos, 0.25);

      // Handle interactive drag rotation
      if (isDragging) {
        const dx = e.clientX - lastPointerX;
        const dy = e.clientY - lastPointerY;
        dragVelocityX = dx * 0.007;
        dragVelocityY = dy * 0.007;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      // Don't intercept clicks on interactive UI elements
      if (target.closest('button, a, input, select, textarea, [role="button"]')) {
        return;
      }
      isDragging = true;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
    };

    const handlePointerUp = () => {
      isDragging = false;
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
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('pointercancel', handlePointerUp, { passive: true });
    window.addEventListener('click', handleWindowClick, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial scroll sync
    handleScroll();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Tab visibility handling
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
      currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.07;
      scrollVelocity *= 0.92; // smooth decay

      // Smooth damped camera tilt & scroll traversal
      if (!prefersReducedMotion) {
        currentX += (targetX - currentX) * 0.04;
        currentY += (targetY - currentY) * 0.04;

        // Camera navigates through 3D cosmic coordinates as user scrolls
        const scrollCameraY = -currentScrollProgress * 135;
        const scrollCameraZ = 210 - Math.sin(currentScrollProgress * Math.PI) * 50;
        const scrollCameraTilt = Math.sin(currentScrollProgress * Math.PI * 2) * 6;

        camera.position.x = currentX * 12 + scrollCameraTilt;
        camera.position.y = -currentY * 8 + scrollCameraY;
        camera.position.z = scrollCameraZ;
        camera.lookAt(0, scrollCameraY * 0.6, 0);

        // Apply drag momentum with smooth inertia
        manualRotX += dragVelocityX;
        manualRotY += dragVelocityY;
        dragVelocityX *= 0.94;
        dragVelocityY *= 0.94;

        // Celestial prism rotation: time + user drag + continuous 3D scroll progression
        const scrollRot = currentScrollProgress * Math.PI * 2.6;
        icoMesh.rotation.y = time * 0.03 + manualRotX + scrollRot;
        icoMesh.rotation.x = time * 0.02 + manualRotY + Math.sin(currentScrollProgress * Math.PI) * 0.35;
        innerFaceMesh.rotation.y = icoMesh.rotation.y;
        innerFaceMesh.rotation.x = icoMesh.rotation.x;

        octMesh.rotation.y = -time * 0.04 - manualRotX * 1.3 - scrollRot * 1.2;
        octMesh.rotation.z = time * 0.03 + manualRotY * 0.8;

        ring1Mesh.rotation.z = time * 0.02 + manualRotX * 0.6 + scrollRot * 0.5;
        ring2Mesh.rotation.z = -time * 0.022 + manualRotY * 0.6 - scrollRot * 0.4;

        // Breathing elevation
        prismGroup.position.y = 10 + Math.sin(time * 0.6) * 4;
      }

      // Smoothly return pointer light intensity to ambient baseline
      if (pointerLight.intensity > 4.5) {
        pointerLight.intensity += (4.5 - pointerLight.intensity) * 0.08;
      }

      // 3D Shockwave ring propagation
      if (shockwaveActive) {
        shockwaveProgress += delta * 3.5;
        const scale = 1 + shockwaveProgress * 32;
        shockwaveMesh.scale.set(scale, scale, scale);
        shockwaveMat.opacity = Math.max(0, 0.85 * (1 - shockwaveProgress));

        if (shockwaveProgress >= 1) {
          shockwaveActive = false;
        }
      }

      // Particle physics with multi-layer scroll parallax & cursor deflection
      const pos = emberGeo.attributes.position.array as Float32Array;
      const pointer3DX = (targetX * 120);
      const pointer3DY = (-targetY * 90);

      for (let i = 0; i < emberCount; i++) {
        const i3 = i * 3;
        // Upward cosmic drift + scroll parallax velocity
        const zDepth = pos[i3 + 2];
        const parallaxFactor = 1.0 + (zDepth + 140) / 280; // Closer particles move faster
        pos[i3 + 1] += (emberBaseSpeeds[i] * 0.75) + (scrollVelocity * 0.003 * parallaxFactor);

        if (pos[i3 + 1] > 190) {
          pos[i3 + 1] = -190;
          pos[i3] = (Math.random() - 0.5) * 480;
        }

        // Interactive cursor repulsion / magnetic flow
        const dx = pos[i3] - pointer3DX;
        const dy = pos[i3 + 1] - pointer3DY;
        const distSq = dx * dx + dy * dy;
        if (distSq < 3600) { // Within 60 unit radius
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / 60) * 0.8;
          pos[i3] += (dx / dist) * force;
          pos[i3 + 1] += (dy / dist) * force;
        }

        // Radial impulse from shockwave
        if (shockwaveActive) {
          const swDist = Math.sqrt(pos[i3] * pos[i3] + pos[i3 + 1] * pos[i3 + 1]);
          const targetDist = shockwaveProgress * 140;
          const diff = Math.abs(swDist - targetDist);
          if (diff < 25) {
            const push = (1 - diff / 25) * 1.8;
            pos[i3 + 1] += push;
          }
        }
      }
      emberGeo.attributes.position.needsUpdate = true;

      // Silky undulating wave motion (accelerates during scroll)
      const wavePos = waveGeo.attributes.position;
      const waveSpeed = 0.8 + scrollVelocity * 0.05;
      for (let i = 0; i < wavePos.count; i++) {
        const u = wavePos.getX(i);
        const v = wavePos.getY(i);
        const z =
          Math.sin(u * 0.024 + time * waveSpeed) * 6.5 +
          Math.cos(v * 0.028 + time * waveSpeed * 0.8) * 5.0;
        wavePos.setZ(i, z);
      }
      waveGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('click', handleWindowClick);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      emberGeo.dispose();
      emberMat.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      innerFaceGeo.dispose();
      innerFaceMat.dispose();
      octGeo.dispose();
      octMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      shockwaveGeo.dispose();
      shockwaveMat.dispose();
      waveGeo.dispose();
      waveMat.dispose();
      emberTexture.dispose();
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
    <>
      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #0d0722 0%, #05030a 70%, #030107 100%)',
        }}
        aria-hidden="true"
      />

      {/* Discreet 3D Space Interactive Discovery Badge */}
      {showHint && (
        <div className="fixed bottom-5 right-5 z-40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 pointer-events-auto">
          <div className="px-3.5 py-1.5 rounded-full bg-[#120a24]/85 border border-purple-500/30 text-[11px] font-mono text-purple-200/90 shadow-xl shadow-purple-950/60 backdrop-blur-md flex items-center gap-2 select-none group">
            <Move3d className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>3D Canvas: Drag to Orbit • Scroll to Traverse</span>
            <button
              onClick={() => setShowHint(false)}
              className="ml-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
