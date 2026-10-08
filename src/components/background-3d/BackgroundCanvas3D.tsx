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

    const isMobile = window.innerWidth < 768;
    const totalParticles = isMobile ? 480 : 1100;

    // 2. Scene, Camera & Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05030a, 0.0025);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.set(0, 0, 115);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
      precision: isMobile ? 'mediump' : 'highp',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5));
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    // 3. Ambient & Mouse Cursor Glow Lights
    const ambientLight = new THREE.AmbientLight(0x1a0f35, 1.8);
    scene.add(ambientLight);

    const cursorLight = new THREE.PointLight(0x06b6d4, 3.2, 160);
    cursorLight.position.set(0, 0, 30);
    scene.add(cursorLight);

    const ambientPurpleLight = new THREE.PointLight(0x8b5cf6, 2.5, 260);
    ambientPurpleLight.position.set(0, 30, -20);
    scene.add(ambientPurpleLight);

    // 4. Custom Particle Sprite Texture (High-clarity soft starburst)
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.2, 'rgba(216, 180, 254, 0.9)');
      grad.addColorStop(0.45, 'rgba(99, 102, 241, 0.45)');
      grad.addColorStop(0.75, 'rgba(6, 182, 212, 0.15)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(pCanvas);

    // 5. Particle Attributes & Interactive Physics State
    const positions = new Float32Array(totalParticles * 3);
    const colors = new Float32Array(totalParticles * 3);
    const basePositions = new Float32Array(totalParticles * 3);
    const velocities = new Float32Array(totalParticles * 3);
    const phases = new Float32Array(totalParticles);
    const orbitSpeeds = new Float32Array(totalParticles);
    const orbitRadii = new Float32Array(totalParticles);

    // Palette of refined colors: Purple, Violet, Cyan, Gold & Bright Starlight
    const palette = [
      new THREE.Color(0xa855f7), // Bright Purple
      new THREE.Color(0x06b6d4), // Electric Cyan
      new THREE.Color(0x6366f1), // Indigo
      new THREE.Color(0x38bdf8), // Sky Blue
      new THREE.Color(0xfbbf24), // Amber Starlight
      new THREE.Color(0xffffff), // Pure Starlight White
    ];

    const spreadX = 260;
    const spreadY = 170;
    const spreadZ = 120;

    for (let i = 0; i < totalParticles; i++) {
      const i3 = i * 3;

      // Spacious distribution across 3D depth to prevent visual clutter
      const x = (Math.random() - 0.5) * spreadX;
      const y = (Math.random() - 0.5) * spreadY;
      const z = (Math.random() - 0.5) * spreadZ;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      basePositions[i3] = x;
      basePositions[i3 + 1] = y;
      basePositions[i3 + 2] = z;

      velocities[i3] = 0;
      velocities[i3 + 1] = 0;
      velocities[i3 + 2] = 0;

      phases[i] = Math.random() * Math.PI * 2;
      orbitSpeeds[i] = 0.25 + Math.random() * 0.45;
      orbitRadii[i] = 1.5 + Math.random() * 3.0;

      // Select color with weighted preference for soothing purples and cyans
      const chosenColor = palette[Math.floor(Math.random() * palette.length)];
      colors[i3] = chosenColor.r;
      colors[i3 + 1] = chosenColor.g;
      colors[i3 + 2] = chosenColor.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: isMobile ? 3.6 : 4.4,
      map: particleTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      opacity: 0.85,
    });

    const particlePoints = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particlePoints);

    // 6. Interactive Constellation Lines (Ethereal connections between nearby stars & cursor)
    const maxLineConnections = isMobile ? 120 : 260;
    const linePositions = new Float32Array(maxLineConnections * 6);
    const lineColors = new Float32Array(maxLineConnections * 6);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const constellationLines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(constellationLines);

    // 7. Interactive Click Pulse Ripple System
    const ripples: Array<{
      center: THREE.Vector3;
      radius: number;
      maxRadius: number;
      speed: number;
      strength: number;
      opacity: number;
    }> = [];

    // 8. Pointer & Mouse Tracking
    const mouse = new THREE.Vector2(0, 0);
    const targetMouse = new THREE.Vector2(0, 0);
    const raycaster = new THREE.Raycaster();
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const mouse3D = new THREE.Vector3(0, 0, 0);

    let scrollY = 0;
    let targetScrollY = 0;

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      targetMouse.x = (clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(clientY / window.innerHeight) * 2 + 1;
    };

    const onClick = (e: MouseEvent) => {
      // Create expanding ripple wave from click position
      raycaster.setFromCamera(mouse, camera);
      const hitPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(planeZ, hitPoint);

      ripples.push({
        center: hitPoint,
        radius: 0.1,
        maxRadius: 75,
        speed: 55,
        strength: 22,
        opacity: 1,
      });

      // Momentary light burst on click
      cursorLight.intensity = 5.5;
    };

    const onScroll = () => {
      targetScrollY = window.scrollY;
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('click', onClick, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    // 9. High-Performance Render Loop
    const clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.08);
      const elapsedTime = clock.getElapsedTime();

      // Smooth pointer easing
      mouse.x += (targetMouse.x - mouse.x) * 0.08;
      mouse.y += (targetMouse.y - mouse.y) * 0.08;
      scrollY += (targetScrollY - scrollY) * 0.06;

      // Project mouse into 3D world space
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(planeZ, mouse3D);

      // Cursor light tracks 3D pointer position
      cursorLight.position.set(mouse3D.x, mouse3D.y, mouse3D.z + 18);
      cursorLight.intensity = Math.max(3.0, cursorLight.intensity * 0.96);

      // Subtle responsive 3D camera parallax (spacious, non-dizzying)
      const targetCamX = mouse.x * 12;
      const targetCamY = mouse.y * 8 - (scrollY * 0.025);
      camera.position.x += (targetCamX - camera.position.x) * 0.04;
      camera.position.y += (targetCamY - camera.position.y) * 0.04;
      camera.lookAt(0, -(scrollY * 0.015), 0);

      // Update click ripple waves
      for (let r = ripples.length - 1; r >= 0; r--) {
        const rip = ripples[r];
        rip.radius += rip.speed * delta;
        rip.opacity = Math.max(0, 1 - rip.radius / rip.maxRadius);
        if (rip.radius >= rip.maxRadius) {
          ripples.splice(r, 1);
        }
      }

      // Update interactive particle physics
      const posAttr = particleGeometry.getAttribute('position') as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;

      const cursorInfluenceRadius = isMobile ? 32 : 46;
      const cursorInfluenceRadiusSq = cursorInfluenceRadius * cursorInfluenceRadius;

      // Line rendering buffers
      const lPos = linePositions;
      const lCol = lineColors;
      let lineVertexIdx = 0;

      for (let i = 0; i < totalParticles; i++) {
        const i3 = i * 3;
        let px = posArr[i3];
        let py = posArr[i3 + 1];
        let pz = posArr[i3 + 2];

        const bx = basePositions[i3];
        const by = basePositions[i3 + 1];
        const bz = basePositions[i3 + 2];

        // Harmonious orbital float around base position
        const pSpeed = orbitSpeeds[i];
        const pPhase = phases[i];
        const pRadius = orbitRadii[i];

        const targetBaseX = bx + Math.cos(elapsedTime * pSpeed + pPhase) * pRadius;
        const targetBaseY = by + Math.sin(elapsedTime * pSpeed * 0.8 + pPhase) * pRadius;
        const targetBaseZ = bz + Math.sin(elapsedTime * 0.3 + pPhase) * (pRadius * 0.5);

        // Distance to 3D mouse cursor
        const dx = px - mouse3D.x;
        const dy = py - mouse3D.y;
        const dz = pz - mouse3D.z;
        const distSq = dx * dx + dy * dy + dz * dz;

        // Interactive cursor repulsion / elastic drift
        if (distSq < cursorInfluenceRadiusSq && distSq > 0.001) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / cursorInfluenceRadius) * 28;
          velocities[i3] += (dx / dist) * force * delta;
          velocities[i3 + 1] += (dy / dist) * force * delta;
          velocities[i3 + 2] += (dz / dist) * (force * 0.4) * delta;
        }

        // Ripple impulse from clicks
        for (let r = 0; r < ripples.length; r++) {
          const rip = ripples[r];
          const rx = px - rip.center.x;
          const ry = py - rip.center.y;
          const rz = pz - rip.center.z;
          const rDist = Math.sqrt(rx * rx + ry * ry + rz * rz);
          const diff = Math.abs(rDist - rip.radius);
          if (diff < 12) {
            const waveStrength = (1 - diff / 12) * rip.strength * rip.opacity;
            velocities[i3] += (rx / (rDist + 0.1)) * waveStrength * delta;
            velocities[i3 + 1] += (ry / (rDist + 0.1)) * waveStrength * delta;
            velocities[i3 + 2] += (rz / (rDist + 0.1)) * waveStrength * delta;
          }
        }

        // Spring return to resting base position
        const springK = 0.045;
        const damping = 0.91;

        velocities[i3] += (targetBaseX - px) * springK;
        velocities[i3 + 1] += (targetBaseY - py) * springK;
        velocities[i3 + 2] += (targetBaseZ - pz) * springK;

        velocities[i3] *= damping;
        velocities[i3 + 1] *= damping;
        velocities[i3 + 2] *= damping;

        px += velocities[i3];
        py += velocities[i3 + 1];
        pz += velocities[i3 + 2];

        posArr[i3] = px;
        posArr[i3 + 1] = py;
        posArr[i3 + 2] = pz;

        // Interactive constellation line connections
        // 1. Connect nearby stars to the cursor
        if (lineVertexIdx < maxLineConnections * 6 && distSq < 1100 && i % 3 === 0) {
          const lineAlpha = (1 - Math.sqrt(distSq) / 33.1) * 0.7;

          // From particle
          lPos[lineVertexIdx] = px;
          lPos[lineVertexIdx + 1] = py;
          lPos[lineVertexIdx + 2] = pz;
          lCol[lineVertexIdx] = 0.02 * lineAlpha;
          lCol[lineVertexIdx + 1] = 0.71 * lineAlpha;
          lCol[lineVertexIdx + 2] = 0.83 * lineAlpha;
          lineVertexIdx += 3;

          // To cursor
          lPos[lineVertexIdx] = mouse3D.x;
          lPos[lineVertexIdx + 1] = mouse3D.y;
          lPos[lineVertexIdx + 2] = mouse3D.z;
          lCol[lineVertexIdx] = 0.65 * lineAlpha;
          lCol[lineVertexIdx + 1] = 0.33 * lineAlpha;
          lCol[lineVertexIdx + 2] = 0.96 * lineAlpha;
          lineVertexIdx += 3;
        }

        // 2. Connect neighboring particles
        if (lineVertexIdx < maxLineConnections * 6 && i % 8 === 0) {
          const neighborIdx = (i + 13) % totalParticles;
          const n3 = neighborIdx * 3;
          const nx = posArr[n3];
          const ny = posArr[n3 + 1];
          const nz = posArr[n3 + 2];

          const nDistSq = (px - nx) * (px - nx) + (py - ny) * (py - ny) + (pz - nz) * (pz - nz);
          if (nDistSq < 625) {
            const nAlpha = (1 - Math.sqrt(nDistSq) / 25) * 0.35;

            lPos[lineVertexIdx] = px;
            lPos[lineVertexIdx + 1] = py;
            lPos[lineVertexIdx + 2] = pz;
            lCol[lineVertexIdx] = 0.54 * nAlpha;
            lCol[lineVertexIdx + 1] = 0.33 * nAlpha;
            lCol[lineVertexIdx + 2] = 0.96 * nAlpha;
            lineVertexIdx += 3;

            lPos[lineVertexIdx] = nx;
            lPos[lineVertexIdx + 1] = ny;
            lPos[lineVertexIdx + 2] = nz;
            lCol[lineVertexIdx] = 0.02 * nAlpha;
            lCol[lineVertexIdx + 1] = 0.71 * nAlpha;
            lCol[lineVertexIdx + 2] = 0.83 * nAlpha;
            lineVertexIdx += 3;
          }
        }
      }

      // Zero out unused line segments
      for (let j = lineVertexIdx; j < maxLineConnections * 6; j++) {
        lPos[j] = 0;
        lCol[j] = 0;
      }

      posAttr.needsUpdate = true;
      (lineGeometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
      (lineGeometry.getAttribute('color') as THREE.BufferAttribute).needsUpdate = true;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // 10. Clean Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      particleGeometry.dispose();
      particleMaterial.dispose();
      particleTexture.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
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
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      style={{
        background: 'radial-gradient(ellipse at 50% 25%, #0e0724 0%, #05030a 65%, #020106 100%)',
      }}
      aria-hidden="true"
    />
  );
}
