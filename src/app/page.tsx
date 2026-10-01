import React from 'react';
import { DataStore } from '@/lib/storage/data-store';
import { DEFAULT_EVENT_CONFIG } from '@/lib/config/event-defaults';
import HeroSection from '@/components/home/HeroSection';
import BackgroundCanvas3D from '@/components/background-3d/BackgroundCanvas3D';
import AboutSection from '@/components/home/AboutSection';
import WorkshopStructureSection from '@/components/home/WorkshopStructureSection';
import BenefitsSection from '@/components/home/BenefitsSection';
import EventDetailsSection from '@/components/home/EventDetailsSection';
import FaqSection from '@/components/home/FaqSection';
import CtaBanner from '@/components/home/CtaBanner';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let event = DEFAULT_EVENT_CONFIG;
  try {
    event = await DataStore.getEventConfig();
  } catch (err) {
    console.warn('Failed to load event config, falling back to defaults:', err);
  }

  return (
    <div className="flex flex-col min-h-screen relative bg-[#05030a]">
      {/* Professional 3D Ambient Background Animation */}
      <BackgroundCanvas3D />

      {/* Hero Section with intentional balance and Alan Albin contact details */}
      <HeroSection event={event} />

      {/* Workshop Narrative & Mission */}
      <AboutSection />

      {/* Six-Hour Detailed Curriculum Breakdown */}
      <WorkshopStructureSection />

      {/* Verified Participant Takeaways & Benefits */}
      <BenefitsSection benefits={event.benefits} />

      {/* Schedule, Pricing Transparency & Venue Logistics */}
      <EventDetailsSection event={event} />

      {/* Detailed FAQs addressing Student & Faculty inquiries */}
      <FaqSection faq={event.faq} />

      {/* Final Action Banner */}
      <CtaBanner fee={event.registrationFee} />
    </div>
  );
}
