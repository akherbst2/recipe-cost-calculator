import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { ownerProcedure, publicProcedure, router } from "./_core/trpc";
import { logEvent, getAnalyticsData } from "./events";
import { sharedRecipes } from "../drizzle/schema";
import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Analytics router (owner only)
  analytics: router({
    getOverview: ownerProcedure.query(async ({ ctx }) => {
      return await getAnalyticsData(ctx.user?.openId);
    }),
  }),

  // Sharing router
  sharing: router({
    create: publicProcedure
      .input(
        z.object({
          name: z.string(),
          ingredients: z.array(z.any()),
          servings: z.number(),
          batchMultiplier: z.number(),
          totalCost: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const shareId = nanoid(10); // Generate unique 10-character ID
        const userId = ctx.user?.id ?? null;
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.insert(sharedRecipes).values({
          shareId,
          name: input.name,
          ingredients: JSON.stringify(input.ingredients),
          servings: input.servings,
          batchMultiplier: input.batchMultiplier,
          totalCost: Math.round(input.totalCost * 100), // Store as cents
          userId,
        });
        
        return { shareId };
      }),
    
    get: publicProcedure
      .input(z.object({ shareId: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const recipe = await db.select().from(sharedRecipes).where(eq(sharedRecipes.shareId, input.shareId)).limit(1);
        
        if (recipe.length === 0) {
          throw new Error("Recipe not found");
        }
        
        const data = recipe[0];
        return {
          name: data.name,
          ingredients: JSON.parse(data.ingredients),
          servings: data.servings,
          batchMultiplier: data.batchMultiplier,
          totalCost: data.totalCost / 100, // Convert from cents
          createdAt: data.createdAt,
        };
      }),
  }),

  // Event logging router
  events: router({
    log: publicProcedure
      .input(
        z.object({
          eventType: z.string(),
          sessionId: z.string().optional(),
          eventData: z.record(z.string(), z.any()),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user?.id ?? null;
        const sessionId = input.sessionId ?? null;
        
        await logEvent({
          eventType: input.eventType,
          userId,
          sessionId,
          eventData: JSON.stringify(input.eventData),
        });
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
