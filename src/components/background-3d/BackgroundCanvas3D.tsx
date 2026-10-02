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

    // 2. Cinematic Deep Space Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05030a, 0.0018);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      1200
    );
    camera.position.set(0, 0, 220);
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

    // 3. Dynamic Interactive Lighting
    const ambientLight = new THREE.AmbientLight(0x190d33, 1.4);
    scene.add(ambientLight);

    const purpleGlow = new THREE.PointLight(0xa855f7, 2.8, 650);
    purpleGlow.position.set(100, 70, 90);
    scene.add(purpleGlow);

    const cyanGlow = new THREE.PointLight(0x38bdf8, 2.2, 550);
    cyanGlow.position.set(-100, -60, 80);
    scene.add(cyanGlow);

    // Dynamic Cursor Follower Spotlight
    const pointerLight = new THREE.PointLight(0xc084fc, 4.8, 450);
    pointerLight.position.set(0, 0, 90);
    scene.add(pointerLight);

    // =========================================================================
    // 4. CELESTIAL QUANTUM TORUS KNOT & GYROSCOPIC MATRIX (Deep Space Centerpiece)
    // =========================================================================
    const matrixGroup = new THREE.Group();
    matrixGroup.position.set(0, 5, -50);
    scene.add(matrixGroup);

    // 4A. Outer Futuristic Torus Knot Wireframe
    const knotGeo = new THREE.TorusKnotGeometry(
      isMobile ? 28 : 42,
      isMobile ? 7 : 10,
      120,
      16,
      2,
      3
    );
    const knotMat = new THREE.MeshPhongMaterial({
      color: 0x8b5cf6,
      emissive: 0x3b0764,
      specular: 0x38bdf8,
      shininess: 90,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const knotMesh = new THREE.Mesh(knotGeo, knotMat);
    matrixGroup.add(knotMesh);

    // 4B. Inner Holographic Core Sphere
    const coreGeo = new THREE.IcosahedronGeometry(isMobile ? 16 : 24, 2);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x38bdf8,
      emissive: 0x075985,
      specular: 0xffffff,
      shininess: 100,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    matrixGroup.add(coreMesh);

    // 4C. Concentric Orbital Cybernetic Rings
    const ring1Geo = new THREE.TorusGeometry(isMobile ? 60 : 88, 0.7, 12, 72);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      transparent: true,
      opacity: 0.24,
      blending: THREE.AdditiveBlending,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Mesh.rotation.x = Math.PI / 3;
    matrixGroup.add(ring1Mesh);

    const ring2Geo = new THREE.TorusGeometry(isMobile ? 72 : 108, 0.6, 12, 72);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.y = Math.PI / 4;
    ring2Mesh.rotation.x = -Math.PI / 6;
    matrixGroup.add(ring2Mesh);

    // =========================================================================
    // 5. INTERACTIVE 3D NEURAL CONSTELLATION PLEXUS (Dynamic Connected Nodes)
    // =========================================================================
    const nodeCount = isMobile ? 45 : 75;
    const nodeCoords: THREE.Vector3[] = [];
    const nodeVelocities: THREE.Vector3[] = [];

    const nodePositions = new Float32Array(nodeCount * 3);

    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() - 0.5) * 440;
      const y = (Math.random() - 0.5) * 320;
      const z = (Math.random() - 0.5) * 260;
      nodeCoords.push(new THREE.Vector3(x, y, z));
      nodeVelocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.12,
          (Math.random() - 0.5) * 0.12,
          (Math.random() - 0.5) * 0.08
        )
      );
      nodePositions[i * 3] = x;
      nodePositions[i * 3 + 1] = y;
      nodePositions[i * 3 + 2] = z;
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));

    // High quality glowing node sprite
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.25, 'rgba(192, 132, 252, 0.85)');
      grad.addColorStop(0.65, 'rgba(124, 58, 237, 0.3)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 64, 64);
    }
    const nodeTexture = new THREE.CanvasTexture(pCanvas);

    const nodeMat = new THREE.PointsMaterial({
      size: isMobile ? 5.5 : 7.0,
      map: nodeTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const nodesField = new THREE.Points(nodeGeo, nodeMat);
    scene.add(nodesField);

    // Dynamic Constellation Connecting Lines
    const maxLines = (nodeCount * (nodeCount - 1)) / 2;
    const linePositions = new Float32Array(maxLines * 6);
    const lineColors = new Float32Array(maxLines * 6);

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const linesMesh = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(linesMesh);

    // =========================================================================
    // 6. INTERACTIVE 3D SHOCKWAVE PULSE (Click Feedback)
    // =========================================================================
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
    // 7. USER INTERACTION: Cursor Lighting, Shockwave, Scroll Physics & Parallax
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
      shockwaveMat.opacity = 0.85;

      if (clientX !== undefined && clientY !== undefined) {
        const normX = (clientX / window.innerWidth - 0.5) * 160;
        const normY = -(clientY / window.innerHeight - 0.5) * 120;
        shockwaveMesh.position.set(normX, normY, -20);
      } else {
        shockwaveMesh.position.set(0, 0, -20);
      }

      pointerLight.intensity = 7.5;
    };

    const handlePointerMove = (e: PointerEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;

      // Project pointer into 3D world coords for follower light
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      const vector = new THREE.Vector3(normX, normY, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = 160;
      const pos = camera.position.clone().add(dir.multiplyScalar(distance));
      pointerLight.position.lerp(pos, 0.25);
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
    window.addEventListener('click', handleWindowClick, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    handleScroll();

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

    // =========================================================================
    // 8. HIGH-PERFORMANCE 60FPS ANIMATION LOOP
    // =========================================================================
    let animationFrameId: number;
    const clock = new THREE.Clock();
    const connectDistance = isMobile ? 65 : 82;
    const connectDistSq = connectDistance * connectDistance;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isTabVisible) return;

      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      // Smooth scroll interpolation
      currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.07;
      scrollVelocity *= 0.92;

      // Parallax camera tilt & smooth scroll descent
      if (!prefersReducedMotion) {
        currentX += (targetX - currentX) * 0.04;
        currentY += (targetY - currentY) * 0.04;

        const scrollCameraY = -currentScrollProgress * 120;
        const scrollCameraZ = 220 - Math.sin(currentScrollProgress * Math.PI) * 45;
        const scrollCameraTilt = Math.sin(currentScrollProgress * Math.PI * 2) * 5;

        camera.position.x = currentX * 14 + scrollCameraTilt;
        camera.position.y = -currentY * 9 + scrollCameraY;
        camera.position.z = scrollCameraZ;
        camera.lookAt(0, scrollCameraY * 0.6, 0);

        // Torus knot & matrix rotation
        const scrollRot = currentScrollProgress * Math.PI * 2.5;
        knotMesh.rotation.y = time * 0.12 + scrollRot;
        knotMesh.rotation.x = time * 0.08 + Math.sin(currentScrollProgress * Math.PI) * 0.3;

        coreMesh.rotation.y = -time * 0.18 - scrollRot * 1.2;
        coreMesh.rotation.z = time * 0.1;

        ring1Mesh.rotation.z = time * 0.06 + scrollRot * 0.4;
        ring2Mesh.rotation.z = -time * 0.07 - scrollRot * 0.4;

        matrixGroup.position.y = 5 + Math.sin(time * 0.7) * 4;
      }

      // Pointer light intensity relaxation
      if (pointerLight.intensity > 4.8) {
        pointerLight.intensity += (4.8 - pointerLight.intensity) * 0.08;
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

      // Node Physics & Constellation Connection Matrix
      const posArray = nodeGeo.attributes.position.array as Float32Array;
      const pointer3DX = targetX * 120;
      const pointer3DY = -targetY * 90;

      let lineIndex = 0;
      const lPos = lineGeo.attributes.position.array as Float32Array;
      const lCol = lineGeo.attributes.color.array as Float32Array;

      for (let i = 0; i < nodeCount; i++) {
        const coord = nodeCoords[i];
        const vel = nodeVelocities[i];

        coord.x += vel.x;
        coord.y += vel.y + (scrollVelocity * 0.002);
        coord.z += vel.z;

        // Boundary wrapping
        if (coord.x < -220) coord.x = 220;
        if (coord.x > 220) coord.x = -220;
        if (coord.y < -160) coord.y = 160;
        if (coord.y > 160) coord.y = -160;
        if (coord.z < -130) coord.z = 130;
        if (coord.z > 130) coord.z = -130;

        // Magnetic cursor repulsion
        const dx = coord.x - pointer3DX;
        const dy = coord.y - pointer3DY;
        const distSq = dx * dx + dy * dy;
        if (distSq < 4900) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / 70) * 0.7;
          coord.x += (dx / dist) * force;
          coord.y += (dy / dist) * force;
        }

        posArray[i * 3] = coord.x;
        posArray[i * 3 + 1] = coord.y;
        posArray[i * 3 + 2] = coord.z;

        // Calculate dynamic proximity lines to neighboring nodes
        for (let j = i + 1; j < nodeCount; j++) {
          const other = nodeCoords[j];
          const distSq3D = coord.distanceToSquared(other);

          if (distSq3D < connectDistSq) {
            const alpha = 1.0 - distSq3D / connectDistSq;

            const p1 = lineIndex * 6;
            const p2 = p1 + 3;

            lPos[p1] = coord.x;
            lPos[p1 + 1] = coord.y;
            lPos[p1 + 2] = coord.z;

            lPos[p2] = other.x;
            lPos[p2 + 1] = other.y;
            lPos[p2 + 2] = other.z;

            // Gradient line color matching brand
            const r = 0.55 * alpha;
            const g = 0.35 * alpha;
            const b = 0.95 * alpha;

            lCol[p1] = r;
            lCol[p1 + 1] = g;
            lCol[p1 + 2] = b;

            lCol[p2] = r * 0.7;
            lCol[p2 + 1] = g * 0.9;
            lCol[p2 + 2] = b;

            lineIndex++;
          }
        }
      }

      nodeGeo.attributes.position.needsUpdate = true;
      lineGeo.setDrawRange(0, lineIndex * 2);
      lineGeo.attributes.position.needsUpdate = true;
      lineGeo.attributes.color.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('click', handleWindowClick);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      nodeGeo.dispose();
      nodeMat.dispose();
      nodeTexture.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      knotGeo.dispose();
      knotMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
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
