"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  ArrowLeft,
  Send,
  Sparkles,
  MapPin,
  Calendar,
  Heart,
  MessageCircle,
  Users,
  Zap,
  Coffee,
  Star,
  AlertCircle,
} from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { getUserAvatar } from "~/lib/avatar";
import { api } from "~/trpc/react";
import { supabase } from "~/lib/supabase";
import type { Message, Event } from "~/server/db/schema";
import { format } from "date-fns";

// Extended message type with event data
interface MessageWithEvent extends Message {
  event?: Event | null;
}

// Interest display data
const interestData: Record<string, { emoji: string; label: string }> = {
  brunch: { emoji: "🥐", label: "Brunch & Coffee" },
  hiking: { emoji: "🥾", label: "Hiking & Nature" },
  concerts: { emoji: "🎤", label: "Concerts & Shows" },
  gaming: { emoji: "🎮", label: "Video Games" },
  fitness: { emoji: "💪", label: "Gym & Fitness" },
  cooking: { emoji: "👩‍🍳", label: "Cooking & Restaurants" },
  movies: { emoji: "🍿", label: "Movies & TV" },
  travel: { emoji: "✈️", label: "Weekend Trips" },
  sports: { emoji: "🏀", label: "Playing Sports" },
  art: { emoji: "🎨", label: "Museums & Art" },
  nightlife: { emoji: "🍸", label: "Bars & Clubs" },
  boardgames: { emoji: "🎲", label: "Board Game Nights" },
};

const _hangoutVibeData: Record<string, { emoji: string; label: string }> = {
  active: { emoji: "🏃", label: "Active hangouts" },
  chill: { emoji: "🛋️", label: "Low-key hangs" },
  explore: { emoji: "🏙️", label: "City exploration" },
  creative: { emoji: "🎨", label: "Creative activities" },
  nightout: { emoji: "🌙", label: "Night out" },
  outdoors: { emoji: "⛰️", label: "Outdoor adventures" },
};

const socialStyleData: Record<string, string> = {
  solo: "Prefers solo time to recharge",
  small_group: "Loves small group hangs",
  big_group: "The more the merrier!",
  depends: "Flexible on group size",
};

const communicationStyleData: Record<string, string> = {
  texter: "Always on their phone",
  planner: "Likes to plan ahead",
  spontaneous: "Down for last-minute plans",
  low_maintenance: "Low maintenance friend",
};

export default function MatchProfile() {
  const params = useParams();
  const router = useRouter();
  const { status, data: session } = useSession();
  const [messages, setMessages] = useState<MessageWithEvent[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showStarters, setShowStarters] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utils = api.useUtils();

  const userId = params.id as string;

  // Fetch the match profile data
  const { data: matchData, isLoading, error } = api.quiz.getMatchProfile.useQuery(
    { userId },
    { enabled: status === "authenticated" && !!userId }
  );

  // Fetch existing messages
  const { data: existingMessages } = api.message.getConversation.useQuery(
    { userId },
    { enabled: status === "authenticated" && !!userId }
  );

  // Send message mutation
  const sendMessage = api.message.send.useMutation({
    onSuccess: () => {
      void utils.message.getConversation.invalidate({ userId });
    },
  });

  // Mark messages as read
  const markAsRead = api.message.markAsRead.useMutation();

  // Respond to event invitation
  const respondToInvite = api.message.respondToInvite.useMutation({
    onSuccess: () => {
      void utils.message.getConversation.invalidate({ userId });
    },
  });

  // Fetch events for invite modal
  const { data: events } = api.event.list.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  // Send event invitation
  const sendEventInvite = api.message.sendEventInvite.useMutation({
    onSuccess: (newMsg) => {
      setInviteModalOpen(false);
      if (newMsg) {
        setMessages((prev) => [...prev, { ...newMsg, event: null }]);
        setShowStarters(false);
      }
      void utils.message.getConversation.invalidate({ userId });
    },
  });

  const handleSendInvite = (eventId: string) => {
    sendEventInvite.mutate({
      receiverId: userId,
      eventId,
    });
  };

  // Load existing messages
  useEffect(() => {
    if (existingMessages) {
      setMessages(existingMessages);
      if (existingMessages.length > 0) {
        setShowStarters(false);
      }
    }
  }, [existingMessages]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!session?.user?.id || !userId) return;

    const channel = supabase
      .channel(`messages:${session.user.id}:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "next_postgres_message",
          filter: `receiver_id=eq.${session.user.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Only add if it's from this conversation
          if (newMsg.senderId === userId) {
            setMessages((prev) => [...prev, newMsg]);
            // Mark as read
            void markAsRead.mutateAsync({ senderId: userId });
          }
        }
      )
      .subscribe();

    // Mark existing unread messages as read
    void markAsRead.mutateAsync({ senderId: userId });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [session?.user?.id, userId]);

  // Generate conversation starters based on shared interests
  const conversationStarters = matchData?.sharedInterests?.length
    ? [
        matchData.sharedInterests.includes("hiking")
          ? `Hey! I noticed we both love hiking. Any favorite trails around here?`
          : matchData.sharedInterests.includes("cooking")
          ? `Fellow foodie! What's your go-to restaurant around here?`
          : matchData.sharedInterests.includes("gaming")
          ? `I see you're into gaming too! What have you been playing lately?`
          : `Hey ${matchData.user.name.split(" ")[0]}! I noticed we have some interests in common. What do you like to do on weekends?`,
        `Your profile caught my eye! Would love to grab coffee sometime and chat.`,
        `We have a ${matchData.compatibilityScore}% match - that's pretty cool! What brings you to FrienderBender?`,
        `Hey! Always looking to meet new people with similar interests. How's it going?`,
      ]
    : [
        "Hey! Would love to get to know you better. What do you like to do for fun?",
        "Your profile seems interesting! Want to grab coffee sometime?",
        "Hi there! Always looking to meet new people. How's your week going?",
        "Hey! What brings you to FrienderBender?",
      ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !matchData || sendMessage.isPending) return;

    setNewMessage("");
    setShowStarters(false);

    try {
      const sentMessage = await sendMessage.mutateAsync({
        receiverId: userId,
        content: text.trim(),
      });

      if (sentMessage) {
        setMessages((prev) => [...prev, sentMessage]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage(newMessage);
    }
  };

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="p-8 text-center max-w-md">
          <Heart className="w-16 h-16 text-coral mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-charcoal mb-4">Sign in to view profiles</h2>
          <Button
            onClick={() => signIn()}
            className="bg-coral hover:bg-coral/90 text-white rounded-full"
          >
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
            <div className="lg:col-span-3">
              <Skeleton className="h-[600px] w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !matchData) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-coral mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-charcoal mb-4">Profile not found</h2>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find this user. They may have deleted their account.
          </p>
          <Button
            onClick={() => router.push("/matches")}
            className="bg-coral hover:bg-coral/90 text-white rounded-full"
          >
            Back to Matches
          </Button>
        </Card>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 80) return "text-coral";
    return "text-electric-blue";
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-charcoal hover:text-coral transition-colors group"
            >
              <div className="p-2 rounded-full bg-gray-100 group-hover:bg-coral/10 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-medium hidden sm:inline">Back to Matches</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Compatibility</div>
                <div className={`text-xl font-bold ${getScoreColor(matchData.compatibilityScore)}`}>
                  {matchData.compatibilityScore}% Match
                </div>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${
                matchData.compatibilityScore >= 90 ? "bg-green-100 text-green-600" :
                matchData.compatibilityScore >= 80 ? "bg-coral/10 text-coral" :
                "bg-electric-blue/10 text-electric-blue"
              }`}>
                <Heart className="w-5 h-5 fill-current" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-9rem)]">

          {/* Left Column - Compact Profile */}
          <div className="lg:col-span-4 h-full overflow-y-auto pr-2 custom-scrollbar">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Main Profile Card */}
              <Card className="overflow-hidden border-0 shadow-lg rounded-3xl bg-white">
                <div className="p-6 flex flex-col items-center text-center border-b border-gray-100">
                  <div className="relative mb-4 group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-coral to-purple-500 rounded-full opacity-70 blur group-hover:opacity-100 transition duration-200"></div>
                    <img
                      src={getUserAvatar(matchData.user.image, matchData.user.avatarUrl)}
                      alt={matchData.user.name}
                      className="relative w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                    />
                    <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                  </div>

                  <h1 className="text-2xl font-bold text-charcoal mb-1">{matchData.user.name}</h1>
                  {matchData.user.location && (
                    <p className="text-gray-500 text-sm flex items-center justify-center gap-1 mb-4">
                      <MapPin className="w-3 h-3" />
                      {matchData.user.location}
                    </p>
                  )}

                  <div className="w-full grid grid-cols-2 gap-2 mt-2">
                     <Button
                      onClick={() => setInviteModalOpen(true)}
                      variant="outline"
                      className="w-full rounded-xl border-gray-200 hover:border-coral hover:text-coral hover:bg-coral/5"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Invite
                    </Button>
                    <Button
                      onClick={() => document.getElementById('message-input')?.focus()}
                      className="w-full bg-coral hover:bg-coral/90 text-white rounded-xl shadow-md shadow-coral/20"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                  </div>
                </div>

                <div className="p-6 bg-gray-50/50">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Star className="w-3 h-3" />
                    Bio
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{matchData.user.bio}</p>
                </div>
              </Card>

              {/* Compact Traits */}
              {matchData.quiz && (
                <div className="grid grid-cols-2 gap-3">
                   <Card className="p-4 border-0 shadow-md rounded-2xl bg-white flex flex-col justify-between hover:shadow-lg transition-shadow">
                      <div className="mb-2 bg-coral/10 w-8 h-8 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-coral" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 uppercase font-semibold">Social Battery</span>
                        <p className="font-medium text-charcoal text-sm truncate" title={socialStyleData[matchData.quiz.socialStyle ?? ""]}>
                          {socialStyleData[matchData.quiz.socialStyle ?? ""]?.split(" ")[0] ?? "Flexible"}
                        </p>
                      </div>
                   </Card>
                   <Card className="p-4 border-0 shadow-md rounded-2xl bg-white flex flex-col justify-between hover:shadow-lg transition-shadow">
                      <div className="mb-2 bg-electric-blue/10 w-8 h-8 rounded-full flex items-center justify-center">
                        <Zap className="w-4 h-4 text-electric-blue" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 uppercase font-semibold">Planning Style</span>
                        <p className="font-medium text-charcoal text-sm truncate" title={communicationStyleData[matchData.quiz.communicationStyle ?? ""]}>
                           {communicationStyleData[matchData.quiz.communicationStyle ?? ""]?.split(" ")[0] ?? "Flexible"}
                        </p>
                      </div>
                   </Card>
                </div>
              )}

              {/* Interests - visible without scrolling */}
              <Card className="p-6 border-0 shadow-lg rounded-3xl bg-white">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Shared Interests
                </h3>

                {matchData.sharedInterests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {matchData.sharedInterests.map((interest) => (
                      <Badge
                        key={interest}
                        className="bg-coral/10 text-coral hover:bg-coral/20 border-0 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-default"
                      >
                        {interestData[interest]?.emoji ?? "✨"} {interestData[interest]?.label ?? interest}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No direct interest matches, but opposites attract!</p>
                )}

                {matchData.quiz?.interests && matchData.quiz.interests.length > 0 && (
                  <>
                    <div className="my-4 border-t border-gray-100" />
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Coffee className="w-3 h-3" />
                      Also Into
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {matchData.quiz.interests
                        .filter(i => !matchData.sharedInterests.includes(i))
                        .slice(0, 5)
                        .map((interest) => (
                        <Badge
                          key={interest}
                          variant="outline"
                          className="border-gray-200 text-gray-600 hover:border-gray-300 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-default"
                        >
                          {interestData[interest]?.emoji ?? "✨"} {interestData[interest]?.label ?? interest}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Full Height Chat */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8 h-full"
          >
            <Card className="h-full flex flex-col border-0 shadow-xl rounded-3xl overflow-hidden bg-white ring-1 ring-black/5">
              {/* Chat Header - Minimal */}
              <div className="p-4 border-b border-gray-100 bg-white/50 backdrop-blur-sm flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={getUserAvatar(matchData.user.image, matchData.user.avatarUrl)}
                      alt={matchData.user.name}
                      className="w-10 h-10 rounded-full bg-gray-100 object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-charcoal text-sm">{matchData.user.name}</h3>
                    <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                      Online now
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-coral hover:bg-coral/5">
                  <AlertCircle className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/30 custom-scrollbar">
                {messages.length === 0 && showStarters ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4 py-10">
                    <div className="w-16 h-16 bg-coral/10 rounded-2xl flex items-center justify-center mb-4 rotate-3">
                      <MessageCircle className="w-8 h-8 text-coral" />
                    </div>
                    <h3 className="text-lg font-bold text-charcoal mb-2">
                      Break the ice!
                    </h3>
                    <p className="text-gray-500 mb-8 max-w-xs text-sm">
                      {matchData.sharedInterests.length > 0
                        ? `You both like ${matchData.sharedInterests[0] ?? "similar things"}. Ask them about it!`
                        : "Start with a friendly hello."}
                    </p>

                    <div className="grid gap-2 w-full max-w-sm">
                      {conversationStarters.slice(0, 3).map((starter, index) => (
                        <button
                          key={index}
                          onClick={() => void handleSendMessage(starter)}
                          className="w-full text-left p-4 bg-white rounded-xl border border-gray-200 hover:border-coral hover:shadow-md hover:translate-x-1 transition-all text-sm text-gray-700 group"
                        >
                          <span className="group-hover:text-coral transition-colors">{starter}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                     <div className="flex justify-center">
                        <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">Today</span>
                     </div>
                    {messages.map((message) => {
                      const isMe = message.senderId === session?.user?.id;
                      const isEventInvite = !!message.eventId && !!message.event;
                      const canRespond = !isMe && message.inviteStatus === "pending";

                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={message.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`flex gap-2 max-w-[85%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                            {!isMe && (
                               <img
                                src={getUserAvatar(matchData.user.image, matchData.user.avatarUrl)}
                                alt={matchData.user.name}
                                className="w-8 h-8 rounded-full self-end mb-1"
                              />
                            )}
                            {isEventInvite && message.event ? (
                              <div className={`rounded-2xl overflow-hidden shadow-md ${isMe ? "rounded-br-sm" : "rounded-bl-sm"} ${isMe ? "bg-coral" : "bg-white border border-gray-100"}`}>
                                <div className={`px-4 py-3 ${isMe ? "text-white" : "text-charcoal"}`}>
                                  <p className="text-sm font-medium mb-2">{message.content}</p>
                                </div>
                                <div className="bg-gray-50 p-3 border-t border-gray-100">
                                  <div className="flex gap-3">
                                    <img
                                      src={message.event.imageUrl ?? "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=200&h=200&fit=crop"}
                                      alt={message.event.title}
                                      className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-charcoal text-sm truncate">{message.event.title}</h4>
                                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(message.event.date), "MMM d, h:mm a")}
                                      </p>
                                      <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate">{message.event.location}</span>
                                      </p>
                                    </div>
                                  </div>
                                  {canRespond && (
                                    <div className="flex gap-2 mt-3">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 rounded-full text-xs"
                                        onClick={() => respondToInvite.mutate({ messageId: message.id, accept: false })}
                                        disabled={respondToInvite.isPending}
                                      >
                                        Can&apos;t make it
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="flex-1 bg-coral hover:bg-coral/90 text-white rounded-full text-xs"
                                        onClick={() => respondToInvite.mutate({ messageId: message.id, accept: true })}
                                        disabled={respondToInvite.isPending}
                                      >
                                        I&apos;m in!
                                      </Button>
                                    </div>
                                  )}
                                  {message.inviteStatus === "accepted" && (
                                    <div className="mt-3 text-center text-xs font-medium text-green-600 bg-green-50 py-2 rounded-full">
                                      ✓ Accepted
                                    </div>
                                  )}
                                  {message.inviteStatus === "declined" && (
                                    <div className="mt-3 text-center text-xs font-medium text-gray-500 bg-gray-100 py-2 rounded-full">
                                      Declined
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div
                                className={`px-5 py-3 shadow-sm ${
                                  isMe
                                    ? "bg-coral text-white rounded-2xl rounded-br-sm"
                                    : "bg-white text-charcoal rounded-2xl rounded-bl-sm border border-gray-100"
                                }`}
                              >
                                <p className="text-sm leading-relaxed">{message.content}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-end gap-2 bg-gray-50 p-2 rounded-[24px] border border-transparent focus-within:border-coral/30 focus-within:bg-white focus-within:shadow-sm transition-all">
                  <Input
                    id="message-input"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3 min-h-[48px] max-h-32"
                    autoComplete="off"
                  />
                  <Button
                    onClick={() => void handleSendMessage(newMessage)}
                    disabled={!newMessage.trim() || sendMessage.isPending}
                    size="icon"
                    className={`rounded-full h-10 w-10 mb-1 mr-1 transition-all ${newMessage.trim() && !sendMessage.isPending ? 'bg-coral hover:bg-coral/90' : 'bg-gray-200 text-gray-400'}`}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Invite to Event Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-charcoal flex items-center gap-2">
              <Calendar className="w-6 h-6 text-coral" />
              Invite {matchData?.user.name?.split(" ")[0]} to an Event
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-gray-600">
              Pick an event to invite them to! They&apos;ll get a message and can accept or decline.
            </p>

            {events?.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming events</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events?.map((event) => (
                  <Card
                    key={event.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-coral"
                    onClick={() => handleSendInvite(event.id)}
                  >
                    <div className="flex gap-4">
                      <img
                        src={event.imageUrl ?? "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=200&h=200&fit=crop"}
                        alt={event.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-soft-pink text-coral text-xs">
                            {event.category}
                          </Badge>
                        </div>
                        <h4 className="font-bold text-charcoal truncate">{event.title}</h4>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(event.date), "MMM d, h:mm a")}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="self-center bg-coral hover:bg-coral/90 text-white rounded-full px-4"
                        disabled={sendEventInvite.isPending}
                      >
                        {sendEventInvite.isPending ? "..." : "Invite"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
