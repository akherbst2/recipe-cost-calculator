import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { ownerProcedure, publicProcedure, router } from "./_core/trpc";
import { logEvent, getAnalyticsData } from "./events";

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
    getOverview: ownerProcedure.query(async () => {
      return await getAnalyticsData();
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
