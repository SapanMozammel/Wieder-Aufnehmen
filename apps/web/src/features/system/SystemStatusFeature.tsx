'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SystemStatusPanel, type SystemStatusScreenState } from './SystemStatusPanel';
import { publicWebConfig } from '@/lib/api/browser-config';
import { getSystemStatus, SystemStatusClientError } from '@/lib/api/system-status-client';

export function SystemStatusFeature() {
  const activeRequest = useRef<AbortController | null>(null);
  const [state, setState] = useState<SystemStatusScreenState>({ kind: 'loading' });

  const loadStatus = useCallback(async () => {
    activeRequest.current?.abort();
    const request = new AbortController();
    activeRequest.current = request;
    setState({ kind: 'loading' });

    try {
      const status = await getSystemStatus({
        apiBaseUrl: publicWebConfig.apiBaseUrl,
        signal: request.signal,
      });
      if (activeRequest.current === request) {
        setState({ kind: 'success', status });
      }
    } catch (error: unknown) {
      if (activeRequest.current !== request || request.signal.aborted) return;
      setState({
        kind: 'error',
        error:
          error instanceof SystemStatusClientError ? error : new SystemStatusClientError('network'),
      });
    }
  }, []);

  useEffect(() => {
    void loadStatus();
    return () => {
      activeRequest.current?.abort();
    };
  }, [loadStatus]);

  return <SystemStatusPanel state={state} onRetry={() => void loadStatus()} />;
}
