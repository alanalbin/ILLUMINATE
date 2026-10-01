'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Zap, RotateCcw } from 'lucide-react';

interface BackgroundCanvas3DProps {
  onReplayIntro?: () => void;
}

export default function BackgroundCanvas3D({ onReplayIntro }: BackgroundCanvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const shockwaveTriggerRef = useRef<(() => void) | null>(null);

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

    // 2. Clean, Deep-Space Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05030a, 0.0018);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      1000
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
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // 3. Ambient & Focused Lighting
    const ambientLight = new THREE.AmbientLight(0x1a0d33, 1.2);
    scene.add(ambientLight);

    const softPurpleGlow = new THREE.PointLight(0xa855f7, 2.5, 600);
    softPurpleGlow.position.set(90, 60, 80);
    scene.add(softPurpleGlow);

    const softCyanGlow = new THREE.PointLight(0x38bdf8, 2.0, 600);
    softCyanGlow.position.set(-90, -50, 70);
    scene.add(softCyanGlow);

    // =========================================================================
    // 1. FLOATING INTERACTIVE QUANTUM PARTICLES
    // =========================================================================
    const emberCount = isMobile ? 28 : 48;
    const emberGeo = new THREE.BufferGeometry();
    const emberPositions = new Float32Array(emberCount * 3);
    const emberOriginal = new Float32Array(emberCount * 3);
    const emberSpeeds = new Float32Array(emberCount);

    for (let i = 0; i < emberCount; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * 450;
      const y = (Math.random() - 0.5) * 350;
      const z = (Math.random() - 0.5) * 250;
      emberPositions[i3] = x;
      emberPositions[i3 + 1] = y;
      emberPositions[i3 + 2] = z;
      emberOriginal[i3] = x;
      emberOriginal[i3 + 1] = y;
      emberOriginal[i3 + 2] = z;
      emberSpeeds[i] = 0.04 + Math.random() * 0.06;
    }

    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.2, 'rgba(192, 132, 252, 0.8)');
      grad.addColorStop(0.55, 'rgba(126, 34, 206, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 64, 64);
    }
    const emberTexture = new THREE.CanvasTexture(pCanvas);

    const emberMat = new THREE.PointsMaterial({
      size: isMobile ? 5.5 : 7.0,
      map: emberTexture,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const embersField = new THREE.Points(emberGeo, emberMat);
    scene.add(embersField);

    // =========================================================================
    // 2. INTERACTIVE CELESTIAL QUANTUM PRISM SCULPTURE
    // =========================================================================
    const prismGroup = new THREE.Group();
    prismGroup.position.set(0, 6, -45);
    scene.add(prismGroup);

    // Faceted Outer Icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(isMobile ? 28 : 38, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    prismGroup.add(icoMesh);

    // Inner Concentric Octahedron Core
    const octGeo = new THREE.OctahedronGeometry(isMobile ? 16 : 22, 0);
    const octMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const octMesh = new THREE.Mesh(octGeo, octMat);
    prismGroup.add(octMesh);

    // Gyro Orbit Ring 1
    const ringGeo1 = new THREE.TorusGeometry(isMobile ? 55 : 75, 0.9, 12, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
    ringMesh1.rotation.x = Math.PI / 3;
    prismGroup.add(ringMesh1);

    // Gyro Orbit Ring 2 (Orthogonal counter-orbit)
    const ringGeo2 = new THREE.TorusGeometry(isMobile ? 65 : 88, 0.7, 12, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.y = Math.PI / 2.5;
    ringMesh2.rotation.z = Math.PI / 4;
    prismGroup.add(ringMesh2);

    // =========================================================================
    // 3. SILKY HOLOGRAPHIC WAVE RIBBON
    // =========================================================================
    const waveGeo = new THREE.PlaneGeometry(420, 260, 22, 16);
    waveGeo.rotateX(-Math.PI / 2.4);
    waveGeo.translate(0, -65, -60);

    const waveMat = new THREE.MeshBasicMaterial({
      color: 0x7c3aed,
      wireframe: true,
      transparent: true,
      opacity: 0.11,
      blending: THREE.AdditiveBlending,
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    scene.add(waveMesh);

    // =========================================================================
    // 4. ADVANCED 3D INTERACTION: Drag to Orbit, Deep Parallax & Particle Physics
    // =========================================================================
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    let isDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let rotVelocityX = 0;
    let rotVelocityY = 0;

    let shockwaveActive = false;
    let shockwaveRadius = 0;

    const triggerShockwave = () => {
      shockwaveActive = true;
      shockwaveRadius = 0;
      setIsInteracting(true);
      setTimeout(() => setIsInteracting(false), 1200);
    };
    shockwaveTriggerRef.current = triggerShockwave;

    // Pointer Move: tracks parallax & drag
    const handlePointerMove = (e: PointerEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;

      if (isDragging) {
        const deltaX = e.clientX - lastPointerX;
        const deltaY = e.clientY - lastPointerY;
        rotVelocityY += deltaX * 0.0035;
        rotVelocityX += deltaY * 0.0035;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
      }
    };

    // Pointer Down: starts drag if clicking empty background
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('select') ||
        target.closest('[role="button"]') ||
        target.closest('.interactive-stop')
      ) {
        return;
      }
      isDragging = true;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      setIsInteracting(true);
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    // Click handler for ripples on empty space
    const handleWindowClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('.glass-card')
      ) {
        return;
      }
      triggerShockwave();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('click', handleWindowClick, { passive: true });

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    let isTabVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 5. Smooth High-Performance Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isTabVisible) return;

      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      // Smooth damped camera tilt & deep parallax
      if (!prefersReducedMotion) {
        currentX += (targetX - currentX) * 0.035;
        currentY += (targetY - currentY) * 0.035;

        camera.position.x = currentX * 14;
        camera.position.y = -currentY * 9;
        camera.lookAt(0, 0, 0);

        // Apply interactive drag rotation with momentum damping
        prismGroup.rotation.y += rotVelocityY;
        prismGroup.rotation.x += rotVelocityX;
        rotVelocityY *= 0.92;
        rotVelocityX *= 0.92;

        // Base continuous meditative rotation
        icoMesh.rotation.y += 0.003;
        icoMesh.rotation.x += 0.0018;
        octMesh.rotation.y -= 0.004;
        octMesh.rotation.z += 0.0025;
        ringMesh1.rotation.z += 0.002;
        ringMesh2.rotation.z -= 0.0018;

        // Gentle breathing float
        prismGroup.position.y = 6 + Math.sin(time * 0.6) * 3.5;
      }

      // Quantum shockwave propagation
      if (shockwaveActive) {
        shockwaveRadius += delta * 320;
        if (shockwaveRadius > 450) {
          shockwaveActive = false;
        }
      }

      // Dynamic Particle Embers with Mouse Proximity Attraction
      const pos = emberGeo.attributes.position.array as Float32Array;
      const mouseWorldX = currentX * 120;
      const mouseWorldY = -currentY * 80;

      for (let i = 0; i < emberCount; i++) {
        const i3 = i * 3;
        pos[i3 + 1] += emberSpeeds[i] * 0.75;
        if (pos[i3 + 1] > 180) {
          pos[i3 + 1] = -180;
          pos[i3] = (Math.random() - 0.5) * 450;
        }

        // Mouse proximity gentle attraction
        const dx = mouseWorldX - pos[i3];
        const dy = mouseWorldY - pos[i3 + 1];
        const distToMouse = Math.sqrt(dx * dx + dy * dy);
        if (distToMouse < 80 && distToMouse > 5) {
          pos[i3] += (dx / distToMouse) * 0.35;
          pos[i3 + 1] += (dy / distToMouse) * 0.35;
        }

        // Shockwave ripple impulse
        if (shockwaveActive) {
          const dist = Math.sqrt(pos[i3] * pos[i3] + pos[i3 + 1] * pos[i3 + 1]);
          const diff = Math.abs(dist - shockwaveRadius);
          if (diff < 35) {
            pos[i3 + 1] += (1 - diff / 35) * 2.2;
          }
        }
      }
      emberGeo.attributes.position.needsUpdate = true;
      emberMat.opacity = 0.5 + Math.sin(time * 0.8) * 0.1;

      // Silky undulating wave motion
      const wavePos = waveGeo.attributes.position;
      for (let i = 0; i < wavePos.count; i++) {
        const u = wavePos.getX(i);
        const v = wavePos.getY(i);
        let z =
          Math.sin(u * 0.025 + time * 0.85) * 6.5 +
          Math.cos(v * 0.03 + time * 0.65) * 5.0;

        if (shockwaveActive) {
          const waveDist = Math.sqrt(u * u + v * v);
          const diff = Math.abs(waveDist - shockwaveRadius * 0.7);
          if (diff < 40) {
            z += (1 - diff / 40) * 8.0;
          }
        }
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
      window.removeEventListener('click', handleWindowClick);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      emberGeo.dispose();
      emberMat.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      octGeo.dispose();
      octMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
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
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="fixed inset-0 z-0 overflow-hidden pointer-events-auto"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #0d0722 0%, #05030a 70%, #030107 100%)',
          touchAction: 'pan-y',
        }}
        aria-hidden="true"
      />

      {/* Floating 3D Interaction Control Pill */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 pointer-events-auto select-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0d0720]/80 backdrop-blur-xl border border-purple-500/30 text-white shadow-xl shadow-purple-950/60 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline font-mono text-[10px] text-zinc-300">
            3D Space Active • Drag to Spin
          </span>
          <button
            type="button"
            onClick={() => shockwaveTriggerRef.current?.()}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-600/30 hover:bg-purple-600/60 border border-purple-400/40 text-[10px] font-semibold text-purple-200 hover:text-white transition-all cursor-pointer active:scale-95"
            title="Trigger 3D Quantum Shockwave"
          >
            <Zap className="w-3 h-3 text-yellow-400" />
            <span>Pulse Wave</span>
          </button>
          {onReplayIntro && (
            <button
              type="button"
              onClick={onReplayIntro}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 text-[10px] font-medium text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95"
              title="Replay 3D Intro"
            >
              <RotateCcw className="w-3 h-3 text-purple-400" />
              <span className="hidden md:inline">Intro</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
