import type { Metadata } from 'next';
import { SystemStatusFeature } from '@/features/system/SystemStatusFeature';

export const metadata: Metadata = {
  title: 'System status',
  description: 'Live availability of the public API and its database dependency.',
};

export default function SystemStatusPage() {
  return (
    <main id="main-content" className="page-shell status-page">
      <header className="page-heading">
        <p className="eyebrow">Environment check</p>
        <h1>Aufnehmen system status</h1>
        <p>
          The browser reads a validated response from the Express API. Only service availability is
          exposed.
        </p>
      </header>
      <SystemStatusFeature />
      <p className="status-note">
        This page reports infrastructure availability. It does not verify application readiness for
        production.
      </p>
    </main>
  );
}
