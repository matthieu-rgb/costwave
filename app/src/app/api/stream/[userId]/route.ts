import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { event } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { NextRequest } from 'next/server';

interface RouteContext {
  params: Promise<{ userId: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { userId } = await context.params;

  // Verify session and user authorization
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user?.id || session.user.id !== userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial events (last 50)
      const recentEvents = await db.query.event.findMany({
        where: eq(event.userId, userId),
        orderBy: desc(event.startedAt),
        limit: 50,
      });

      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            type: 'init',
            events: recentEvents,
          })}\n\n`
        )
      );

      // Poll for new events every 2 seconds
      // Production: use WebSocket or PostgreSQL LISTEN/NOTIFY
      let lastEventId = recentEvents[0]?.id || null;

      const interval = setInterval(async () => {
        try {
          // Fetch events newer than last seen
          const query = lastEventId
            ? await db.query.event.findMany({
                where: eq(event.userId, userId),
                orderBy: desc(event.createdAt),
                limit: 10,
              })
            : [];

          const newEvents = query.filter((e) => {
            if (!lastEventId) return true;
            return e.createdAt > new Date(lastEventId);
          });

          if (newEvents.length > 0) {
            for (const evt of newEvents) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'event',
                    data: evt,
                  })}\n\n`
                )
              );
            }
            lastEventId = newEvents[0].id;
          }

          // Send heartbeat to keep connection alive
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch (error) {
          // SECURITY: Log only message, not full error object to avoid stack trace leaks
          const err = error as Error;
          if (process.env.NODE_ENV === 'development') {
            console.error('[SSE] Error fetching events:', err);
          } else {
            console.error('[SSE] Error fetching events:', err.message);
          }
        }
      }, 2000);

      // Cleanup on disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
