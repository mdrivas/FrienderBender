import { z } from "zod";
import { eq, ne, desc, and } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { quizResponses, profiles, users } from "~/server/db/schema";
import {
  calculateCompatibility,
  getSharedInterests,
  getVibeMatch,
} from "~/lib/compatibility";

export const quizRouter = createTRPCRouter({
  // Submit quiz response
  submit: protectedProcedure
    .input(
      z.object({
        interests: z.array(z.string()),
        socialStyle: z.string(),
        friendshipValues: z.array(z.string()),
        communicationStyle: z.string(),
        hangoutVibe: z.array(z.string()),
        availability: z.object({
          preset: z.string(),
          customDays: z.array(z.string()),
          customTimes: z.array(z.string()),
        }),
        dealbreakers: z.array(z.string()),
        bio: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Insert quiz response
      await ctx.db.insert(quizResponses).values({
        userId: ctx.session.user.id,
        interests: input.interests,
        socialStyle: input.socialStyle,
        friendshipValues: input.friendshipValues,
        communicationStyle: input.communicationStyle,
        hangoutVibe: input.hangoutVibe,
        availability: input.availability,
        dealbreakers: input.dealbreakers,
        bio: input.bio,
      });

      // Mark profile as quiz completed
      await ctx.db
        .update(profiles)
        .set({ quizCompleted: true })
        .where(eq(profiles.id, ctx.session.user.id));

      return { success: true };
    }),

  // Get my latest quiz response
  getMyQuiz: protectedProcedure.query(async ({ ctx }) => {
    const quiz = await ctx.db.query.quizResponses.findFirst({
      where: eq(quizResponses.userId, ctx.session.user.id),
      orderBy: [desc(quizResponses.createdAt)],
    });
    return quiz;
  }),

  // Delete quiz to redo it
  deleteQuiz: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    console.log("[deleteQuiz] Deleting quiz for user:", userId);

    // Delete all quiz responses for this user
    const deleteResult = await ctx.db
      .delete(quizResponses)
      .where(eq(quizResponses.userId, userId))
      .returning();

    console.log("[deleteQuiz] Deleted records:", deleteResult.length);

    // Mark profile as quiz not completed
    await ctx.db
      .update(profiles)
      .set({ quizCompleted: false })
      .where(eq(profiles.id, userId));

    console.log("[deleteQuiz] Updated profile quizCompleted to false");

    return { success: true, deletedCount: deleteResult.length };
  }),

  // Get matches based on quiz compatibility
  getMatches: protectedProcedure.query(async ({ ctx }) => {
    // Get current user's quiz
    const myQuiz = await ctx.db.query.quizResponses.findFirst({
      where: eq(quizResponses.userId, ctx.session.user.id),
      orderBy: [desc(quizResponses.createdAt)],
    });

    if (!myQuiz) {
      return [];
    }

    // Get all other users' quizzes
    const otherQuizzes = await ctx.db.query.quizResponses.findMany({
      where: ne(quizResponses.userId, ctx.session.user.id),
    });

    // Get unique users (latest quiz per user)
    const userQuizMap = new Map<string, typeof otherQuizzes[0]>();
    for (const quiz of otherQuizzes) {
      const existing = userQuizMap.get(quiz.userId);
      if (!existing || quiz.createdAt > existing.createdAt) {
        userQuizMap.set(quiz.userId, quiz);
      }
    }

    // Build matches with compatibility scores
    const matchPromises = Array.from(userQuizMap.values()).map(async (theirQuiz) => {
      const profile = await ctx.db.query.profiles.findFirst({
        where: eq(profiles.id, theirQuiz.userId),
      });
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, theirQuiz.userId),
      });

      const myQuizData = {
        interests: myQuiz.interests,
        socialStyle: myQuiz.socialStyle,
        friendshipValues: myQuiz.friendshipValues,
        communicationStyle: myQuiz.communicationStyle,
        hangoutVibe: myQuiz.hangoutVibe,
        dealbreakers: myQuiz.dealbreakers,
      };

      const theirQuizData = {
        interests: theirQuiz.interests,
        socialStyle: theirQuiz.socialStyle,
        friendshipValues: theirQuiz.friendshipValues,
        communicationStyle: theirQuiz.communicationStyle,
        hangoutVibe: theirQuiz.hangoutVibe,
        dealbreakers: theirQuiz.dealbreakers,
      };

      return {
        id: `match-${theirQuiz.userId}`,
        user: {
          id: theirQuiz.userId,
          name: user?.name ?? "Friend",
          email: user?.email,
          image: user?.image,
          bio: profile?.bio ?? theirQuiz.bio ?? "Ready for an adventure!",
          avatarUrl: profile?.avatarUrl,
        },
        compatibilityScore: calculateCompatibility(myQuizData, theirQuizData),
        sharedInterests: getSharedInterests(myQuizData, theirQuizData),
        vibeMatch: getVibeMatch(myQuizData, theirQuizData),
      };
    });

    const matches = await Promise.all(matchPromises);

    // Sort by compatibility score (highest first)
    return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }),

  // Get a specific match's full profile with compatibility
  getMatchProfile: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get current user's quiz
      const myQuiz = await ctx.db.query.quizResponses.findFirst({
        where: eq(quizResponses.userId, ctx.session.user.id),
        orderBy: [desc(quizResponses.createdAt)],
      });

      // Get the other user's quiz
      const theirQuiz = await ctx.db.query.quizResponses.findFirst({
        where: eq(quizResponses.userId, input.userId),
        orderBy: [desc(quizResponses.createdAt)],
      });

      // Get their profile and user info
      const profile = await ctx.db.query.profiles.findFirst({
        where: eq(profiles.id, input.userId),
      });

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });

      if (!user) {
        return null;
      }

      // Calculate compatibility if both have quizzes
      let compatibilityScore = 50;
      let sharedInterests: string[] = [];
      let vibeMatch: string | null = null;

      if (myQuiz && theirQuiz) {
        const myQuizData = {
          interests: myQuiz.interests,
          socialStyle: myQuiz.socialStyle,
          friendshipValues: myQuiz.friendshipValues,
          communicationStyle: myQuiz.communicationStyle,
          hangoutVibe: myQuiz.hangoutVibe,
          dealbreakers: myQuiz.dealbreakers,
        };

        const theirQuizData = {
          interests: theirQuiz.interests,
          socialStyle: theirQuiz.socialStyle,
          friendshipValues: theirQuiz.friendshipValues,
          communicationStyle: theirQuiz.communicationStyle,
          hangoutVibe: theirQuiz.hangoutVibe,
          dealbreakers: theirQuiz.dealbreakers,
        };

        compatibilityScore = calculateCompatibility(myQuizData, theirQuizData);
        sharedInterests = getSharedInterests(myQuizData, theirQuizData);
        vibeMatch = getVibeMatch(myQuizData, theirQuizData);
      }

      return {
        user: {
          id: user.id,
          name: user.name ?? "Friend",
          email: user.email,
          image: user.image,
          bio: profile?.bio ?? theirQuiz?.bio ?? "Ready for an adventure!",
          avatarUrl: profile?.avatarUrl,
          location: profile?.location,
        },
        quiz: theirQuiz ? {
          interests: theirQuiz.interests,
          socialStyle: theirQuiz.socialStyle,
          friendshipValues: theirQuiz.friendshipValues,
          communicationStyle: theirQuiz.communicationStyle,
          hangoutVibe: theirQuiz.hangoutVibe,
          dealbreakers: theirQuiz.dealbreakers,
        } : null,
        compatibilityScore,
        sharedInterests,
        vibeMatch,
      };
    }),
});
