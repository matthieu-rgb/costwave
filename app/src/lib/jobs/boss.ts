import PgBoss from 'pg-boss';

let boss: PgBoss | null = null;

export async function ensureBossReady(): Promise<PgBoss> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required for pg-boss');
  }

  if (!boss) {
    boss = new PgBoss({
      connectionString: process.env.DATABASE_URL,
      retryLimit: 3,
      retryDelay: 1000,
      expireInHours: 24,
      retentionHours: 48,
      deleteAfterHours: 72,
    });

    boss.on('error', (error: Error) => {
      console.error('[pg-boss] Error:', error.message);
    });

    await boss.start();
    console.log('[pg-boss] Started successfully');
  }

  return boss;
}

export function getBoss(): PgBoss | null {
  return boss;
}
