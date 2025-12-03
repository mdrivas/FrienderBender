import { z } from "zod";
import { eq, or, and, desc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { messages, users, events } from "~/server/db/schema";

export const messageRouter = createTRPCRouter({
  // Send a message
  send: protectedProcedure
    .input(
      z.object({
        receiverId: z.string(),
        content: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const message = await ctx.db
        .insert(messages)
        .values({
          senderId: ctx.session.user.id,
          receiverId: input.receiverId,
          content: input.content,
        })
        .returning();

      return message[0];
    }),

  // Send an event invitation
  sendEventInvite: protectedProcedure
    .input(
      z.object({
        receiverId: z.string(),
        eventId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get event details
      const event = await ctx.db.query.events.findFirst({
        where: eq(events.id, input.eventId),
      });

      if (!event) {
        throw new Error("Event not found");
      }

      const message = await ctx.db
        .insert(messages)
        .values({
          senderId: ctx.session.user.id,
          receiverId: input.receiverId,
          content: `Hey! Want to go to "${event.title}" together?`,
          eventId: input.eventId,
          inviteStatus: "pending",
        })
        .returning();

      return message[0];
    }),

  // Respond to an event invitation
  respondToInvite: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
        accept: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Update the invitation status
      await ctx.db
        .update(messages)
        .set({ inviteStatus: input.accept ? "accepted" : "declined" })
        .where(
          and(
            eq(messages.id, input.messageId),
            eq(messages.receiverId, ctx.session.user.id)
          )
        );

      // Get the original message to send a response
      const originalMessage = await ctx.db.query.messages.findFirst({
        where: eq(messages.id, input.messageId),
      });

      if (originalMessage && originalMessage.eventId) {
        const event = await ctx.db.query.events.findFirst({
          where: eq(events.id, originalMessage.eventId),
        });

        // Send a response message
        const responseContent = input.accept
          ? `I'm in! Let's go to "${event?.title}" together! 🎉`
          : `Thanks for the invite, but I can't make it to "${event?.title}" this time.`;

        await ctx.db.insert(messages).values({
          senderId: ctx.session.user.id,
          receiverId: originalMessage.senderId,
          content: responseContent,
        });
      }

      return { success: true };
    }),

  // Get conversation with a specific user (now includes event data)
  getConversation: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const myId = ctx.session.user.id;
      const theirId = input.userId;

      const conversationMessages = await ctx.db
        .select()
        .from(messages)
        .where(
          or(
            and(eq(messages.senderId, myId), eq(messages.receiverId, theirId)),
            and(eq(messages.senderId, theirId), eq(messages.receiverId, myId))
          )
        )
        .orderBy(messages.createdAt);

      // Fetch event details for messages with eventId
      const messagesWithEvents = await Promise.all(
        conversationMessages.map(async (msg) => {
          if (msg.eventId) {
            const event = await ctx.db.query.events.findFirst({
              where: eq(events.id, msg.eventId),
            });
            return { ...msg, event };
          }
          return { ...msg, event: null };
        })
      );

      return messagesWithEvents;
    }),

  // Mark messages as read
  markAsRead: protectedProcedure
    .input(z.object({ senderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(messages)
        .set({ read: true })
        .where(
          and(
            eq(messages.senderId, input.senderId),
            eq(messages.receiverId, ctx.session.user.id),
            eq(messages.read, false)
          )
        );

      return { success: true };
    }),

  // Get all conversations (list of users you've messaged with)
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const myId = ctx.session.user.id;

    // Get all messages involving this user
    const allMessages = await ctx.db
      .select()
      .from(messages)
      .where(or(eq(messages.senderId, myId), eq(messages.receiverId, myId)))
      .orderBy(desc(messages.createdAt));

    // Group by conversation partner
    const conversationMap = new Map<
      string,
      { otherUserId: string; lastMessage: typeof allMessages[0]; unreadCount: number }
    >();

    for (const msg of allMessages) {
      const otherUserId = msg.senderId === myId ? msg.receiverId : msg.senderId;

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          otherUserId,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      // Count unread messages from the other user
      if (msg.senderId === otherUserId && !msg.read) {
        const conv = conversationMap.get(otherUserId)!;
        conv.unreadCount++;
      }
    }

    // Get user info for each conversation
    const conversations = await Promise.all(
      Array.from(conversationMap.values()).map(async (conv) => {
        const user = await ctx.db.query.users.findFirst({
          where: eq(users.id, conv.otherUserId),
        });

        return {
          user: {
            id: user?.id,
            name: user?.name,
            image: user?.image,
          },
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
        };
      })
    );

    return conversations;
  }),
});
