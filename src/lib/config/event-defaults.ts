import { EventConfig } from '@/types';

export const DEFAULT_EVENT_CONFIG: EventConfig = {
  id: 'illuminate-kmct-2026',
  title: 'ILLUMINATE',
  tagline: 'Experience Entrepreneurship. Powered by E-Cell, IIT Bombay.',
  description:
    'An intensive 6-hour offline entrepreneurship workshop at KMCT College of Engineering for Emerging Technologies and Management, Kasaragod. An initiative of E-Cell, IIT Bombay designed to empower students with hands-on startup thinking, real-world case studies, and mentor-led interactive sessions.',
  durationHours: 6,
  hostInstitution: 'KMCT College of Engineering for Emerging Technologies and Management',
  locationCity: 'Kasaragod',
  locationState: 'Kerala',
  associatedInitiative: 'E-Cell, IIT Bombay (National Entrepreneurship Challenge / illuminate)',
  officialWebsite: 'https://www.ecell.in/illuminate/',

  // Schedule & Venue — Registration closes 20 October 2026; Event date announced soon
  date: null, // Announced soon
  startTime: null, // Announced soon
  endTime: null, // Announced soon
  venue: 'KMCT College of Engineering for Emerging Technologies and Management, Kasaragod, Kerala',
  roomNumber: 'Campus Auditorium / Seminar Hall (To be announced soon)',
  registrationClosingDate: '2026-10-20T23:59:59+05:30',

  // Pricing & Capacities
  registrationFee: 699, // Official NEC Discounted Fee: ₹699
  registrationFeePaise: 69900,
  officialDiscountFee: 699, // Official NEC Discount: ₹699
  discountDeadline: '30 September 2026',
  priceDiscrepancyAcknowledged: true, // Confirmed at official ₹699 rate
  livePaymentsEnabled: false, // Security condition: disabled until live credentials confirmed
  minimumTarget: 70, // 70 participants minimum target (not capacity cap)
  capacity: null, // Configurable separately

  // UPI & Payment Defaults
  upiId: 'rachit@ecell.in', // Official program contact UPI / admin configurable
  upiMerchantName: 'KMCT Illuminate Workshop',

  // Contacts
  officialContact: {
    name: 'Alan Albin',
    email: 'alan.albin@kmct.edu.in',
    phone: '8848563266',
    role: 'Registration Details & Contact Person',
  },
  localCoordinator: {
    name: 'Alan Albin',
    email: 'alan.albin@kmct.edu.in',
    phone: '8848563266',
    role: 'Registration Details & Local Coordinator',
  },

  // Speakers
  speakers: [
    {
      name: 'To be announced',
      role: 'Startup Founder & Venture Mentor',
      organization: 'E-Cell IIT Bombay Network',
      topic: 'Ideation to Validation: Building from Zero to One',
      confirmed: false,
    },
    {
      name: 'To be announced',
      role: 'Product & Growth Strategist',
      organization: 'Industry Expert',
      topic: 'Business Models & Go-To-Market Execution',
      confirmed: false,
    },
  ],

  // Benefits with accurate eligibility conditions
  benefits: [
    {
      id: 'cert',
      title: 'Official Certificate from E-Cell IIT Bombay',
      description: 'Prestigious credential issued by E-Cell IIT Bombay recognizing your active participation and completion of the 6-hour entrepreneurship program.',
      verified: true,
      condition: 'Subject to attending the full 6-hour offline workshop sessions.',
      iconName: 'Award',
    },
    {
      id: 'kit',
      title: 'Illuminate Startup Kit',
      description: 'Exclusive physical toolkit delivered for every participant packed with startup workbooks, ideation frameworks, and practical learning resources.',
      verified: true,
      condition: 'Provided to all registered and attending participants.',
      iconName: 'Package',
    },
    {
      id: 'curriculum',
      title: '6-Hour Immersive Entrepreneurship Masterclass',
      description: 'Hands-on curriculum covering problem validation, lean canvas development, rapid prototyping, and pitching methodologies.',
      verified: true,
      condition: 'Live interactive offline sessions on campus.',
      iconName: 'Sparkles',
    },
    {
      id: 'esummit',
      title: 'Exclusive E-Summit Passes & Accommodation Eligibility',
      description: 'Special access privileges and discounted passes for Asia’s largest entrepreneurship festival: E-Summit at the IIT Bombay campus.',
      verified: true,
      condition: 'Subject to E-Cell IIT Bombay selection criteria and E-Summit terms.',
      iconName: 'Compass',
    },
    {
      id: 'nec-recognition',
      title: 'National Entrepreneurship Challenge (NEC) Recognition',
      description: 'Special acknowledgment for top-performing student teams and a token of appreciation from E-Cell IIT Bombay for the Faculty Coordinator.',
      verified: true,
      condition: 'Applicable under NEC initiative criteria (first 30 registered colleges).',
      iconName: 'Trophy',
    },
  ],

  // Frequently Asked Questions
  faq: [
    {
      id: 'faq-1',
      question: 'What is ILLUMINATE?',
      answer:
        'ILLUMINATE is an offline entrepreneurship workshop organized in your college as part of E-Cell IIT Bombay’s national initiative. It brings interactive industry speakers and curated startup training directly to campus for 6 hours of hands-on learning.',
      category: 'general',
    },
    {
      id: 'faq-2',
      question: 'Where will the workshop be conducted?',
      answer:
        'The workshop will take place on campus at KMCT College of Engineering for Emerging Technologies and Management, Kasaragod, Kerala. The specific seminar hall/auditorium will be announced prior to the event date.',
      category: 'event',
    },
    {
      id: 'faq-3',
      question: 'What is the registration fee?',
      answer:
        'The registration fee is ₹699/- per participant in accordance with the official E-Cell IIT Bombay NEC discount guidelines (valid until 30 September 2026). Payments can be made securely via UPI or Razorpay Checkout once live payments are enabled.',
      category: 'payment',
    },
    {
      id: 'faq-4',
      question: 'What do I receive as a participant?',
      answer:
        'Participants who attend the full 6-hour workshop receive an official Certificate from E-Cell IIT Bombay, an Illuminate Startup Kit, hands-on learning materials, and eligibility for exclusive discounts on E-Summit passes and campus accommodation at IIT Bombay.',
      category: 'general',
    },
    {
      id: 'faq-5',
      question: 'When is the exact date of the workshop?',
      answer:
        'Registration officially closes on 20th October 2026. The exact date of the 6-hour offline workshop will be announced soon in coordination between KMCT College faculty coordinators and the E-Cell IIT Bombay team.',
      category: 'event',
    },
    {
      id: 'faq-6',
      question: 'Can students from all departments and years register?',
      answer:
        'Yes! Entrepreneurship is multidisciplinary. Students from B.Tech, M.Tech, Management, MCA, and all academic years are encouraged to participate.',
      category: 'registration',
    },
    {
      id: 'faq-7',
      question: 'What is the cancellation or refund policy?',
      answer:
        'Cancellations and refunds are handled in accordance with E-Cell IIT Bombay and KMCT institutional guidelines. If the workshop is rescheduled, your registration will be transferred automatically.',
      category: 'payment',
    },
  ],

  published: true,
  updatedAt: new Date().toISOString(),
};
