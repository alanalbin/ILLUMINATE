import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/context/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import ScrollProgressBar from '@/components/ui/ScrollProgressBar';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'ILLUMINATE | 6-Hour Entrepreneurship Workshop | KMCT Kasaragod & E-Cell IIT Bombay',
  description:
    'Experience entrepreneurship with ILLUMINATE, a 6-hour offline workshop organized at KMCT College of Engineering for Emerging Technologies and Management, Kasaragod as part of E-Cell, IIT Bombay initiative. Official Certificate from E-Cell IIT Bombay & Startup Kit provided.',
  keywords: [
    'ILLUMINATE',
    'E-Cell IIT Bombay',
    'KMCT College Kasaragod',
    'Entrepreneurship Workshop',
    'Startup Kit',
    'IIT Bombay Certificate',
    'Kerala Engineering Students',
    'NEC E-Cell',
  ],
  authors: [{ name: 'KMCT E-Cell & E-Cell IIT Bombay' }],
  metadataBase: new URL('https://illuminate-kmct-117e5.web.app'),
  openGraph: {
    title: 'ILLUMINATE Workshop | KMCT College Kasaragod & E-Cell IIT Bombay',
    description:
      'Intensive 6-hour offline entrepreneurship workshop. Hands-on learning, official IIT Bombay certificate, and physical startup kit.',
    url: 'https://illuminate-kmct-117e5.web.app',
    siteName: 'ILLUMINATE KMCT',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ILLUMINATE Workshop | KMCT Kasaragod & E-Cell IIT Bombay',
    description: '6-Hour Offline Entrepreneurship Masterclass with E-Cell IIT Bombay.',
  },
};

export const viewport: Viewport = {
  themeColor: '#05030a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark scroll-smooth ${spaceGrotesk.variable}`} data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </head>
      <body className={`min-h-screen min-h-[100dvh] flex flex-col bg-[#05030a] text-slate-100 ${spaceGrotesk.className} selection:bg-purple-600 selection:text-white antialiased relative`}>
        {/* Ambient Brand Logo Watermark Background (Low Opacity) */}
        <div 
          className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden" 
          aria-hidden="true"
        >
          <img
            src="/logo.png"
            alt=""
            className="w-[1050px] max-w-[95vw] h-auto object-contain opacity-[0.045] select-none filter blur-[0.4px] scale-110 sm:scale-125"
          />
        </div>
        <ScrollProgressBar />
        <AuthProvider>
          <Navbar />
          <main className="flex-1 relative z-10 flex flex-col">{children}</main>
          <Footer />
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
