'use client';

import React, { useState } from 'react';
import BackgroundCanvas3D from '@/components/background-3d/BackgroundCanvas3D';
import BeamIntroLoading from '@/components/intro/BeamIntroLoading';

export default function HomeExperienceManager() {
  const [playIntro, setPlayIntro] = useState(false);
  const [introKey, setIntroKey] = useState(0);

  const handleReplayIntro = () => {
    setIntroKey((prev) => prev + 1);
    setPlayIntro(true);
  };

  return (
    <>
      {/* 3D Beam Intro Loading Screen (plays at initial site opening or on replay request) */}
      <BeamIntroLoading
        key={introKey}
        forcePlay={playIntro}
        onComplete={() => setPlayIntro(false)}
      />

      {/* 3 Layered Background Animations with Interactive Dock & Mouse Physics */}
      <BackgroundCanvas3D onReplayIntro={handleReplayIntro} />
    </>
  );
}
