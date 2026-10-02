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

    // 2. Cosmic Scene, Fog & Perspective Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05030a, 0.0015);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      1200
    );
    // Positioned high and slightly back, looking towards the cosmic horizon
    camera.position.set(0, isMobile ? 32 : 36, isMobile ? 180 : 160);
    camera.lookAt(0, isMobile ? -5 : 0, -40);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5));
    if (!isMobile) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
    }
    container.appendChild(renderer.domElement);

    // 3. Ambient & Pointer Follower Lighting
    const ambientLight = new THREE.AmbientLight(0x180d30, isMobile ? 2.0 : 1.6);
    scene.add(ambientLight);

    const pointerLight = new THREE.PointLight(0x38bdf8, isMobile ? 2.5 : 3.8, 320);
    pointerLight.position.set(0, 10, 60);
    scene.add(pointerLight);

    const accentLight = new THREE.PointLight(0xa855f7, isMobile ? 2.0 : 3.0, 360);
    accentLight.position.set(0, -20, 20);
    scene.add(accentLight);

    // =========================================================================
    // 4. UNDULATING QUANTUM HORIZON GRID (Spacious, Non-Congested Fluid Lattice)
    // =========================================================================
    // Sits in the lower field of view sloping toward the horizon, leaving the
    // center and top completely open and breathable for headers and content.
    const gridCols = isMobile ? 28 : 46;
    const gridRows = isMobile ? 24 : 38;
    const gridWidth = isMobile ? 260 : 340;
    const gridDepth = isMobile ? 220 : 280;

    const waveGeo = new THREE.PlaneGeometry(gridWidth, gridDepth, gridCols, gridRows);
    // Rotate to lie horizontally like a digital ocean / cyber horizon
    waveGeo.rotateX(-Math.PI / 2.25);

    // Store base position coords to compute smooth harmonic waves
    const basePositions = waveGeo.attributes.position.clone();

    // Subtle, high-tech wireframe mesh
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: isMobile ? 0.12 : 0.16,
      blending: THREE.AdditiveBlending,
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMesh.position.set(0, isMobile ? -36 : -32, -30);
    scene.add(waveMesh);

    // Glowing particle texture for lattice nodes
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.25, 'rgba(56, 189, 248, 0.85)');
      grad.addColorStop(0.65, 'rgba(168, 85, 247, 0.35)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 32, 32);
    }
    const nodeTexture = new THREE.CanvasTexture(pCanvas);

    // Points at vertex intersections to give a sparkling digital matrix feel
    const wavePointsMat = new THREE.PointsMaterial({
      size: isMobile ? 2.5 : 3.5,
      map: nodeTexture,
      transparent: true,
      opacity: isMobile ? 0.35 : 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const wavePoints = new THREE.Points(waveGeo, wavePointsMat);
    waveMesh.add(wavePoints);

    // =========================================================================
    // 5. DEEP CELESTIAL CONSTELLATION NODES & LASER FILAMENTS (Airy & Sparse)
    // =========================================================================
    const constellationGroup = new THREE.Group();
    scene.add(constellationGroup);

    const nodeCount = isMobile ? 18 : 32;
    const nodes: { pos: THREE.Vector3; basePos: THREE.Vector3; speed: number; phase: number }[] = [];
    const nodePositions = new Float32Array(nodeCount * 3);

    for (let i = 0; i < nodeCount; i++) {
      // Sparsely distributed across deep space and periphery
      const x = (Math.random() - 0.5) * (isMobile ? 200 : 280);
      const y = THREE.MathUtils.lerp(isMobile ? -10 : -5, isMobile ? 65 : 85, Math.random());
      const z = THREE.MathUtils.lerp(-40, -180, Math.random());

      const pos = new THREE.Vector3(x, y, z);
      nodes.push({
        pos,
        basePos: pos.clone(),
        speed: 0.3 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
      });

      nodePositions[i * 3] = x;
      nodePositions[i * 3 + 1] = y;
      nodePositions[i * 3 + 2] = z;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));

    const starMat = new THREE.PointsMaterial({
      size: isMobile ? 4.0 : 5.5,
      map: nodeTexture,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    constellationGroup.add(starPoints);

    // Dynamic laser filaments connecting nearby stars
    const maxConnections = isMobile ? 24 : 48;
    const linePositions = new Float32Array(maxConnections * 2 * 3);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: isMobile ? 0.12 : 0.18,
      blending: THREE.AdditiveBlending,
    });
    const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
    constellationGroup.add(lineMesh);

    // =========================================================================
    // 6. EXPANDING COSMIC RIPPLE (Click / Tap Shockwave)
    // =========================================================================
    const rippleGeo = new THREE.RingGeometry(1, 3, 48);
    rippleGeo.rotateX(-Math.PI / 2.25);
    const rippleMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const rippleMesh = new THREE.Mesh(rippleGeo, rippleMat);
    rippleMesh.position.set(0, isMobile ? -36 : -32, -30);
    scene.add(rippleMesh);

    let rippleActive = false;
    let rippleProgress = 0;
    let rippleOriginX = 0;
    let rippleOriginZ = 0;

    const triggerRipple = (clientX?: number, clientY?: number) => {
      rippleActive = true;
      rippleProgress = 0;
      rippleMat.opacity = 0.8;

      if (clientX !== undefined && clientY !== undefined) {
        const normX = (clientX / window.innerWidth - 0.5) * (isMobile ? 120 : 180);
        const normZ = (clientY / window.innerHeight - 0.5) * (isMobile ? 80 : 120) - 30;
        rippleOriginX = normX;
        rippleOriginZ = normZ;
        rippleMesh.position.set(normX, isMobile ? -36 : -32, normZ);
      } else {
        rippleOriginX = 0;
        rippleOriginZ = -30;
        rippleMesh.position.set(0, isMobile ? -36 : -32, -30);
      }

      // Flash follower light
      pointerLight.intensity = isMobile ? 4.5 : 7.0;
    };

    // =========================================================================
    // 7. INTERACTION LISTENERS: Mouse / Touch Tracking & Scroll Journey
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

      // Project pointer into 3D world space for the responsive follower light
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      const vector = new THREE.Vector3(normX, normY, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = 140;
      const pos = camera.position.clone().add(dir.multiplyScalar(distance));
      pointerLight.position.lerp(pos, 0.2);
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
      triggerRipple(e.clientX, e.clientY);
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
    // 8. 60FPS OPTIMIZED ANIMATION LOOP
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

      // Smooth pointer parallax damping
      currentX += (targetX - currentX) * (isMobile ? 0.03 : 0.05);
      currentY += (targetY - currentY) * (isMobile ? 0.03 : 0.05);

      // Camera dynamic flight along the cybernetic horizon
      if (!prefersReducedMotion) {
        const scrollCameraY = (isMobile ? 32 : 36) - currentScrollProgress * 14;
        const scrollCameraZ = (isMobile ? 180 : 160) - currentScrollProgress * 20;
        const scrollCameraTilt = Math.sin(currentScrollProgress * Math.PI) * 3;

        camera.position.x = currentX * (isMobile ? 6 : 12) + scrollCameraTilt;
        camera.position.y = -currentY * (isMobile ? 4 : 8) + scrollCameraY;
        camera.position.z = scrollCameraZ;
        camera.lookAt(0, isMobile ? -5 : 0, -40);

        // Constellation subtle tilt and orbital drift
        constellationGroup.rotation.y = currentX * 0.15 + time * 0.015;
        constellationGroup.rotation.x = currentY * 0.1;
      }

      // Pointer follower light decay back to normal
      const normalIntensity = isMobile ? 2.5 : 3.8;
      if (pointerLight.intensity > normalIntensity) {
        pointerLight.intensity += (normalIntensity - pointerLight.intensity) * 0.05;
      }

      // -----------------------------------------------------------------------
      // Interactive Wave Mesh Physics (Harmonic waves + Cursor Magnetic Warp)
      // -----------------------------------------------------------------------
      const posAttr = waveGeo.attributes.position;
      const basePos = basePositions.array as Float32Array;
      const currentPos = posAttr.array as Float32Array;
      const vertexCount = posAttr.count;

      // Project pointer into plane space for local distortion
      const pointerPlaneX = currentX * (gridWidth * 0.35);
      const pointerPlaneZ = -currentY * (gridDepth * 0.35);

      const waveSpeed = prefersReducedMotion ? 0.3 : 1.0;
      const waveAmp = prefersReducedMotion ? 2.0 : (isMobile ? 3.5 : 5.0);

      for (let i = 0; i < vertexCount; i++) {
        const i3 = i * 3;
        const bx = basePos[i3];
        const by = basePos[i3 + 1];
        const bz = basePos[i3 + 2];

        // Base harmonic wave oscillations
        let waveHeight =
          Math.sin(bx * 0.035 + time * 0.7 * waveSpeed) *
          Math.cos(by * 0.035 + time * 0.5 * waveSpeed) *
          waveAmp +
          Math.sin((bx + by) * 0.02 + time * 0.9 * waveSpeed) * (waveAmp * 0.4);

        // Cursor interactive gravitational ripple
        if (!prefersReducedMotion) {
          const dx = bx - pointerPlaneX;
          const dy = by - pointerPlaneZ;
          const distSq = dx * dx + dy * dy;
          if (distSq < 3600) {
            const dist = Math.sqrt(distSq);
            const falloff = 1 - dist / 60;
            waveHeight += Math.sin(time * 3.2 - dist * 0.15) * 5.0 * falloff;
          }
        }

        // Click shockwave ripple calculation
        if (rippleActive) {
          const rx = bx - rippleOriginX;
          const rz = by - rippleOriginZ;
          const rDist = Math.sqrt(rx * rx + rz * rz);
          const currentRadius = rippleProgress * 140;
          const waveDist = Math.abs(rDist - currentRadius);
          if (waveDist < 20) {
            const rFactor = (1 - waveDist / 20) * (1 - rippleProgress);
            waveHeight += Math.sin((rDist - currentRadius) * 0.3) * 6.5 * rFactor;
          }
        }

        currentPos[i3 + 2] = bz + waveHeight;
      }
      posAttr.needsUpdate = true;

      // -----------------------------------------------------------------------
      // Cosmic Shockwave Ring Expansion
      // -----------------------------------------------------------------------
      if (rippleActive) {
        rippleProgress += delta * 2.2;
        const scale = 1 + rippleProgress * 42;
        rippleMesh.scale.set(scale, scale, scale);
        rippleMat.opacity = Math.max(0, 0.8 * (1 - rippleProgress));

        if (rippleProgress >= 1) {
          rippleActive = false;
        }
      }

      // -----------------------------------------------------------------------
      // Constellation Nodes Drift & Laser Filaments
      // -----------------------------------------------------------------------
      if (!isMobile) {
        const starPosArr = starGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < nodeCount; i++) {
          const node = nodes[i];
          const t = time * node.speed + node.phase;
          node.pos.x = node.basePos.x + Math.sin(t * 0.8) * 4;
          node.pos.y = node.basePos.y + Math.cos(t * 0.6) * 3;
          node.pos.z = node.basePos.z + Math.sin(t * 0.4) * 5;

          starPosArr[i * 3] = node.pos.x;
          starPosArr[i * 3 + 1] = node.pos.y;
          starPosArr[i * 3 + 2] = node.pos.z;
        }
        starGeo.attributes.position.needsUpdate = true;

        // Dynamic laser connections between nearby nodes
        let lineIdx = 0;
        const maxDist = 65;
        const maxDistSq = maxDist * maxDist;

        for (let i = 0; i < nodeCount && lineIdx < maxConnections; i++) {
          for (let j = i + 1; j < nodeCount && lineIdx < maxConnections; j++) {
            const p1 = nodes[i].pos;
            const p2 = nodes[j].pos;
            const distSq = p1.distanceToSquared(p2);

            if (distSq < maxDistSq) {
              const base = lineIdx * 6;
              linePositions[base] = p1.x;
              linePositions[base + 1] = p1.y;
              linePositions[base + 2] = p1.z;
              linePositions[base + 3] = p2.x;
              linePositions[base + 4] = p2.y;
              linePositions[base + 5] = p2.z;
              lineIdx++;
            }
          }
        }
        // Zero out remaining line buffer vertices
        for (let k = lineIdx * 6; k < linePositions.length; k++) {
          linePositions[k] = 0;
        }
        lineGeo.attributes.position.needsUpdate = true;
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

      waveGeo.dispose();
      waveMat.dispose();
      wavePointsMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      rippleGeo.dispose();
      rippleMat.dispose();
      nodeTexture.dispose();
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
        background: 'radial-gradient(ellipse at 50% 25%, #0e0722 0%, #05030a 70%, #020106 100%)',
      }}
      aria-hidden="true"
    />
  );
}
