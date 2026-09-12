import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Aufnehmen — MENN foundation', template: '%s · Aufnehmen' },
  description:
    'A reusable MongoDB, Express, Next.js and Node.js foundation with a shared AI workflow.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f6f8' },
    { media: '(prefers-color-scheme: dark)', color: '#11151d' },
  ],
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <header className="site-header">
          <Link className="wordmark" href="/">
            Aufnehmen
            <span className="wordmark-dot" aria-hidden="true">
              .
            </span>
          </Link>
          <nav aria-label="Main navigation">
            <Link href="/system-status">System status</Link>
            <a href="https://github.com/SapanMozammel/Aufnehmen">Repository</a>
          </nav>
        </header>
        {children}
        <footer className="site-footer">MongoDB · Express · Next.js · Node.js</footer>
      </body>
    </html>
  );
}
