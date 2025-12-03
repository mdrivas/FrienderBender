import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { rideBookings, events } from "~/server/db/schema";

export const rideRouter = createTRPCRouter({
  // Book a ride
  book: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        matchId: z.string().optional(),
        pickupTime: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the event to calculate default pickup time
      const event = await ctx.db.query.events.findFirst({
        where: eq(events.id, input.eventId),
      });

      if (!event) {
        throw new Error("Event not found");
      }

      // Default pickup time is 30 minutes before event
      const pickupTime = input.pickupTime ?? new Date(event.date.getTime() - 30 * 60 * 1000);

      const booking = await ctx.db
        .insert(rideBookings)
        .values({
          userId: ctx.session.user.id,
          eventId: input.eventId,
          matchId: input.matchId,
          pickupTime,
          status: "confirmed",
        })
        .returning();

      return booking[0];
    }),

  // Get my bookings
  getMyBookings: protectedProcedure.query(async ({ ctx }) => {
    const bookings = await ctx.db.query.rideBookings.findMany({
      where: eq(rideBookings.userId, ctx.session.user.id),
      orderBy: [desc(rideBookings.createdAt)],
      with: {
        event: true,
      },
    });
    return bookings;
  }),

  // Get booking by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const booking = await ctx.db.query.rideBookings.findFirst({
        where: and(
          eq(rideBookings.id, input.id),
          eq(rideBookings.userId, ctx.session.user.id)
        ),
        with: {
          event: true,
        },
      });
      return booking;
    }),

  // Cancel booking
  cancel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(rideBookings)
        .set({ status: "cancelled" })
        .where(
          and(
            eq(rideBookings.id, input.id),
            eq(rideBookings.userId, ctx.session.user.id)
          )
        );
      return { success: true };
    }),

  // Get latest booking (for ride confirmation page)
  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const booking = await ctx.db.query.rideBookings.findFirst({
      where: eq(rideBookings.userId, ctx.session.user.id),
      orderBy: [desc(rideBookings.createdAt)],
      with: {
        event: true,
      },
    });
    return booking;
  }),
});
