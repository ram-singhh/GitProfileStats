import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'GitProfileStats | Beautiful GitHub Analytics & Profile Cards',
    template: '%s | GitProfileStats',
  },
  description:
    'Showcase your GitHub journey in style. Generate stunning, real-time SVG cards, dynamic contribution stats, and interactive analytics for your GitHub profile README.',
  keywords: [
    'GitHub Profile Stats',
    'GitHub Readme Cards',
    'GitHub Analytics',
    'Dynamic SVG Cards',
    'GitHub Streaks',
    'Developer Portfolio',
  ],
  authors: [{ name: 'GitProfileStats Team' }],
  creator: 'GitProfileStats',
  publisher: 'GitProfileStats',
  metadataBase: new URL('https://gitprofilestats.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'GitProfileStats | Beautiful GitHub Analytics & Profile Cards',
    description:
      'Showcase your GitHub journey in style. Generate stunning, real-time SVG cards and interactive dashboards for your GitHub profile README.',
    url: 'https://gitprofilestats.com',
    siteName: 'GitProfileStats',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GitProfileStats - Beautiful GitHub Analytics & Profile Cards',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitProfileStats | Beautiful GitHub Analytics & Profile Cards',
    description:
      'Showcase your GitHub journey in style. Generate stunning, real-time SVG cards and interactive dashboards for your GitHub profile README.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
