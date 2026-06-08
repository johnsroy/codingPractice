import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BRAND } from '@mentora/shared';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — ${BRAND.shortTagline}`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.tagline,
  metadataBase: new URL(process.env.WEB_URL ?? 'http://localhost:3000'),
  openGraph: {
    siteName: BRAND.name,
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {/* Skip to main content for keyboard / screen-reader users */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <Providers>
          <Navbar />
          <main id="main-content" className="min-h-[calc(100vh-72px)]">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
