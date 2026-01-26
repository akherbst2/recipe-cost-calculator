import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

function createAnonymousContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: 'https',
      headers: {},
    } as any,
    res: {} as any,
  };
}

describe('Sharing Feature', () => {
  const ctx = createAnonymousContext();
  const caller = appRouter.createCaller(ctx);

  it('should create a shared recipe', async () => {
    const result = await caller.sharing.create({
      name: 'Test Recipe',
      ingredients: [
        {
          id: '1',
          name: 'Butter',
          usedQuantity: 2,
          usedUnit: 'tbsp',
          packageCost: 3.99,
          packageSize: 16,
          packageUnit: 'tbsp',
          calculatedCost: 0.50,
        },
      ],
      servings: 4,
      batchMultiplier: 1,
      totalCost: 0.50,
    });

    expect(result).toHaveProperty('shareId');
    expect(result.shareId).toHaveLength(10); // nanoid(10) generates 10-character IDs
  });

  it('should retrieve a shared recipe', async () => {
    // First create a recipe
    const created = await caller.sharing.create({
      name: 'Retrieve Test Recipe',
      ingredients: [
        {
          id: '1',
          name: 'Flour',
          usedQuantity: 2,
          usedUnit: 'cup',
          packageCost: 4.49,
          packageSize: 10,
          packageUnit: 'cup',
          calculatedCost: 0.90,
        },
      ],
      servings: 4,
      batchMultiplier: 1,
      totalCost: 0.90,
    });

    // Then retrieve it
    const retrieved = await caller.sharing.get({ shareId: created.shareId });

    expect(retrieved.name).toBe('Retrieve Test Recipe');
    expect(retrieved.ingredients).toHaveLength(1);
    expect(retrieved.ingredients[0].name).toBe('Flour');
    expect(retrieved.servings).toBe(4);
    expect(retrieved.batchMultiplier).toBe(1);
  });

  it('should throw error for invalid shareId', async () => {
    await expect(
      caller.sharing.get({ shareId: 'invalid-share-id' })
    ).rejects.toThrow();
  });

  it('should create unique shareIds for different recipes', async () => {
    const recipe1 = await caller.sharing.create({
      name: 'Recipe 1',
      ingredients: [],
      servings: 4,
      batchMultiplier: 1,
      totalCost: 0,
    });

    const recipe2 = await caller.sharing.create({
      name: 'Recipe 2',
      ingredients: [],
      servings: 4,
      batchMultiplier: 1,
      totalCost: 0,
    });

    expect(recipe1.shareId).not.toBe(recipe2.shareId);
  });

  it('should store all ingredient details correctly', async () => {
    const created = await caller.sharing.create({
      name: 'Detailed Recipe',
      ingredients: [
        {
          id: '1',
          name: 'Eggs',
          usedQuantity: 2,
          usedUnit: 'unit',
          packageCost: 5.99,
          packageSize: 12,
          packageUnit: 'unit',
          calculatedCost: 1.00,
        },
        {
          id: '2',
          name: 'Milk',
          usedQuantity: 1,
          usedUnit: 'cup',
          packageCost: 3.49,
          packageSize: 4,
          packageUnit: 'cup',
          calculatedCost: 0.87,
        },
      ],
      servings: 6,
      batchMultiplier: 2,
      totalCost: 1.87,
    });

    const retrieved = await caller.sharing.get({ shareId: created.shareId });

    expect(retrieved.ingredients).toHaveLength(2);
    expect(retrieved.ingredients[0].name).toBe('Eggs');
    expect(retrieved.ingredients[0].usedQuantity).toBe(2);
    expect(retrieved.ingredients[0].calculatedCost).toBe(1.00);
    expect(retrieved.ingredients[1].name).toBe('Milk');
    expect(retrieved.servings).toBe(6);
    expect(retrieved.batchMultiplier).toBe(2);
  });
});
