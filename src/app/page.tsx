import React from 'react';
import { DataStore } from '@/lib/storage/data-store';
import ScrollExperience from '@/components/phone-3d/ScrollExperience';
import AboutSection from '@/components/home/AboutSection';
import WorkshopStructureSection from '@/components/home/WorkshopStructureSection';
import BenefitsSection from '@/components/home/BenefitsSection';
import EventDetailsSection from '@/components/home/EventDetailsSection';
import FaqSection from '@/components/home/FaqSection';
import CtaBanner from '@/components/home/CtaBanner';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const event = await DataStore.getEventConfig();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Signature 3D Apple-Inspired Phone Scroll Experience */}
      <ScrollExperience />

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
