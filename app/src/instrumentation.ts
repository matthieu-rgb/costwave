export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only initialize pg-boss in Node.js runtime (not Edge)
    try {
      const { ensureBossReady } = await import('./lib/jobs/boss');
      const { registerCheckBudgetsJob } = await import('./lib/jobs/check-budgets');

      const boss = await ensureBossReady();

      // Register job handlers
      await registerCheckBudgetsJob(boss);

      console.log('[instrumentation] pg-boss worker registered successfully');
    } catch (error) {
      // Log but don't crash - allows dev mode without DB
      console.error('[instrumentation] Failed to initialize pg-boss:', (error as Error).message);
      if (process.env.NODE_ENV === 'development') {
        console.log('[instrumentation] Continuing without background jobs (dev mode)');
      }
    }
  }
}
