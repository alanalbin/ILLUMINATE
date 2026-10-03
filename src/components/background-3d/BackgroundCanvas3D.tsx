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

    // 2. Cosmic Quantum Scene & Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05030a, 0.0016);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      1200
    );
    camera.position.set(0, isMobile ? 8 : 12, isMobile ? 180 : 160);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
      precision: isMobile ? 'mediump' : 'highp',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.25));
    if (!isMobile) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
    }
    container.appendChild(renderer.domElement);

    // 3. Ambient & Pointer Lights
    const ambientLight = new THREE.AmbientLight(0x0f0826, isMobile ? 2.2 : 1.8);
    scene.add(ambientLight);

    const coreLightCyan = new THREE.PointLight(0x38bdf8, isMobile ? 4.0 : 6.0, 400);
    coreLightCyan.position.set(30, 20, 30);
    scene.add(coreLightCyan);

    const coreLightPurple = new THREE.PointLight(0xa855f7, isMobile ? 4.0 : 6.0, 400);
    coreLightPurple.position.set(-30, -20, 20);
    scene.add(coreLightPurple);

    const pointerLight = new THREE.PointLight(0x818cf8, isMobile ? 2.5 : 4.0, 300);
    pointerLight.position.set(0, 0, 80);
    scene.add(pointerLight);

    // =========================================================================
    // 4. THE QUANTUM ILLUMINATE CORE (Geodesic Crystal & Plasma Nexus)
    // =========================================================================
    const nexusGroup = new THREE.Group();
    nexusGroup.position.set(0, isMobile ? 4 : 8, -25);
    scene.add(nexusGroup);

    // 4A. Inner Glowing Plasma Sphere
    const plasmaRadius = isMobile ? 8 : 12;
    const plasmaGeo = new THREE.SphereGeometry(plasmaRadius, isMobile ? 20 : 32, isMobile ? 20 : 32);
    const plasmaMat = new THREE.MeshBasicMaterial({
      color: 0x9333ea,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const plasmaSphere = new THREE.Mesh(plasmaGeo, plasmaMat);
    nexusGroup.add(plasmaSphere);

    // 4B. Inner Faceted Geodesic Icosahedron Cage (Cyan Wireframe)
    const innerCrystalGeo = new THREE.IcosahedronGeometry(plasmaRadius * 1.35, 1);
    const innerCrystalMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const innerCrystal = new THREE.Mesh(innerCrystalGeo, innerCrystalMat);
    nexusGroup.add(innerCrystal);

    // 4C. Outer Faceted Geodesic Cage (Violet Wireframe + Transparent Glass Faces)
    const outerCrystalGeo = new THREE.IcosahedronGeometry(plasmaRadius * 1.7, 1);
    const outerCrystalWireMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const outerCrystal = new THREE.Mesh(outerCrystalGeo, outerCrystalWireMat);
    nexusGroup.add(outerCrystal);

    // 4D. Glass Faces on Outer Icosahedron
    const glassFacesMat = new THREE.MeshBasicMaterial({
      color: 0x1e1b4b,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const glassFaces = new THREE.Mesh(outerCrystalGeo, glassFacesMat);
    nexusGroup.add(glassFaces);

    // =========================================================================
    // 5. GYROSCOPIC HOLOGRAPHIC ORBITAL RINGS
    // =========================================================================
    const ringGroup = new THREE.Group();
    nexusGroup.add(ringGroup);

    const createGimbalRing = (radius: number, tubeRadius: number, colorHex: number) => {
      const geo = new THREE.TorusGeometry(radius, tubeRadius, 8, isMobile ? 48 : 80);
      const mat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
      });
      return new THREE.Mesh(geo, mat);
    };

    const ringRadius1 = plasmaRadius * 2.2;
    const ringRadius2 = plasmaRadius * 2.7;
    const ringRadius3 = plasmaRadius * 3.2;

    const gimbalRing1 = createGimbalRing(ringRadius1, isMobile ? 0.35 : 0.5, 0x38bdf8);
    const gimbalRing2 = createGimbalRing(ringRadius2, isMobile ? 0.3 : 0.45, 0xa855f7);
    const gimbalRing3 = createGimbalRing(ringRadius3, isMobile ? 0.25 : 0.4, 0x818cf8);

    gimbalRing1.rotation.x = Math.PI / 3;
    gimbalRing2.rotation.y = Math.PI / 4;
    gimbalRing3.rotation.z = -Math.PI / 6;

    ringGroup.add(gimbalRing1);
    ringGroup.add(gimbalRing2);
    ringGroup.add(gimbalRing3);

    // =========================================================================
    // 6. INTERACTIVE NEURAL CONSTELLATION LATTICE (Nodes + Dynamic Links)
    // =========================================================================
    const nodeCount = isMobile ? 65 : 120;
    const connectionMaxDist = isMobile ? 32 : 42;
    const constellationSpread = isMobile ? 180 : 260;

    // Node particle texture generator
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 64;
    spriteCanvas.height = 64;
    const sCtx = spriteCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.25, 'rgba(56, 189, 248, 0.9)');
      grad.addColorStop(0.65, 'rgba(168, 85, 247, 0.4)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(spriteCanvas);

    // Node data vectors for simulation physics
    interface NodeParticle {
      origin: THREE.Vector3;
      position: THREE.Vector3;
      velocity: THREE.Vector3;
      pulseOffset: number;
    }

    const nodes: NodeParticle[] = [];
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeColors = new Float32Array(nodeCount * 3);

    const colCyan = new THREE.Color(0x38bdf8);
    const colViolet = new THREE.Color(0xa855f7);
    const colIndigo = new THREE.Color(0x818cf8);
    const colWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() - 0.5) * constellationSpread;
      const y = (Math.random() - 0.5) * (constellationSpread * 0.7);
      const z = (Math.random() - 0.5) * constellationSpread * 0.6 - 20;

      const origin = new THREE.Vector3(x, y, z);
      const pos = origin.clone();
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.12,
        (Math.random() - 0.5) * 0.12,
        (Math.random() - 0.5) * 0.12
      );

      nodes.push({ origin, position: pos, velocity: vel, pulseOffset: Math.random() * Math.PI * 2 });

      nodePositions[i * 3] = x;
      nodePositions[i * 3 + 1] = y;
      nodePositions[i * 3 + 2] = z;

      const t = Math.random();
      const nodeCol = t < 0.4 ? colCyan : t < 0.8 ? colViolet : colIndigo;
      nodeColors[i * 3] = nodeCol.r;
      nodeColors[i * 3 + 1] = nodeCol.g;
      nodeColors[i * 3 + 2] = nodeCol.b;
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    nodeGeo.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));

    const nodeMat = new THREE.PointsMaterial({
      size: isMobile ? 3.4 : 4.8,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const nodesMesh = new THREE.Points(nodeGeo, nodeMat);
    scene.add(nodesMesh);

    // Dynamic Line Mesh for Constellation Connections
    const maxLines = nodeCount * 4;
    const linePositions = new Float32Array(maxLines * 6);
    const lineColors = new Float32Array(maxLines * 6);

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const linesMesh = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(linesMesh);

    // =========================================================================
    // 7. INTERACTIVE EXPANDING SHOCKWAVE (Click/Tap Energy Pulse)
    // =========================================================================
    const shockwaveGeo = new THREE.RingGeometry(plasmaRadius * 0.8, plasmaRadius * 1.5, isMobile ? 32 : 64);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    nexusGroup.add(shockwaveMesh);

    let shockwaveActive = false;
    let shockwaveProgress = 0;

    const triggerShockwave = () => {
      shockwaveActive = true;
      shockwaveProgress = 0;
      shockwaveMat.opacity = 0.95;

      coreLightCyan.intensity = isMobile ? 7.0 : 10.0;
      coreLightPurple.intensity = isMobile ? 7.0 : 10.0;
      pointerLight.intensity = isMobile ? 6.0 : 9.0;
      plasmaMat.opacity = 1.0;
    };

    // =========================================================================
    // 8. INTERACTION & POINTER LISTENERS
    // =========================================================================
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let targetScrollProgress = 0;
    let currentScrollProgress = 0;

    const _scratchVec = new THREE.Vector3();
    const _scratchDir = new THREE.Vector3();
    const _scratchPos = new THREE.Vector3();
    const pointerWorldPos = new THREE.Vector3(0, 0, 80);

    const handlePointerMove = (e: PointerEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;

      _scratchVec.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
        0.5
      );
      _scratchVec.unproject(camera);
      _scratchDir.copy(_scratchVec).sub(camera.position).normalize();
      _scratchPos.copy(camera.position).addScaledVector(_scratchDir, 140);
      pointerWorldPos.copy(_scratchPos);
      pointerLight.position.lerp(_scratchPos, 0.2);
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
      triggerShockwave();
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
    // 9. HIGH-PERFORMANCE 60/120FPS GPU RENDER LOOP
    // =========================================================================
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isTabVisible) return;

      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      // Smooth interpolations
      currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.07;
      currentX += (targetX - currentX) * (isMobile ? 0.04 : 0.06);
      currentY += (targetY - currentY) * (isMobile ? 0.04 : 0.06);

      // Camera dynamic glide along page scroll
      if (!prefersReducedMotion) {
        const scrollCameraY = (isMobile ? 8 : 12) - currentScrollProgress * 20;
        const scrollCameraZ = (isMobile ? 180 : 160) - currentScrollProgress * 35;
        const scrollCameraTilt = Math.sin(currentScrollProgress * Math.PI) * 5;

        camera.position.x = currentX * (isMobile ? 8 : 16) + scrollCameraTilt;
        camera.position.y = -currentY * (isMobile ? 6 : 10) + scrollCameraY;
        camera.position.z = scrollCameraZ;
        camera.lookAt(0, isMobile ? 3 : 5, -25);

        // Interactive Nexus Core Rotation with Pointer Tilt
        nexusGroup.rotation.y = time * 0.25 + currentX * 0.8 + currentScrollProgress * Math.PI * 0.7;
        nexusGroup.rotation.x = currentY * 0.5 + Math.sin(time * 0.4) * 0.1;
        nexusGroup.rotation.z = currentX * 0.3;
      }

      // -----------------------------------------------------------------------
      // Quantum Core Counter-Rotations & Pulsing
      // -----------------------------------------------------------------------
      innerCrystal.rotation.y -= delta * 0.75;
      innerCrystal.rotation.x += delta * 0.4;
      outerCrystal.rotation.y += delta * 0.5;
      outerCrystal.rotation.z -= delta * 0.3;

      const plasmaPulse = 1.0 + Math.sin(time * 3.5) * 0.08;
      plasmaSphere.scale.set(plasmaPulse, plasmaPulse, plasmaPulse);

      // Gimbal Rings Multi-Axis Orbit
      const ringSpeed = shockwaveActive ? 2.5 : 1.0;
      gimbalRing1.rotation.z += delta * 0.8 * ringSpeed;
      gimbalRing2.rotation.x += delta * 0.65 * ringSpeed;
      gimbalRing3.rotation.y -= delta * 0.5 * ringSpeed;

      // -----------------------------------------------------------------------
      // Neural Constellation Nodes Update & Pointer Gravity Physics
      // -----------------------------------------------------------------------
      const nodePosAttr = nodeGeo.attributes.position as THREE.BufferAttribute;
      const posArray = nodePosAttr.array as Float32Array;

      let lineIndex = 0;
      const linePosAttr = lineGeo.attributes.position as THREE.BufferAttribute;
      const lineArray = linePosAttr.array as Float32Array;
      const lineColAttr = lineGeo.attributes.color as THREE.BufferAttribute;
      const lineColArray = lineColAttr.array as Float32Array;

      for (let i = 0; i < nodeCount; i++) {
        const node = nodes[i];

        // Harmonic ambient drift around origin
        const driftX = Math.sin(time * 0.8 + node.pulseOffset) * 2.5;
        const driftY = Math.cos(time * 0.7 + node.pulseOffset) * 2.5;
        const driftZ = Math.sin(time * 0.9 + node.pulseOffset * 1.5) * 2.5;

        // Pointer proximity attraction physics
        const dx = pointerWorldPos.x - (node.origin.x + driftX);
        const dy = pointerWorldPos.y - (node.origin.y + driftY);
        const dz = pointerWorldPos.z - (node.origin.z + driftZ);
        const distToPointer = Math.sqrt(dx * dx + dy * dy + dz * dz);

        let attractX = 0;
        let attractY = 0;
        let attractZ = 0;

        if (distToPointer < 65) {
          const force = (1.0 - distToPointer / 65) * 9.0;
          attractX = (dx / distToPointer) * force;
          attractY = (dy / distToPointer) * force;
          attractZ = (dz / distToPointer) * force;
        }

        const targetNodeX = node.origin.x + driftX + attractX;
        const targetNodeY = node.origin.y + driftY + attractY;
        const targetNodeZ = node.origin.z + driftZ + attractZ;

        node.position.x += (targetNodeX - node.position.x) * 0.08;
        node.position.y += (targetNodeY - node.position.y) * 0.08;
        node.position.z += (targetNodeZ - node.position.z) * 0.08;

        posArray[i * 3] = node.position.x;
        posArray[i * 3 + 1] = node.position.y;
        posArray[i * 3 + 2] = node.position.z;

        // Build connections between nearby node pairs
        for (let j = i + 1; j < nodeCount; j++) {
          if (lineIndex >= maxLines) break;

          const other = nodes[j];
          const cdx = node.position.x - other.position.x;
          const cdy = node.position.y - other.position.y;
          const cdz = node.position.z - other.position.z;
          const distNodes = Math.sqrt(cdx * cdx + cdy * cdy + cdz * cdz);

          if (distNodes < connectionMaxDist) {
            const alpha = 1.0 - distNodes / connectionMaxDist;

            const baseIdx = lineIndex * 6;
            lineArray[baseIdx] = node.position.x;
            lineArray[baseIdx + 1] = node.position.y;
            lineArray[baseIdx + 2] = node.position.z;
            lineArray[baseIdx + 3] = other.position.x;
            lineArray[baseIdx + 4] = other.position.y;
            lineArray[baseIdx + 5] = other.position.z;

            // Gradient line color based on proximity and theme
            lineColArray[baseIdx] = colCyan.r * alpha;
            lineColArray[baseIdx + 1] = colCyan.g * alpha;
            lineColArray[baseIdx + 2] = colCyan.b * alpha;
            lineColArray[baseIdx + 3] = colViolet.r * alpha;
            lineColArray[baseIdx + 4] = colViolet.g * alpha;
            lineColArray[baseIdx + 5] = colViolet.b * alpha;

            lineIndex++;
          }
        }
      }

      nodePosAttr.needsUpdate = true;
      lineGeo.setDrawRange(0, lineIndex * 2);
      linePosAttr.needsUpdate = true;
      lineColAttr.needsUpdate = true;

      // -----------------------------------------------------------------------
      // Shockwave Pulse Expansion & Fade
      // -----------------------------------------------------------------------
      if (shockwaveActive) {
        shockwaveProgress += delta * 1.6;
        const waveScale = 1.0 + shockwaveProgress * 5.0;
        shockwaveMesh.scale.set(waveScale, waveScale, waveScale);
        shockwaveMat.opacity = Math.max(0, 0.95 * (1.0 - shockwaveProgress));

        if (shockwaveProgress >= 1.0) {
          shockwaveActive = false;
        }
      }

      // Lights decay smoothly to standard levels
      const baseCyan = isMobile ? 4.0 : 6.0;
      const basePurple = isMobile ? 4.0 : 6.0;
      const basePointer = isMobile ? 2.5 : 4.0;

      if (coreLightCyan.intensity > baseCyan) {
        coreLightCyan.intensity += (baseCyan - coreLightCyan.intensity) * 0.05;
      }
      if (coreLightPurple.intensity > basePurple) {
        coreLightPurple.intensity += (basePurple - coreLightPurple.intensity) * 0.05;
      }
      if (pointerLight.intensity > basePointer) {
        pointerLight.intensity += (basePointer - pointerLight.intensity) * 0.05;
      }
      if (plasmaMat.opacity > 0.85) {
        plasmaMat.opacity += (0.85 - plasmaMat.opacity) * 0.05;
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

      plasmaGeo.dispose();
      plasmaMat.dispose();
      innerCrystalGeo.dispose();
      innerCrystalMat.dispose();
      outerCrystalGeo.dispose();
      outerCrystalWireMat.dispose();
      glassFacesMat.dispose();
      gimbalRing1.geometry.dispose();
      (gimbalRing1.material as THREE.Material).dispose();
      gimbalRing2.geometry.dispose();
      (gimbalRing2.material as THREE.Material).dispose();
      gimbalRing3.geometry.dispose();
      (gimbalRing3.material as THREE.Material).dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      shockwaveGeo.dispose();
      shockwaveMat.dispose();
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
        background: 'radial-gradient(ellipse at 50% 30%, #0d0724 0%, #05030a 65%, #020106 100%)',
      }}
      aria-hidden="true"
    />
  );
}
