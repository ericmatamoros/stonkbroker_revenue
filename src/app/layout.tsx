import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StonkStatistics: Your statistics for the Stonkbroker ecosystem',
  description:
    'Real-time statistics, Clock In pot accumulation, intern & stonkbroker payouts, and revenue projections for the StonkBrokers ecosystem on Robinhood Chain.',
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [{ url: '/logo.png' }],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'StonkStatistics',
  },
};

export const viewport: Viewport = {
  themeColor: '#0c0e12',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full antialiased bg-[#0c0e12]">
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0c0e12] text-[#e2e8f0] selection:bg-[#cfff04] selection:text-black">
        {children}
      </body>
    </html>
  );
}
