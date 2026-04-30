import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Ping database
    await db.execute(sql`SELECT 1`);
    const dbStatus = 'connected';

    // Ping Langfuse
    const langfuseHost = process.env.LANGFUSE_HOST || 'http://localhost:3000';
    let langfuseStatus = 'unknown';

    try {
      const response = await fetch(`${langfuseHost}/api/public/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      langfuseStatus = response.ok ? 'connected' : 'error';
    } catch {
      langfuseStatus = 'unreachable';
    }

    return NextResponse.json({
      status: 'ok',
      db: dbStatus,
      langfuse: langfuseStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        db: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
