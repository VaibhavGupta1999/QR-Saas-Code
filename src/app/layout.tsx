import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { BrewStudioProvider } from '@/context/BrewStudioContext';
import { DemoSwitcherBar } from '@/components/Navigation/DemoSwitcherBar';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-editorial',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#140F0D',
};

export const metadata: Metadata = {
  title: 'Brew Studio India | Specialty Coffee Lab & Artisanal Bakehouse',
  description:
    'Experience quiet luxury coffee craft at Brew Studio India (@brewstudioindia). Scan table QR code to explore single-origin pour-overs, cold brew alchemy, and live kitchen ticket tracking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F9F6F0] text-[#18120F] selection:bg-[#B86B35]/20 selection:text-[#18120F]">
        <BrewStudioProvider>
          <DemoSwitcherBar />
          <div className="pt-12 flex-1 flex flex-col">
            {children}
          </div>
        </BrewStudioProvider>
      </body>
    </html>
  );
}
