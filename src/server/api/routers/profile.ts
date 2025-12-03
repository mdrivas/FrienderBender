import { z } from "zod";
import { eq, isNull } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { profiles, users } from "~/server/db/schema";
import { getDefaultAvatar } from "~/lib/avatar";

export const profileRouter = createTRPCRouter({
  // Get current user's profile
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.query.profiles.findFirst({
      where: eq(profiles.id, ctx.session.user.id),
    });

    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
    });

    return {
      ...profile,
      name: user?.name,
      email: user?.email,
      image: user?.image,
    };
  }),

  // Update profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        bio: z.string().max(500).optional(),
        location: z.string().max(255).optional(),
        avatarUrl: z.string().url().optional(),
        name: z.string().min(1).max(255).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, ...profileData } = input;

      // Update user name if provided
      if (name) {
        await ctx.db
          .update(users)
          .set({ name })
          .where(eq(users.id, ctx.session.user.id));
      }

      // Update or create profile
      const existing = await ctx.db.query.profiles.findFirst({
        where: eq(profiles.id, ctx.session.user.id),
      });

      if (existing) {
        await ctx.db
          .update(profiles)
          .set(profileData)
          .where(eq(profiles.id, ctx.session.user.id));
      } else {
        await ctx.db.insert(profiles).values({
          id: ctx.session.user.id,
          ...profileData,
          quizCompleted: false,
        });
      }

      return { success: true };
    }),

  // Get profile by user ID (for viewing matches)
  getById: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.query.profiles.findFirst({
        where: eq(profiles.id, input.userId),
      });

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });

      return {
        ...profile,
        name: user?.name,
        image: user?.image,
      };
    }),

  // Backfill default avatars for existing users without one
  backfillAvatars: protectedProcedure.mutation(async ({ ctx }) => {
    // Get all profiles without avatar_url
    const profilesWithoutAvatar = await ctx.db
      .select()
      .from(profiles)
      .where(isNull(profiles.avatarUrl));

    let updated = 0;
    for (const profile of profilesWithoutAvatar) {
      await ctx.db
        .update(profiles)
        .set({ avatarUrl: getDefaultAvatar() })
        .where(eq(profiles.id, profile.id));
      updated++;
    }

    // Also create profiles for users who don't have one yet
    const allUsers = await ctx.db.select().from(users);
    const allProfiles = await ctx.db.select().from(profiles);
    const profileIds = new Set(allProfiles.map(p => p.id));

    let created = 0;
    for (const user of allUsers) {
      if (!profileIds.has(user.id)) {
        await ctx.db.insert(profiles).values({
          id: user.id,
          quizCompleted: false,
          avatarUrl: getDefaultAvatar(),
        });
        created++;
      }
    }

    return { updated, created };
  }),
});
