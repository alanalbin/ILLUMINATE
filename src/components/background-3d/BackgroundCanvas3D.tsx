'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function BackgroundCanvas3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  useEffect(() => {
    // 1. WebGL capability check
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
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

    // 2. Accessibility: Reduced Motion Check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    // 3. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05030a, 0.0018);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.z = 240;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // 4. Volumetric-Style Soft Lighting
    const ambientLight = new THREE.AmbientLight(0x4c1d95, 0.8);
    scene.add(ambientLight);

    const purplePointLight = new THREE.PointLight(0x9333ea, 2.2, 500);
    purplePointLight.position.set(120, 100, 100);
    scene.add(purplePointLight);

    const violetPointLight = new THREE.PointLight(0x7c3aed, 2.0, 500);
    violetPointLight.position.set(-140, -80, 80);
    scene.add(violetPointLight);

    // 5. 3D Particle Field with Realistic Depth & Gradients
    const particleCount = isMobile ? 220 : 550;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * 600;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * 500;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 400;

      particleScales[i] = Math.random() * 2.5 + 0.8;
      particleSpeeds[i] = Math.random() * 0.2 + 0.05;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Particle circular texture with soft alpha falloff
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
      gradient.addColorStop(0, 'rgba(216, 180, 254, 1)');
      gradient.addColorStop(0.35, 'rgba(168, 85, 247, 0.7)');
      gradient.addColorStop(0.7, 'rgba(124, 58, 237, 0.25)');
      gradient.addColorStop(1, 'rgba(5, 3, 10, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 4,
      map: particleTexture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 6. Slowly Moving, Translucent Geometric Forms (Low-Poly Ethereal Polyhedra)
    const geometricGroup = new THREE.Group();
    scene.add(geometricGroup);

    // Geometry 1: Translucent Icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(28, 0);
    const icoMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      roughness: 0.4,
      metalness: 0.7,
      transparent: true,
      opacity: 0.18,
      wireframe: false,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    icoMesh.position.set(130, 40, -40);

    // Wireframe overlay for sophisticated high-tech aesthetic
    const icoWireMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const icoWire = new THREE.Mesh(icoGeo, icoWireMat);
    icoMesh.add(icoWire);
    geometricGroup.add(icoMesh);

    // Geometry 2: Floating Octahedron on left
    const octGeo = new THREE.OctahedronGeometry(22, 0);
    const octMat = new THREE.MeshStandardMaterial({
      color: 0x9333ea,
      roughness: 0.3,
      metalness: 0.8,
      transparent: true,
      opacity: 0.16,
    });
    const octMesh = new THREE.Mesh(octGeo, octMat);
    octMesh.position.set(-140, -50, -30);

    const octWireMat = new THREE.MeshBasicMaterial({
      color: 0xe9d5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const octWire = new THREE.Mesh(octGeo, octWireMat);
    octMesh.add(octWire);
    geometricGroup.add(octMesh);

    // Geometry 3: Subtle Torus in deep background
    const torusGeo = new THREE.TorusGeometry(35, 1.2, 12, 40);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x6b21a8,
      transparent: true,
      opacity: 0.15,
      wireframe: true,
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.position.set(0, -90, -120);
    torusMesh.rotation.x = Math.PI / 3;
    geometricGroup.add(torusMesh);

    // 7. Subtle 3D Perspective Grid in Deep Background
    const gridHelper = new THREE.GridHelper(500, 25, 0x581c87, 0x1f1137);
    gridHelper.position.y = -140;
    gridHelper.position.z = -50;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.25;
    scene.add(gridHelper);

    // 8. Pointer Parallax Tracking (Smooth Lerp)
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 10. Visibility API (Pause rendering when tab is hidden to save GPU & battery)
    let isTabVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 11. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isTabVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth pointer parallax interpolation
      if (!prefersReducedMotion) {
        currentMouseX += (targetMouseX - currentMouseX) * 0.04;
        currentMouseY += (targetMouseY - currentMouseY) * 0.04;

        camera.position.x = currentMouseX * 24;
        camera.position.y = -currentMouseY * 18;
        camera.lookAt(0, 0, 0);

        // Slow, elegant rotation of floating geometric forms
        icoMesh.rotation.x = elapsedTime * 0.12;
        icoMesh.rotation.y = elapsedTime * 0.15;
        icoMesh.position.y = 40 + Math.sin(elapsedTime * 0.6) * 6;

        octMesh.rotation.x = elapsedTime * 0.1;
        octMesh.rotation.z = elapsedTime * 0.14;
        octMesh.position.y = -50 + Math.cos(elapsedTime * 0.5) * 5;

        torusMesh.rotation.z = elapsedTime * 0.05;

        // Subtle oscillation of point lights
        purplePointLight.position.x = 120 + Math.sin(elapsedTime * 0.4) * 20;
        purplePointLight.position.y = 100 + Math.cos(elapsedTime * 0.3) * 15;

        violetPointLight.position.x = -140 + Math.cos(elapsedTime * 0.35) * 18;
        violetPointLight.position.y = -80 + Math.sin(elapsedTime * 0.45) * 15;

        // Gentle particle field drift
        const positions = particleGeometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          positions[i3 + 1] -= particleSpeeds[i] * 0.4;
          if (positions[i3 + 1] < -250) {
            positions[i3 + 1] = 250;
            positions[i3] = (Math.random() - 0.5) * 600;
          }
        }
        particleGeometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 12. Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      particleGeometry.dispose();
      particleMaterial.dispose();
      particleTexture.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      icoWireMat.dispose();
      octGeo.dispose();
      octMat.dispose();
      octWireMat.dispose();
      torusGeo.dispose();
      torusMat.dispose();
      gridHelper.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        background: !webglSupported
          ? 'radial-gradient(circle at 50% 20%, rgba(124, 58, 237, 0.12) 0%, rgba(5, 3, 10, 0) 70%), #05030a'
          : 'transparent',
      }}
    />
  );
}
