import { postRouter } from "~/server/api/routers/post";
import { profileRouter } from "~/server/api/routers/profile";
import { quizRouter } from "~/server/api/routers/quiz";
import { eventRouter } from "~/server/api/routers/event";
import { rideRouter } from "~/server/api/routers/ride";
import { messageRouter } from "~/server/api/routers/message";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  profile: profileRouter,
  quiz: quizRouter,
  event: eventRouter,
  ride: rideRouter,
  message: messageRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
