"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Heart, MessageCircle, Calendar, MapPin, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";
import { useSession, signIn } from "next-auth/react";
import { getUserAvatar } from "~/lib/avatar";
import { useState } from "react";
import { format } from "date-fns";

const FALLBACK_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23FFD6D6'/%3E%3Ccircle cx='50' cy='38' r='18' fill='%23FF6B6B'/%3E%3Cellipse cx='50' cy='85' rx='30' ry='25' fill='%23FF6B6B'/%3E%3C/svg%3E";

const interestEmojis: Record<string, string> = {
  brunch: "🥐",
  hiking: "🥾",
  concerts: "🎤",
  gaming: "🎮",
  fitness: "💪",
  cooking: "👩‍🍳",
  movies: "🍿",
  travel: "✈️",
  sports: "🏀",
  art: "🎨",
  nightlife: "🍸",
  boardgames: "🎲",
};

const categoryEmojis: Record<string, string> = {
  creative: "🎨",
  music: "🎵",
  food: "🍕",
  adventure: "🏔️",
  nightlife: "🌙",
  wellness: "🧘",
  sports: "⚽",
};

const getScoreColor = (score: number) => {
  if (score >= 90) return "text-green-500";
  if (score >= 80) return "text-coral";
  return "text-electric-blue";
};

interface MatchUser {
  id: string;
  name: string;
  image?: string | null;
  avatarUrl?: string | null;
  bio?: string;
}

export default function Matches() {
  const router = useRouter();
  const { status } = useSession();
  const [filter, setFilter] = useState("all");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchUser | null>(null);

  const { data: matches, isLoading } = api.quiz.getMatches.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  const { data: events } = api.event.list.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  const sendInvite = api.message.sendEventInvite.useMutation({
    onSuccess: () => {
      setInviteModalOpen(false);
      setSelectedMatch(null);
      // Navigate to the chat with this person
      if (selectedMatch) {
        router.push(`/matches/${selectedMatch.id}`);
      }
    },
  });

  const handleInviteClick = (e: React.MouseEvent, match: MatchUser) => {
    e.stopPropagation();
    setSelectedMatch(match);
    setInviteModalOpen(true);
  };

  const handleSendInvite = (eventId: string) => {
    if (!selectedMatch) return;
    sendInvite.mutate({
      receiverId: selectedMatch.id,
      eventId,
    });
  };

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="p-8 text-center max-w-md">
          <Heart className="w-16 h-16 text-coral mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-charcoal mb-4">
            Sign in to see your matches
          </h2>
          <p className="text-gray-600 mb-6">
            Take the quiz and sign in to discover people who share your vibe!
          </p>
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

  const filteredMatches =
    filter === "all"
      ? matches
      : matches?.filter((m) => m.vibeMatch === filter);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-coral/10 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-5 h-5 text-coral" />
            <span className="font-semibold text-coral">Your Perfect Matches</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">
            Meet Your Potential Crew
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Based on your quiz, we found these awesome humans who share your vibe
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <Tabs value={filter} onValueChange={setFilter} className="w-full max-w-2xl">
            <TabsList className="w-full grid grid-cols-4 bg-white shadow-lg rounded-full p-1">
              <TabsTrigger value="all" className="rounded-full">
                All Matches
              </TabsTrigger>
              <TabsTrigger value="creative" className="rounded-full">
                🎨 Creative
              </TabsTrigger>
              <TabsTrigger value="adventure" className="rounded-full">
                🏔️ Adventure
              </TabsTrigger>
              <TabsTrigger value="chill" className="rounded-full">
                🛋️ Chill
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Match cards grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-lg">
                  <Skeleton className="w-full aspect-square rounded-xl mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
          </div>
        ) : !filteredMatches?.length ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 gradient-pink-coral rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-charcoal mb-2">No matches yet</h3>
            <p className="text-gray-600">Complete the quiz first to find your matches!</p>
            <Button
              onClick={() => router.push("/quiz")}
              className="mt-4 bg-coral hover:bg-coral/90 text-white rounded-full"
            >
              Take the Quiz
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-transparent hover:border-coral cursor-pointer"
                  onClick={() => router.push(`/matches/${match.user.id}`)}
                >
                  <div className="relative">
                    <img
                      src={getUserAvatar(match.user.image, match.user.avatarUrl)}
                      alt={match.user.name}
                      className="w-full aspect-square object-cover bg-soft-pink"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_AVATAR;
                      }}
                    />
                    <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 shadow-lg">
                      <span className={`font-bold text-lg ${getScoreColor(match.compatibilityScore)}`}>
                        {match.compatibilityScore}%
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-charcoal mb-2">{match.user.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {match.user.bio}
                    </p>

                    {/* Shared interests */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {match.sharedInterests.slice(0, 3).map((interest) => (
                        <Badge key={interest} variant="secondary" className="bg-soft-pink text-coral">
                          {interestEmojis[interest] ?? "✨"} {interest}
                        </Badge>
                      ))}
                      {match.sharedInterests.length > 3 && (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                          +{match.sharedInterests.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/matches/${match.user.id}`);
                        }}
                        className="flex-1 bg-coral hover:bg-coral/90 text-white rounded-full"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                      <Button
                        onClick={(e) => handleInviteClick(e, match.user)}
                        variant="outline"
                        className="rounded-full border-coral text-coral hover:bg-coral hover:text-white"
                      >
                        <Calendar className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Invite to Event Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-charcoal flex items-center gap-2">
              <Calendar className="w-6 h-6 text-coral" />
              Invite {selectedMatch?.name?.split(" ")[0]} to an Event
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
                            {categoryEmojis[event.category]} {event.category}
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
                        disabled={sendInvite.isPending}
                      >
                        {sendInvite.isPending ? "..." : "Invite"}
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
