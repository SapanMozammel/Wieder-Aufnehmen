import {
  availableSystemStatusFixture,
  degradedSystemStatusFixture,
  timeoutErrorFixture,
} from '@aufnehmen/testing';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SystemStatusPanel } from '../SystemStatusPanel';
import { SystemStatusClientError } from '@/lib/api/system-status-client';

const retry = () => undefined;

describe('system status panel', () => {
  it('announces its loading state', () => {
    const html = renderToStaticMarkup(
      <SystemStatusPanel state={{ kind: 'loading' }} onRetry={retry} />,
    );

    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('role="status"');
    expect(html).toContain('Checking services');
  });

  it('renders the available contract state', () => {
    const html = renderToStaticMarkup(
      <SystemStatusPanel
        state={{ kind: 'success', status: availableSystemStatusFixture }}
        onRetry={retry}
      />,
    );

    expect(html).toContain('Services available');
    expect(html).toContain('The public API and database are available.');
    expect(html).toContain(availableSystemStatusFixture.requestId);
    expect(html).toContain('Refresh status');
  });

  it('renders degraded as data with a recovery action', () => {
    const html = renderToStaticMarkup(
      <SystemStatusPanel
        state={{ kind: 'success', status: degradedSystemStatusFixture }}
        onRetry={retry}
      />,
    );

    expect(html).toContain('Service degraded');
    expect(html).toContain('database is currently unavailable');
    expect(html).toContain('Retry status check');
    expect(html).toContain('role="status"');
  });

  it('renders a safe unavailable state and correlation ID', () => {
    const error = new SystemStatusClientError(
      'http',
      504,
      timeoutErrorFixture.error.code,
      timeoutErrorFixture.error.requestId,
    );
    const html = renderToStaticMarkup(
      <SystemStatusPanel state={{ kind: 'error', error }} onRetry={retry} />,
    );

    expect(html).toContain('role="alert"');
    expect(html).toContain('Status unavailable');
    expect(html).toContain('The status service could not complete the check.');
    expect(html).toContain(timeoutErrorFixture.error.requestId);
    expect(html).toContain('Retry status check');
  });
});
