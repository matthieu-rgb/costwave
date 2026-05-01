import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isPro, getActiveSubscription, canAddProvider, canAddBudget } from './feature-gate';
import { db } from '@/lib/db';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      subscription: {
        findFirst: vi.fn(),
      },
    },
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
  },
}));

describe('Feature Gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isPro', () => {
    it('should return true for active Pro subscription', async () => {
      vi.mocked(db.query.subscription.findFirst).mockResolvedValue({
        id: 'sub-1',
        userId: 'user-1',
        plan: 'pro',
        status: 'active',
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_123',
        currentPeriodEnd: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await isPro('user-1');
      expect(result).toBe(true);
    });

    it('should return false for active Free subscription', async () => {
      vi.mocked(db.query.subscription.findFirst).mockResolvedValue({
        id: 'sub-1',
        userId: 'user-1',
        plan: 'free',
        status: 'active',
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        currentPeriodEnd: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await isPro('user-1');
      expect(result).toBe(false);
    });

    it('should return false for canceled Pro subscription', async () => {
      vi.mocked(db.query.subscription.findFirst).mockResolvedValue({
        id: 'sub-1',
        userId: 'user-1',
        plan: 'pro',
        status: 'canceled',
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_123',
        currentPeriodEnd: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await isPro('user-1');
      expect(result).toBe(false);
    });

    it('should return false for past_due Pro subscription', async () => {
      vi.mocked(db.query.subscription.findFirst).mockResolvedValue({
        id: 'sub-1',
        userId: 'user-1',
        plan: 'pro',
        status: 'past_due',
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_123',
        currentPeriodEnd: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await isPro('user-1');
      expect(result).toBe(false);
    });

    it('should return false when no subscription exists', async () => {
      vi.mocked(db.query.subscription.findFirst).mockResolvedValue(null);

      const result = await isPro('user-1');
      expect(result).toBe(false);
    });
  });

  describe('getActiveSubscription', () => {
    it('should return Pro subscription info for active Pro user', async () => {
      const currentPeriodEnd = new Date('2027-01-01');
      vi.mocked(db.query.subscription.findFirst).mockResolvedValue({
        id: 'sub-1',
        userId: 'user-1',
        plan: 'pro',
        status: 'active',
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_123',
        currentPeriodEnd,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await getActiveSubscription('user-1');
      expect(result).toEqual({
        plan: 'pro',
        status: 'active',
        currentPeriodEnd,
        isPro: true,
      });
    });

    it('should return Free plan info when no subscription exists', async () => {
      vi.mocked(db.query.subscription.findFirst).mockResolvedValue(null);

      const result = await getActiveSubscription('user-1');
      expect(result).toEqual({
        plan: 'free',
        status: 'none',
        currentPeriodEnd: null,
        isPro: false,
      });
    });

    it('should return isPro false for inactive subscription', async () => {
      const currentPeriodEnd = new Date('2027-01-01');
      vi.mocked(db.query.subscription.findFirst).mockResolvedValue({
        id: 'sub-1',
        userId: 'user-1',
        plan: 'pro',
        status: 'canceled',
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_123',
        currentPeriodEnd,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await getActiveSubscription('user-1');
      expect(result).toEqual({
        plan: 'pro',
        status: 'canceled',
        currentPeriodEnd,
        isPro: false,
      });
    });
  });

  describe('canAddProvider', () => {
    it('should allow adding provider when under Free plan limit', async () => {
      // Mock isPro to return false (Free plan)
      vi.mocked(db.query.subscription.findFirst).mockResolvedValue(null);

      // Mock provider count query
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 0 }]),
        }),
      } as any);

      const result = await canAddProvider('user-1');
      expect(result).toEqual({
        allowed: true,
        currentCount: 0,
        maxAllowed: 1,
      });
    });

    it('should deny adding provider when at Free plan limit', async () => {
      // Mock isPro to return false (Free plan)
      vi.mocked(db.query.subscription.findFirst).mockResolvedValue(null);

      // Mock provider count at limit
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 1 }]),
        }),
      } as any);

      const result = await canAddProvider('user-1');
      expect(result).toEqual({
        allowed: false,
        currentCount: 1,
        maxAllowed: 1,
      });
    });

    it('should always allow adding provider for Pro users', async () => {
      // Mock isPro to return true (Pro plan)
      vi.mocked(db.query.subscription.findFirst).mockResolvedValue({
        id: 'sub-1',
        userId: 'user-1',
        plan: 'pro',
        status: 'active',
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_123',
        currentPeriodEnd: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock high provider count
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 100 }]),
        }),
      } as any);

      const result = await canAddProvider('user-1');
      expect(result.allowed).toBe(true);
      expect(result.maxAllowed).toBe(Infinity);
    });
  });

  describe('canAddBudget', () => {
    it('should allow adding budget when under Free plan limit', async () => {
      // Mock isPro to return false (Free plan)
      vi.mocked(db.query.subscription.findFirst).mockResolvedValue(null);

      // Mock budget count query
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 0 }]),
        }),
      } as any);

      const result = await canAddBudget('user-1');
      expect(result).toEqual({
        allowed: true,
        currentCount: 0,
        maxAllowed: 1,
      });
    });

    it('should deny adding budget when at Free plan limit', async () => {
      // Mock isPro to return false (Free plan)
      vi.mocked(db.query.subscription.findFirst).mockResolvedValue(null);

      // Mock budget count at limit
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 1 }]),
        }),
      } as any);

      const result = await canAddBudget('user-1');
      expect(result).toEqual({
        allowed: false,
        currentCount: 1,
        maxAllowed: 1,
      });
    });
  });
});
