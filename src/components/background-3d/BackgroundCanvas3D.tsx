'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface BackgroundCanvas3DProps {
  onReplayIntro?: () => void;
}

interface FloatingPrism {
  group: THREE.Group;
  mesh: THREE.Mesh;
  edges: THREE.LineSegments;
  basePos: THREE.Vector3;
  velocity: THREE.Vector3;
  rotSpeed: THREE.Vector3;
  floatSpeed: number;
  floatAmp: number;
  phase: number;
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

    // 2. Scene, Camera & Deep Atmospheric Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04020a, 0.0024);

    const camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      1,
      1200
    );
    camera.position.set(0, 4, 118);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
      precision: isMobile ? 'mediump' : 'highp',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    // Root Gimbal Group for central quantum artifact
    const quantumNexusGroup = new THREE.Group();
    scene.add(quantumNexusGroup);

    // 3. Dynamic 3D Lights
    const ambientLight = new THREE.AmbientLight(0x0e061e, 2.0);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(0x00f0ff, 4.0, 160);
    coreLight.position.set(0, 0, 0);
    quantumNexusGroup.add(coreLight);

    // Dynamic 3D Cursor Light that follows pointer in 3D world space
    const cursorLight = new THREE.PointLight(0xa855f7, 4.2, 180);
    cursorLight.position.set(0, 0, 30);
    scene.add(cursorLight);

    const amberFillLight = new THREE.PointLight(0xf59e0b, 2.5, 200);
    amberFillLight.position.set(50, -35, -20);
    scene.add(amberFillLight);

    // 4. Custom Luminous Particle Texture Sprite
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.18, 'rgba(216, 235, 255, 0.95)');
      grad.addColorStop(0.44, 'rgba(168, 85, 247, 0.55)');
      grad.addColorStop(0.72, 'rgba(6, 182, 212, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(pCanvas);

    // 5. Central Holographic Quantum Cybersphere (The Innovation Core)
    // Multi-layer nested geodesic shell that glows and breathes
    const sphereRadius = 13.5;

    // Inner glowing core sphere
    const innerCoreGeo = new THREE.SphereGeometry(6.5, 32, 32);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    quantumNexusGroup.add(innerCoreMesh);

    // Middle Geodesic Icosahedron Cage
    const cageGeo = new THREE.IcosahedronGeometry(sphereRadius, 1);
    const cageMat = new THREE.MeshStandardMaterial({
      color: 0x0b041a,
      roughness: 0.25,
      metalness: 0.9,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    quantumNexusGroup.add(cageMesh);

    // Outer Holographic Longitude/Latitude Cyber Wireframe Sphere
    const cyberGlobeGeo = new THREE.SphereGeometry(sphereRadius * 1.25, 24, 16);
    const cyberGlobeMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const cyberGlobeMesh = new THREE.Mesh(cyberGlobeGeo, cyberGlobeMat);
    quantumNexusGroup.add(cyberGlobeMesh);

    // 6. Three Concentric 3D Gyroscopic Quantum Rings
    // Ring 1: Neon Cyan inner orbital ring
    const ringGeo1 = new THREE.TorusGeometry(22, 0.35, 12, 90);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
    ringMesh1.rotation.x = Math.PI / 4;
    quantumNexusGroup.add(ringMesh1);

    // Ring 2: Electric Violet middle orbital ring (offset angle)
    const ringGeo2 = new THREE.TorusGeometry(28, 0.4, 12, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.x = -Math.PI / 3;
    ringMesh2.rotation.y = Math.PI / 6;
    quantumNexusGroup.add(ringMesh2);

    // Ring 3: Amber Gold outer celestial ring
    const ringGeo3 = new THREE.TorusGeometry(35, 0.45, 12, 110);
    const ringMat3 = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const ringMesh3 = new THREE.Mesh(ringGeo3, ringMat3);
    ringMesh3.rotation.y = Math.PI / 2.5;
    quantumNexusGroup.add(ringMesh3);

    // Orbiting Venture Data Nodes traveling along Ring 1 & Ring 2
    const satelliteCount = 6;
    const satellites: Array<{ mesh: THREE.Mesh; ringIndex: number; speed: number; angle: number; radius: number }> = [];

    for (let s = 0; s < satelliteCount; s++) {
      const satGeo = new THREE.OctahedronGeometry(1.2, 0);
      const satMat = new THREE.MeshBasicMaterial({
        color: s % 2 === 0 ? 0x00f0ff : 0xf59e0b,
        wireframe: true,
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      quantumNexusGroup.add(satMesh);

      satellites.push({
        mesh: satMesh,
        ringIndex: s % 3,
        speed: 0.8 + Math.random() * 0.6,
        angle: (s / satelliteCount) * Math.PI * 2,
        radius: s % 3 === 0 ? 22 : s % 3 === 1 ? 28 : 35,
      });
    }

    // 7. Swirling 3D Fluid Particle Torus (Cosmic Quantum Stream)
    const particleCount = isMobile ? 1800 : 3600;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const baseAngles = new Float32Array(particleCount);
    const baseRadii = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const verticalPhases = new Float32Array(particleCount);
    const verticalAmps = new Float32Array(particleCount);

    const minR = 26;
    const maxR = 92;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const u = Math.random();
      const r = minR + Math.pow(u, 1.4) * (maxR - minR);

      baseAngles[i] = angle;
      baseRadii[i] = r;
      speeds[i] = (0.35 / Math.sqrt(r)) * (0.8 + Math.random() * 0.4);
      verticalPhases[i] = Math.random() * Math.PI * 2;
      verticalAmps[i] = 1.5 + (r / maxR) * 6.0;

      const y = Math.sin(verticalPhases[i]) * verticalAmps[i];
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      // Color gradation: Cyan -> Neon Violet -> Amber Starlight
      const t = (r - minR) / (maxR - minR);
      let col = new THREE.Color();
      if (t < 0.35) {
        col.lerpColors(new THREE.Color(0x00f0ff), new THREE.Color(0xa855f7), t / 0.35);
      } else {
        col.lerpColors(new THREE.Color(0xa855f7), new THREE.Color(0xf59e0b), (t - 0.35) / 0.65);
      }

      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: isMobile ? 3.4 : 4.0,
      map: particleTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      opacity: 0.85,
    });

    const particleCloud = new THREE.Points(particleGeo, particleMat);
    particleCloud.rotation.x = Math.PI / 2.3;
    quantumNexusGroup.add(particleCloud);

    // 8. Floating Kinetic Faceted 3D Crystals in the Periphery
    const crystals: FloatingPrism[] = [];
    const crystalCount = isMobile ? 6 : 12;

    const crystalGeos = [
      () => new THREE.OctahedronGeometry(3.6, 0),
      () => new THREE.IcosahedronGeometry(3.8, 0),
      () => new THREE.DodecahedronGeometry(3.2, 0),
      () => new THREE.TorusGeometry(3.2, 0.6, 8, 20),
    ];

    const crystalColors = [0x00f0ff, 0xa855f7, 0x38bdf8, 0xf59e0b];

    for (let c = 0; c < crystalCount; c++) {
      const geo = crystalGeos[c % crystalGeos.length]();
      const col = crystalColors[c % crystalColors.length];

      const mat = new THREE.MeshStandardMaterial({
        color: 0x090514,
        roughness: 0.18,
        metalness: 0.92,
        transparent: true,
        opacity: 0.85,
      });

      const mesh = new THREE.Mesh(geo, mat);

      const edgeGeo = new THREE.EdgesGeometry(geo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      });
      const edges = new THREE.LineSegments(edgeGeo, edgeMat);

      const group = new THREE.Group();
      group.add(mesh);
      group.add(edges);

      // Position toward peripheral perimeter so center text is unobstructed
      const angle = (c / crystalCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const radius = 52 + Math.random() * 38;
      const posX = Math.cos(angle) * radius * 1.45;
      const posY = Math.sin(angle) * (radius * 0.65) + (Math.random() - 0.5) * 20;
      const posZ = -10 + (Math.random() - 0.5) * 50;

      group.position.set(posX, posY, posZ);
      scene.add(group);

      crystals.push({
        group,
        mesh,
        edges,
        basePos: new THREE.Vector3(posX, posY, posZ),
        velocity: new THREE.Vector3(0, 0, 0),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.018,
          (Math.random() - 0.5) * 0.012
        ),
        floatSpeed: 0.5 + Math.random() * 0.5,
        floatAmp: 2.2 + Math.random() * 2.8,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // 9. Interactive Holographic Energy Shockwave (Click Burst)
    const shockwaveGeo = new THREE.RingGeometry(1, 3.5, 64);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveMesh.rotation.x = Math.PI / 2.3;
    quantumNexusGroup.add(shockwaveMesh);

    let shockwaveActive = false;
    let shockwaveScale = 1.0;

    // 10. Pointer Tracking & 3D Raycasting
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

    const onClick = () => {
      // Trigger holographic resonance shockwave
      shockwaveActive = true;
      shockwaveScale = 1.0;
      shockwaveMat.opacity = 1.0;

      // Energy flash on core light
      coreLight.intensity = 8.0;

      // Add angular momentum burst to orbital rings and crystals
      ringMesh1.rotation.z += 0.4;
      ringMesh2.rotation.z -= 0.5;
      ringMesh3.rotation.z += 0.3;

      for (const crystal of crystals) {
        crystal.rotSpeed.x += (Math.random() - 0.5) * 0.06;
        crystal.rotSpeed.y += (Math.random() - 0.5) * 0.06;
      }
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

    // 11. 60FPS Quantum Simulation Loop
    const clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.08);
      const elapsedTime = clock.getElapsedTime();

      // Smooth pointer easing
      mouse.x += (targetMouse.x - mouse.x) * 0.06;
      mouse.y += (targetMouse.y - mouse.y) * 0.06;
      scrollY += (targetScrollY - scrollY) * 0.05;

      // Project mouse into 3D world space
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(planeZ, mouse3D);

      // Cursor light smoothly tracks mouse coordinates
      cursorLight.position.set(mouse3D.x, mouse3D.y, mouse3D.z + 18);
      coreLight.intensity = Math.max(3.8, coreLight.intensity * 0.96);

      // Smooth 3D Camera Parallax Tilt
      const targetCamX = mouse.x * 18;
      const targetCamY = mouse.y * 11 - (scrollY * 0.02);
      camera.position.x += (targetCamX - camera.position.x) * 0.04;
      camera.position.y += (targetCamY - camera.position.y) * 0.04;
      camera.lookAt(0, -(scrollY * 0.014), 0);

      // Interactive Gyroscopic Gimbal Tilt: warps whole system toward pointer
      const targetTiltX = mouse.y * 0.32 + Math.sin(elapsedTime * 0.4) * 0.05;
      const targetTiltY = mouse.x * 0.42 + elapsedTime * 0.08;
      quantumNexusGroup.rotation.x += (targetTiltX - quantumNexusGroup.rotation.x) * 0.05;
      quantumNexusGroup.rotation.y += (targetTiltY - quantumNexusGroup.rotation.y) * 0.05;

      // Rotate Geodesic Shells
      cageMesh.rotation.y += delta * 0.3;
      cageMesh.rotation.x += delta * 0.15;
      cyberGlobeMesh.rotation.y -= delta * 0.25;
      cyberGlobeMesh.rotation.z += delta * 0.1;

      // Core breathing pulse
      const breathe = 1.0 + Math.sin(elapsedTime * 2.8) * 0.08;
      innerCoreMesh.scale.set(breathe, breathe, breathe);

      // Gyroscopic Ring Rotations
      ringMesh1.rotation.z += delta * 0.55;
      ringMesh2.rotation.z -= delta * 0.45;
      ringMesh3.rotation.z += delta * 0.35;

      // Update Satellites along rings
      for (const sat of satellites) {
        sat.angle += sat.speed * delta;
        const x = Math.cos(sat.angle) * sat.radius;
        const y = Math.sin(sat.angle) * sat.radius * 0.3;
        const z = Math.sin(sat.angle) * sat.radius;
        sat.mesh.position.set(x, y, z);
        sat.mesh.rotation.x += delta * 2.0;
        sat.mesh.rotation.y += delta * 2.5;
      }

      // Update Shockwave Ring
      if (shockwaveActive) {
        shockwaveScale += 50.0 * delta;
        shockwaveMesh.scale.set(shockwaveScale, shockwaveScale, 1);
        shockwaveMat.opacity = Math.max(0, 1 - shockwaveScale / 75.0);
        if (shockwaveScale >= 75.0) {
          shockwaveActive = false;
        }
      }

      // Update Swirling Fluid Particle Torus
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const spd = speeds[i];
        let angle = baseAngles[i] + spd * delta * 2.4;
        baseAngles[i] = angle;

        const r = baseRadii[i];
        const vWave = Math.sin(elapsedTime * 1.2 + verticalPhases[i]) * verticalAmps[i];

        let px = Math.cos(angle) * r;
        let py = vWave;
        let pz = Math.sin(angle) * r;

        // Interactive cursor repulsion / magnetic wake
        const dx = px - mouse3D.x;
        const dy = py - mouse3D.y;
        const dz = pz - mouse3D.z;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < 1600 && distSq > 0.001) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / 40.0) * 16.0;
          px += (dx / dist) * force;
          py += (dy / dist) * force;
          pz += (dz / dist) * force * 0.4;
        }

        posArr[i3] = px;
        posArr[i3 + 1] = py;
        posArr[i3 + 2] = pz;
      }
      posAttr.needsUpdate = true;

      // Update Floating Peripheral Crystals
      for (let i = 0; i < crystals.length; i++) {
        const crystal = crystals[i];

        crystal.group.rotation.x += crystal.rotSpeed.x;
        crystal.group.rotation.y += crystal.rotSpeed.y;
        crystal.group.rotation.z += crystal.rotSpeed.z;

        crystal.rotSpeed.x *= 0.995;
        crystal.rotSpeed.y *= 0.995;

        // Harmonic bobbing
        const floatY = Math.sin(elapsedTime * crystal.floatSpeed + crystal.phase) * crystal.floatAmp;
        const targetX = crystal.basePos.x;
        const targetY = crystal.basePos.y + floatY;
        const targetZ = crystal.basePos.z;

        // Cursor magnetic physics
        const dx = crystal.group.position.x - mouse3D.x;
        const dy = crystal.group.position.y - mouse3D.y;
        const dz = crystal.group.position.z - mouse3D.z;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < 2304 && distSq > 0.001) {
          const dist = Math.sqrt(distSq);
          const repel = (1 - dist / 48.0) * 20.0;
          crystal.velocity.x += (dx / dist) * repel * delta;
          crystal.velocity.y += (dy / dist) * repel * delta;
          crystal.velocity.z += (dz / dist) * (repel * 0.4) * delta;
        }

        // Spring return
        crystal.velocity.x += (targetX - crystal.group.position.x) * 0.04;
        crystal.velocity.y += (targetY - crystal.group.position.y) * 0.04;
        crystal.velocity.z += (targetZ - crystal.group.position.z) * 0.04;
        crystal.velocity.multiplyScalar(0.92);

        crystal.group.position.add(crystal.velocity);
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // 12. Resource Disposal
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

      innerCoreGeo.dispose();
      innerCoreMat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      cyberGlobeGeo.dispose();
      cyberGlobeMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      ringGeo3.dispose();
      ringMat3.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      shockwaveGeo.dispose();
      shockwaveMat.dispose();
      particleTexture.dispose();

      for (const crystal of crystals) {
        crystal.mesh.geometry.dispose();
        if (Array.isArray(crystal.mesh.material)) {
          crystal.mesh.material.forEach((m) => m.dispose());
        } else {
          crystal.mesh.material.dispose();
        }
        crystal.edges.geometry.dispose();
        if (Array.isArray(crystal.edges.material)) {
          crystal.edges.material.forEach((m) => m.dispose());
        } else {
          crystal.edges.material.dispose();
        }
      }

      renderer.dispose();
    };
  }, []);

  if (!webglSupported) {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-[#04020a]"
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #0d0520 0%, #05020c 60%, #020106 100%)',
      }}
      aria-hidden="true"
    />
  );
}
