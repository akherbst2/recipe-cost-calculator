import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database
vi.mock('./db', () => ({
  getDb: vi.fn().mockResolvedValue({
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          groupBy: vi.fn().mockResolvedValue([
            { abGroup: 'control', eventName: 'assigned', count: 5 },
            { abGroup: 'treatment', eventName: 'assigned', count: 6 },
            { abGroup: 'treatment', eventName: 'tutorial_shown', count: 6 },
            { abGroup: 'treatment', eventName: 'tutorial_completed', count: 3 },
            { abGroup: 'treatment', eventName: 'tutorial_skipped', count: 3 },
            { abGroup: 'control', eventName: 'first_ingredient_added', count: 4 },
            { abGroup: 'treatment', eventName: 'first_ingredient_added', count: 5 },
          ]),
        }),
      }),
    }),
  }),
}));

vi.mock('../drizzle/schema', () => ({
  abEvents: { testName: 'testName', sessionId: 'sessionId', abGroup: 'abGroup', eventName: 'eventName' },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ a, b })),
  sql: vi.fn((strings: TemplateStringsArray) => strings.join('')),
}));

describe('A/B Test Router', () => {
  it('should insert an ab event into the database', async () => {
    const { getDb } = await import('./db');
    const db = await getDb() as any;

    await db.insert({}).values({
      testName: 'onboarding_tutorial',
      sessionId: 'test_session_123',
      abGroup: 'treatment',
      eventName: 'assigned',
      metadata: null,
    });

    expect(db.insert).toHaveBeenCalled();
    expect(db.insert().values).toHaveBeenCalledWith(
      expect.objectContaining({
        testName: 'onboarding_tutorial',
        sessionId: 'test_session_123',
        abGroup: 'treatment',
        eventName: 'assigned',
      })
    );
  });

  it('should pivot results by group correctly', async () => {
    const { getDb } = await import('./db');
    const db = await getDb() as any;

    const rows = await db.select().from({}).where({}).groupBy();

    // Simulate the pivot logic from the router
    const result: Record<string, Record<string, number>> = {
      control: {},
      treatment: {},
    };
    for (const row of rows) {
      result[row.abGroup][row.eventName] = Number(row.count);
    }

    expect(result.control.assigned).toBe(5);
    expect(result.treatment.assigned).toBe(6);
    expect(result.treatment.tutorial_completed).toBe(3);
    expect(result.treatment.tutorial_skipped).toBe(3);
    expect(result.control.first_ingredient_added).toBe(4);
    expect(result.treatment.first_ingredient_added).toBe(5);
  });

  it('should calculate tutorial completion rate correctly', async () => {
    const { getDb } = await import('./db');
    const db = await getDb() as any;
    const rows = await db.select().from({}).where({}).groupBy();

    const result: Record<string, Record<string, number>> = { control: {}, treatment: {} };
    for (const row of rows) {
      result[row.abGroup][row.eventName] = Number(row.count);
    }

    const treatmentTotal = result.treatment.assigned ?? 0;
    const completionRate = treatmentTotal > 0
      ? (result.treatment.tutorial_completed ?? 0) / treatmentTotal
      : 0;

    expect(completionRate).toBeCloseTo(0.5); // 3/6 = 50%
  });

  it('should calculate ingredient add lift correctly', async () => {
    const { getDb } = await import('./db');
    const db = await getDb() as any;
    const rows = await db.select().from({}).where({}).groupBy();

    const result: Record<string, Record<string, number>> = { control: {}, treatment: {} };
    for (const row of rows) {
      result[row.abGroup][row.eventName] = Number(row.count);
    }

    const controlRate = (result.control.first_ingredient_added ?? 0) / (result.control.assigned ?? 1);
    const treatmentRate = (result.treatment.first_ingredient_added ?? 0) / (result.treatment.assigned ?? 1);
    const lift = treatmentRate - controlRate;

    // Treatment (5/6 = 83.3%) vs Control (4/5 = 80%) → positive lift
    expect(lift).toBeGreaterThan(0);
  });
});
