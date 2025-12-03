import { z } from "zod";
import { eq, gte, desc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { events } from "~/server/db/schema";

// Default events to seed the database
const defaultEvents = [
  {
    title: "Creative Vibes – Art Jam",
    category: "creative",
    description: "An intimate art session with a twist. Bring your imagination, we'll bring the surprise.",
    date: new Date("2025-12-08T19:00:00"),
    location: "Downtown Art District",
    mysteryHint: "🎨 Paint, sip, and let loose. PS: It glows in the dark.",
    vibeTags: ["creative", "chill", "social"],
    imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop",
  },
  {
    title: "Midnight Food Safari",
    category: "food",
    description: "A culinary mystery tour through hidden foodie gems. Prepare your taste buds.",
    date: new Date("2025-12-09T21:00:00"),
    location: "Various Locations",
    mysteryHint: "🍜 Street eats meet secret spots. Vegan options available.",
    vibeTags: ["foodie", "adventure", "nightlife"],
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
  },
  {
    title: "Sunrise Hike & Brunch",
    category: "adventure",
    description: "Early birds get the best views. And pancakes. Definitely pancakes.",
    date: new Date("2025-12-10T06:30:00"),
    location: "Mountain Trail (TBD)",
    mysteryHint: "🏔️ Pack layers. The destination is worth waking up for.",
    vibeTags: ["adventure", "wellness", "outdoors"],
    imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop",
  },
  {
    title: "Secret Rooftop Sessions",
    category: "nightlife",
    description: "Acoustic vibes under the stars. Location revealed 2 hours before.",
    date: new Date("2025-12-11T20:00:00"),
    location: "Rooftop Location (Secret)",
    mysteryHint: "🎵 Bring a blanket. BYOB welcome. Dress warm.",
    vibeTags: ["music", "chill", "nightlife"],
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
  },
  {
    title: "Sunset Yoga & Sound Bath",
    category: "wellness",
    description: "Ground yourself with movement and sound. Perfect for all levels.",
    date: new Date("2025-12-12T18:00:00"),
    location: "Beachfront Studio",
    mysteryHint: "🧘 Mats provided. Come as you are. Leave refreshed.",
    vibeTags: ["wellness", "chill", "mindful"],
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
  },
  {
    title: "Trivia Night Takeover",
    category: "nightlife",
    description: "Teams compete for glory (and prizes). Snacks included.",
    date: new Date("2025-12-13T19:30:00"),
    location: "Local Brewery",
    mysteryHint: "🎲 Random team assignments. Make new friends while you compete.",
    vibeTags: ["social", "games", "nightlife"],
    imageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop",
  },
];

export const eventRouter = createTRPCRouter({
  // Get all upcoming events
  list: publicProcedure.query(async ({ ctx }) => {
    const now = new Date();
    let eventList = await ctx.db.query.events.findMany({
      where: gte(events.date, now),
      orderBy: [events.date],
    });

    // If no events, seed with defaults
    if (eventList.length === 0) {
      await ctx.db.insert(events).values(defaultEvents);
      eventList = await ctx.db.query.events.findMany({
        where: gte(events.date, now),
        orderBy: [events.date],
      });
    }

    return eventList;
  }),

  // Get event by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.db.query.events.findFirst({
        where: eq(events.id, input.id),
      });
      return event;
    }),

  // Get events by category
  getByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const eventList = await ctx.db.query.events.findMany({
        where: eq(events.category, input.category),
        orderBy: [events.date],
      });
      return eventList.filter((e) => e.date >= now);
    }),
});
