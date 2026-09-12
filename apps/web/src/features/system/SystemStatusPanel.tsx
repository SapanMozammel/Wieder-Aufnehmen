import type { SystemStatusResponse } from '@aufnehmen/contracts';
import type { SystemStatusClientError } from '@/lib/api/system-status-client';

export type SystemStatusScreenState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'success'; readonly status: SystemStatusResponse }
  | { readonly kind: 'error'; readonly error: SystemStatusClientError };

interface SystemStatusPanelProps {
  readonly state: SystemStatusScreenState;
  readonly onRetry: () => void;
}

export function SystemStatusPanel({ state, onRetry }: SystemStatusPanelProps) {
  if (state.kind === 'loading') {
    return (
      <section className="status-card" aria-labelledby="status-heading" aria-busy="true">
        <h2 id="status-heading">Checking services</h2>
        <p role="status" aria-live="polite">
          Contacting the public status endpoint…
        </p>
      </section>
    );
  }

  if (state.kind === 'error') {
    return (
      <section className="status-card status-error" aria-labelledby="status-heading">
        <div role="alert">
          <h2 id="status-heading">Status unavailable</h2>
          <p>{state.error.message}</p>
          {state.error.requestId ? (
            <p>
              Request ID: <code>{state.error.requestId}</code>
            </p>
          ) : null}
        </div>
        <button type="button" className="button" onClick={onRetry}>
          Retry status check
        </button>
      </section>
    );
  }

  const { status } = state;
  const available = status.state === 'available';
  return (
    <section
      className={`status-card ${available ? 'status-available' : 'status-degraded'}`}
      aria-labelledby="status-heading"
    >
      <div role="status" aria-live="polite">
        <p className="eyebrow status-label">{available ? 'Available' : 'Degraded'}</p>
        <h2 id="status-heading">{available ? 'Services available' : 'Service degraded'}</h2>
        <p>
          {available
            ? 'The public API and database are available.'
            : 'The public API is responding, but the database is currently unavailable.'}
        </p>
      </div>
      <dl className="status-details">
        <div>
          <dt>Contract</dt>
          <dd>{status.contractVersion}</dd>
        </div>
        <div>
          <dt>Database</dt>
          <dd>{status.database}</dd>
        </div>
        <div>
          <dt>Checked</dt>
          <dd>
            <time dateTime={status.timestamp}>{new Date(status.timestamp).toLocaleString()}</time>
          </dd>
        </div>
        <div>
          <dt>Request ID</dt>
          <dd>
            <code>{status.requestId}</code>
          </dd>
        </div>
      </dl>
      <button type="button" className="button" onClick={onRetry}>
        {available ? 'Refresh status' : 'Retry status check'}
      </button>
    </section>
  );
}
