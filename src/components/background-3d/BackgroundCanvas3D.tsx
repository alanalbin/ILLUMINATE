'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface BackgroundCanvas3DProps {
  onReplayIntro?: () => void;
}

interface FloatingCrystal {
  group: THREE.Group;
  mesh: THREE.Mesh;
  edges: THREE.LineSegments;
  basePos: THREE.Vector3;
  velocity: THREE.Vector3;
  rotSpeed: THREE.Vector3;
  floatSpeed: number;
  floatAmplitude: number;
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

    // 2. Scene, Camera & Atmospheric Fog Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05030a, 0.0032);

    const camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      1,
      1200
    );
    camera.position.set(0, 5, 115);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
      precision: isMobile ? 'mediump' : 'highp',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    // 3. Dynamic 3D Lights Setup (Highlights 3D geometry facets in real time)
    const ambientLight = new THREE.AmbientLight(0x0e061e, 2.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xa855f7, 2.0);
    dirLight.position.set(40, 60, 50);
    scene.add(dirLight);

    // Interactive 3D Cursor Point Light (Electric Cyan)
    const cursorLight = new THREE.PointLight(0x00f0ff, 4.8, 160);
    cursorLight.position.set(0, 0, 30);
    scene.add(cursorLight);

    // Complementary Cosmic Violet Light
    const violetLight = new THREE.PointLight(0x9333ea, 3.5, 220);
    violetLight.position.set(-45, -20, 25);
    scene.add(violetLight);

    // 4. Undulating 3D Interactive Cyber Wave Lattice Plane
    // Sits in 3D perspective space and physically undulates with fluid wave physics
    const planeCols = isMobile ? 32 : 54;
    const planeRows = isMobile ? 24 : 40;
    const planeWidth = 260;
    const planeDepth = 200;

    const wavePlaneGeo = new THREE.PlaneGeometry(
      planeWidth,
      planeDepth,
      planeCols,
      planeRows
    );
    wavePlaneGeo.rotateX(-Math.PI / 2.3);
    wavePlaneGeo.translate(0, -38, -35);

    const waveOrigPositions = Float32Array.from(wavePlaneGeo.attributes.position.array);

    const wavePlaneMat = new THREE.MeshStandardMaterial({
      color: 0x12072e,
      roughness: 0.35,
      metalness: 0.85,
      wireframe: true,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
    });

    const wavePlaneMesh = new THREE.Mesh(wavePlaneGeo, wavePlaneMat);
    scene.add(wavePlaneMesh);

    // 5. Floating Interactive 3D Low-Poly Kinetic Crystals & Polyhedra
    // Multiple 3D geometric shapes with metallic facets that react directly to cursor
    const crystals: FloatingCrystal[] = [];
    const crystalCount = isMobile ? 8 : 15;

    // Distinct 3D geometries
    const geometries = [
      () => new THREE.IcosahedronGeometry(4.2, 0),
      () => new THREE.OctahedronGeometry(4.0, 0),
      () => new THREE.DodecahedronGeometry(3.6, 0),
      () => new THREE.TorusGeometry(3.8, 0.7, 10, 24),
      () => new THREE.TorusKnotGeometry(2.8, 0.45, 36, 8, 2, 3),
      () => new THREE.IcosahedronGeometry(5.2, 1),
    ];

    const crystalColors = [
      { fill: 0x090514, edge: 0x00f0ff }, // Cyber Cyan
      { fill: 0x120324, edge: 0xa855f7 }, // Neon Violet
      { fill: 0x06081e, edge: 0x38bdf8 }, // Sky Blue
      { fill: 0x1e0e02, edge: 0xf59e0b }, // Amber Gold
      { fill: 0x0a031c, edge: 0xc084fc }, // Radiant Purple
    ];

    // Distribute around perimeter and deep space to keep center content clear
    for (let i = 0; i < crystalCount; i++) {
      const geoFactory = geometries[i % geometries.length];
      const geo = geoFactory();
      const colorScheme = crystalColors[i % crystalColors.length];

      // Solid metallic faceted 3D body
      const mat = new THREE.MeshStandardMaterial({
        color: colorScheme.fill,
        roughness: 0.15,
        metalness: 0.92,
        transparent: true,
        opacity: 0.88,
      });

      const mesh = new THREE.Mesh(geo, mat);

      // Crisp luminous wireframe edges
      const edgeGeo = new THREE.EdgesGeometry(geo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: colorScheme.edge,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      });
      const edges = new THREE.LineSegments(edgeGeo, edgeMat);

      const group = new THREE.Group();
      group.add(mesh);
      group.add(edges);

      // Position in 3D space: keep edges more populated to preserve hero readability
      const angle = (i / crystalCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const radius = 45 + Math.random() * 45;
      const posX = Math.cos(angle) * radius * 1.5;
      const posY = Math.sin(angle) * (radius * 0.7) + (Math.random() - 0.5) * 20;
      const posZ = -15 + (Math.random() - 0.5) * 65;

      group.position.set(posX, posY, posZ);

      // Random starting rotation
      group.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      scene.add(group);

      crystals.push({
        group,
        mesh,
        edges,
        basePos: new THREE.Vector3(posX, posY, posZ),
        velocity: new THREE.Vector3(0, 0, 0),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.018,
          (Math.random() - 0.5) * 0.022,
          (Math.random() - 0.5) * 0.016
        ),
        floatSpeed: 0.4 + Math.random() * 0.6,
        floatAmplitude: 2.5 + Math.random() * 3.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // 6. Subtle Volumetric 3D Starlight Dust Embers
    const emberCount = isMobile ? 220 : 550;
    const emberGeo = new THREE.BufferGeometry();
    const emberPos = new Float32Array(emberCount * 3);
    const emberCol = new Float32Array(emberCount * 3);

    for (let i = 0; i < emberCount; i++) {
      const i3 = i * 3;
      emberPos[i3] = (Math.random() - 0.5) * 280;
      emberPos[i3 + 1] = (Math.random() - 0.5) * 200;
      emberPos[i3 + 2] = (Math.random() - 0.5) * 160;

      const isCyan = Math.random() > 0.45;
      emberCol[i3] = isCyan ? 0.05 : 0.65;
      emberCol[i3 + 1] = isCyan ? 0.75 : 0.35;
      emberCol[i3 + 2] = isCyan ? 0.95 : 0.98;
    }

    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
    emberGeo.setAttribute('color', new THREE.BufferAttribute(emberCol, 3));

    // Particle sprite
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(168, 85, 247, 0.7)');
      grad.addColorStop(0.7, 'rgba(0, 240, 255, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 32, 32);
    }
    const emberTexture = new THREE.CanvasTexture(pCanvas);

    const emberMat = new THREE.PointsMaterial({
      size: isMobile ? 3.0 : 3.6,
      map: emberTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      opacity: 0.7,
    });

    const embers = new THREE.Points(emberGeo, emberMat);
    scene.add(embers);

    // 7. Interactive Pointer & Physics Tracking
    const mouse = new THREE.Vector2(0, 0);
    const targetMouse = new THREE.Vector2(0, 0);
    const raycaster = new THREE.Raycaster();
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const mouse3D = new THREE.Vector3(0, 0, 0);

    let scrollY = 0;
    let targetScrollY = 0;

    // Interactive Shockwaves on Click
    const clickPulses: Array<{
      origin: THREE.Vector3;
      radius: number;
      maxRadius: number;
      speed: number;
      strength: number;
    }> = [];

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      targetMouse.x = (clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(clientY / window.innerHeight) * 2 + 1;
    };

    const onClick = () => {
      // Create radial impulse in 3D
      raycaster.setFromCamera(mouse, camera);
      const hit = new THREE.Vector3();
      raycaster.ray.intersectPlane(planeZ, hit);

      clickPulses.push({
        origin: hit,
        radius: 0.1,
        maxRadius: 90,
        speed: 75,
        strength: 28,
      });

      // Momentary high-intensity flash on cursor light
      cursorLight.intensity = 8.0;

      // Add angular momentum to all 3D crystals on click
      for (const crystal of crystals) {
        crystal.rotSpeed.x += (Math.random() - 0.5) * 0.08;
        crystal.rotSpeed.y += (Math.random() - 0.5) * 0.08;
        crystal.rotSpeed.z += (Math.random() - 0.5) * 0.08;
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

    // 8. 60FPS High-Performance 3D Simulation Loop
    const clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.08);
      const elapsedTime = clock.getElapsedTime();

      // Smooth pointer & scroll damping
      mouse.x += (targetMouse.x - mouse.x) * 0.07;
      mouse.y += (targetMouse.y - mouse.y) * 0.07;
      scrollY += (targetScrollY - scrollY) * 0.05;

      // Project mouse into 3D world space
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(planeZ, mouse3D);

      // Cursor 3D light follows mouse position smoothly
      cursorLight.position.set(mouse3D.x, mouse3D.y, mouse3D.z + 16);
      cursorLight.intensity = Math.max(4.2, cursorLight.intensity * 0.95);

      // Complementary light orbits subtly in 3D
      violetLight.position.x = Math.sin(elapsedTime * 0.35) * 55;
      violetLight.position.y = Math.cos(elapsedTime * 0.4) * 35;

      // Cinematic 3D Camera Parallax Tilt
      const targetCamX = mouse.x * 16;
      const targetCamY = mouse.y * 10 - (scrollY * 0.02);
      camera.position.x += (targetCamX - camera.position.x) * 0.035;
      camera.position.y += (targetCamY - camera.position.y) * 0.035;
      camera.lookAt(0, -(scrollY * 0.012), 0);

      // Update click shockwave pulses
      for (let p = clickPulses.length - 1; p >= 0; p--) {
        const pulse = clickPulses[p];
        pulse.radius += pulse.speed * delta;
        if (pulse.radius >= pulse.maxRadius) {
          clickPulses.splice(p, 1);
        }
      }

      // 9. Update Undulating 3D Cyber Wave Mesh Vertices
      const wavePosAttr = wavePlaneGeo.attributes.position as THREE.BufferAttribute;
      const wavePosArr = wavePosAttr.array as Float32Array;
      const vertexCount = wavePosArr.length / 3;

      for (let v = 0; v < vertexCount; v++) {
        const v3 = v * 3;
        const origX = waveOrigPositions[v3];
        const origY = waveOrigPositions[v3 + 1];
        const origZ = waveOrigPositions[v3 + 2];

        // Harmonic organic 3D wave mathematics
        const wave1 = Math.sin(origX * 0.035 + elapsedTime * 1.2) * 5.5;
        const wave2 = Math.cos(origY * 0.045 + elapsedTime * 0.9) * 4.5;
        const wave3 = Math.sin((origX + origY) * 0.025 + elapsedTime * 1.5) * 3.0;

        // Interactive mouse disturbance on 3D plane
        const distToMouse = Math.sqrt(
          (origX - mouse3D.x) * (origX - mouse3D.x) +
          (origY - mouse3D.y) * (origY - mouse3D.y)
        );

        let mouseElevation = 0;
        if (distToMouse < 45) {
          mouseElevation = (1 - distToMouse / 45) * 9.0 * Math.sin(elapsedTime * 4.0);
        }

        // Click pulse ripple effect on 3D grid
        let pulseElevation = 0;
        for (let p = 0; p < clickPulses.length; p++) {
          const pulse = clickPulses[p];
          const distToPulse = Math.abs(distToMouse - pulse.radius);
          if (distToPulse < 12) {
            pulseElevation += (1 - distToPulse / 12) * pulse.strength * 0.45;
          }
        }

        wavePosArr[v3 + 2] = origZ + wave1 + wave2 + wave3 + mouseElevation + pulseElevation;
      }
      wavePosAttr.needsUpdate = true;

      // 10. Update Floating 3D Crystals (Kinetic Rotations & Mouse Magnetic Physics)
      for (let i = 0; i < crystals.length; i++) {
        const crystal = crystals[i];

        // 3D Rotation on all axes
        crystal.group.rotation.x += crystal.rotSpeed.x;
        crystal.group.rotation.y += crystal.rotSpeed.y;
        crystal.group.rotation.z += crystal.rotSpeed.z;

        // Damped rotational friction back to baseline
        crystal.rotSpeed.x *= 0.995;
        crystal.rotSpeed.y *= 0.995;
        crystal.rotSpeed.z *= 0.995;

        // Smooth vertical floating harmonic bobbing
        const floatY = Math.sin(elapsedTime * crystal.floatSpeed + crystal.phase) * crystal.floatAmplitude;
        const floatZ = Math.cos(elapsedTime * (crystal.floatSpeed * 0.7) + crystal.phase) * (crystal.floatAmplitude * 0.6);

        const targetX = crystal.basePos.x;
        const targetY = crystal.basePos.y + floatY;
        const targetZ = crystal.basePos.z + floatZ;

        // Magnetic 3D Cursor Physics (Repulsion & Alignment)
        const dx = crystal.group.position.x - mouse3D.x;
        const dy = crystal.group.position.y - mouse3D.y;
        const dz = crystal.group.position.z - mouse3D.z;
        const distSq = dx * dx + dy * dy + dz * dz;

        const cursorRange = 48;
        if (distSq < cursorRange * cursorRange && distSq > 0.001) {
          const dist = Math.sqrt(distSq);
          const repelForce = (1 - dist / cursorRange) * 22;
          crystal.velocity.x += (dx / dist) * repelForce * delta;
          crystal.velocity.y += (dy / dist) * repelForce * delta;
          crystal.velocity.z += (dz / dist) * (repelForce * 0.5) * delta;

          // Faster spin when close to cursor
          crystal.rotSpeed.x += (Math.random() - 0.5) * 0.012;
          crystal.rotSpeed.y += (Math.random() - 0.5) * 0.012;
        }

        // Spring return to base floating position
        crystal.velocity.x += (targetX - crystal.group.position.x) * 0.04;
        crystal.velocity.y += (targetY - crystal.group.position.y) * 0.04;
        crystal.velocity.z += (targetZ - crystal.group.position.z) * 0.04;

        // Velocity damping
        crystal.velocity.multiplyScalar(0.92);

        crystal.group.position.add(crystal.velocity);
      }

      // Embers slow drift
      embers.rotation.y = elapsedTime * 0.02;
      embers.rotation.x = Math.sin(elapsedTime * 0.015) * 0.05;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // 11. Clean Resource Disposal on Component Unmount
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

      wavePlaneGeo.dispose();
      wavePlaneMat.dispose();

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

      emberGeo.dispose();
      emberMat.dispose();
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
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      style={{
        background: 'radial-gradient(ellipse at 50% 25%, #0d0622 0%, #05030a 65%, #020106 100%)',
      }}
      aria-hidden="true"
    />
  );
}
