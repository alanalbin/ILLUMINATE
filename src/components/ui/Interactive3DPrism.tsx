'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, RotateCw, Zap } from 'lucide-react';

interface Interactive3DPrismProps {
  className?: string;
}

export default function Interactive3DPrism({ className = '' }: Interactive3DPrismProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [clickCount, setClickCount] = useState(0);
  const [isEnergized, setIsEnergized] = useState(false);
  const clickCallbackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 320;
    const height = mount.clientHeight || 280;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mount.appendChild(renderer.domElement);
    } catch {
      return;
    }

    // Lights
    const ambient = new THREE.AmbientLight(0x2e1065, 1.2);
    scene.add(ambient);

    const light1 = new THREE.PointLight(0xa855f7, 3, 20);
    light1.position.set(5, 5, 5);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x38bdf8, 3, 20);
    light2.position.set(-5, -5, 5);
    scene.add(light2);

    // Group for rotation
    const group = new THREE.Group();
    scene.add(group);

    // Outer Crystal Geometry: Faceted Icosahedron
    const crystalGeo = new THREE.IcosahedronGeometry(2.4, 0);
    const crystalMat = new THREE.MeshPhongMaterial({
      color: 0x9333ea,
      emissive: 0x4c1d95,
      specular: 0xffffff,
      shininess: 90,
      transparent: true,
      opacity: 0.85,
      wireframe: false,
      flatShading: true,
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    group.add(crystalMesh);

    // Outer Glowing Wireframe Cage
    const wireGeo = new THREE.IcosahedronGeometry(2.48, 0);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    group.add(wireMesh);

    // Inner Glowing Core (Octahedron)
    const coreGeo = new THREE.OctahedronGeometry(1.2, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // Orbiting Satellites (Tiny Cubes)
    const satCount = 8;
    const satellites: THREE.Mesh[] = [];
    for (let i = 0; i < satCount; i++) {
      const satGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const satMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x38bdf8 : 0xc084fc,
      });
      const sat = new THREE.Mesh(satGeo, satMat);
      group.add(sat);
      satellites.push(sat);
    }

    // Spark Burst Particles on Click
    const sparkCount = 60;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkVelocities = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i++) {
      sparkPositions[i * 3] = 0;
      sparkPositions[i * 3 + 1] = 0;
      sparkPositions[i * 3 + 2] = 0;

      const v = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize().multiplyScalar(0.08 + Math.random() * 0.12);

      sparkVelocities[i * 3] = v.x;
      sparkVelocities[i * 3 + 1] = v.y;
      sparkVelocities[i * 3 + 2] = v.z;
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    const sparkMat = new THREE.PointsMaterial({
      size: 0.2,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparkPoints);

    let sparkLife = 0;
    clickCallbackRef.current = () => {
      sparkLife = 1.0;
      sparkMat.opacity = 1.0;
      for (let i = 0; i < sparkCount; i++) {
        sparkPositions[i * 3] = 0;
        sparkPositions[i * 3 + 1] = 0;
        sparkPositions[i * 3 + 2] = 0;
      }
      sparkGeo.attributes.position.needsUpdate = true;
    };

    // Drag to rotate interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let autoRotateSpeed = 0.015;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      mount.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      group.rotation.y += deltaX * 0.015;
      group.rotation.x += deltaY * 0.015;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      try {
        mount.releasePointerCapture(e.pointerId);
      } catch {}
    };

    mount.addEventListener('pointerdown', onPointerDown);
    mount.addEventListener('pointermove', onPointerMove);
    mount.addEventListener('pointerup', onPointerUp);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      if (!isDragging) {
        group.rotation.y += autoRotateSpeed;
        group.rotation.x += autoRotateSpeed * 0.5;
      }

      coreMesh.rotation.y = -time * 1.5;
      coreMesh.rotation.z = time * 0.8;

      // Orbiting satellites
      satellites.forEach((sat, i) => {
        const angle = time * 1.2 + (i * Math.PI * 2) / satCount;
        const radius = 3.6 + Math.sin(time * 2 + i) * 0.4;
        sat.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle * 1.5) * 1.2,
          Math.sin(angle) * radius
        );
        sat.rotation.x = time * 2;
        sat.rotation.y = time * 3;
      });

      // Sparks simulation
      if (sparkLife > 0) {
        sparkLife -= 0.025;
        sparkMat.opacity = Math.max(0, sparkLife);
        for (let i = 0; i < sparkCount; i++) {
          sparkPositions[i * 3] += sparkVelocities[i * 3];
          sparkPositions[i * 3 + 1] += sparkVelocities[i * 3 + 1];
          sparkPositions[i * 3 + 2] += sparkVelocities[i * 3 + 2];
        }
        sparkGeo.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      mount.removeEventListener('pointerdown', onPointerDown);
      mount.removeEventListener('pointermove', onPointerMove);
      mount.removeEventListener('pointerup', onPointerUp);

      if (renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      crystalGeo.dispose();
      crystalMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
      renderer.dispose();
    };
  }, []);

  const handleClick = () => {
    setClickCount((c) => c + 1);
    setIsEnergized(true);
    clickCallbackRef.current?.();
    setTimeout(() => setIsEnergized(false), 500);
  };

  return (
    <div
      onClick={handleClick}
      className={`glass-card rounded-3xl p-6 border border-purple-500/40 hover:border-purple-400 bg-gradient-to-b from-[#120826]/80 to-[#070312]/90 backdrop-blur-xl relative overflow-hidden group cursor-grab active:cursor-grabbing shadow-2xl shadow-purple-950/50 ${className}`}
      title="Click to energize • Drag to rotate in 3D"
    >
      {/* Top Header Tag */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-purple-300 font-bold">
            Interactive 3D Quantum Prism
          </span>
        </div>
        <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
          <RotateCw className="w-3 h-3 text-purple-400 group-hover:rotate-180 transition-transform duration-500" />
          <span>Drag to Spin</span>
        </span>
      </div>

      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-56 relative z-10 flex items-center justify-center" />

      {/* Interactive Controls & Energy Sparks Meter */}
      <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs relative z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            isEnergized
              ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.8)] scale-105'
              : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-purple-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          <span>Tap to Energize</span>
        </button>

        <span className="text-[11px] font-mono text-zinc-400">
          Pulse Charges: <strong className="text-white">{clickCount}</strong>
        </span>
      </div>

      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-600/15 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/25 transition-all" />
    </div>
  );
}
