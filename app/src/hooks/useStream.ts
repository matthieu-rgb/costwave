'use client';

import { useEffect, useState } from 'react';

interface Event {
  id: string;
  userId: string;
  workflowId: string | null;
  runId: string | null;
  parentRunId: string | null;
  type: string;
  status: string;
  startedAt: Date;
  durationMs: number | null;
  tokensIn: number | null;
  tokensOut: number | null;
  costUsd: string | null;
  langfuseTraceId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

interface UseStreamReturn {
  events: Event[];
  connected: boolean;
  error: string | null;
}

/**
 * React hook for consuming Server-Sent Events (SSE) stream.
 *
 * Connects to /api/stream/[userId] and maintains a real-time event feed.
 * Auto-reconnects on connection loss.
 *
 * @param userId - User ID to stream events for
 * @returns { events, connected, error }
 */
export function useStream(userId?: string): UseStreamReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      try {
        eventSource = new EventSource(`/api/stream/${userId}`);

        eventSource.onopen = () => {
          setConnected(true);
          setError(null);
        };

        eventSource.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data);

            if (msg.type === 'init') {
              // Initial batch of events
              setEvents(msg.events);
            } else if (msg.type === 'event') {
              // New event, prepend to list
              setEvents((prev) => [msg.data, ...prev].slice(0, 100));
            }
          } catch (err) {
            console.error('[useStream] Failed to parse message:', err);
          }
        };

        eventSource.onerror = () => {
          setConnected(false);
          setError('Connection lost, reconnecting...');

          // Attempt reconnect after 5 seconds
          reconnectTimeout = setTimeout(() => {
            eventSource?.close();
            connect();
          }, 5000);
        };
      } catch (err) {
        console.error('[useStream] Failed to connect:', err);
        setError('Failed to establish connection');
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [userId]);

  return { events, connected, error };
}
