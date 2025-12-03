"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, MapPin, Sparkles, Users, CheckCircle } from "lucide-react";
import { format } from "date-fns";
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

const categoryEmojis: Record<string, string> = {
  creative: "🎨",
  music: "🎵",
  food: "🍕",
  adventure: "🏔️",
  nightlife: "🌙",
  wellness: "🧘",
  sports: "⚽",
};

export default function Events() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("match");
  const { status } = useSession();
  const [filter, setFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<{
    id: string;
    title: string;
    date: Date;
    location: string | null;
    mysteryHint: string | null;
    imageUrl: string | null;
  } | null>(null);

  const { data: events, isLoading } = api.event.list.useQuery();

  const { data: myBookings } = api.ride.getMyBookings.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  // Create a set of event IDs the user has signed up for
  const signedUpEventIds = new Set(
    myBookings?.filter(b => b.status !== "cancelled").map(b => b.eventId) ?? []
  );

  const joinEvent = api.ride.book.useMutation({
    onSuccess: () => {
      router.push("/ride-confirmation");
    },
  });

  const handleJoinEvent = (eventId: string) => {
    if (status !== "authenticated") {
      void signIn();
      return;
    }

    joinEvent.mutate({
      eventId,
      matchId: matchId ?? undefined,
    });
  };

  const filteredEvents =
    filter === "all"
      ? events
      : filter === "my-events"
        ? events?.filter((e) => signedUpEventIds.has(e.id))
        : events?.filter(
            (e) => e.category === filter || e.vibeTags?.includes(filter)
          );

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 gradient-pink-coral px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="font-semibold text-white">Mystery Adventures Await</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">
            Pick Your Next Adventure
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Each event is a surprise experience. Choose your vibe, bring a match, and
            let the adventure unfold.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <Tabs value={filter} onValueChange={setFilter} className="w-full max-w-4xl">
            <TabsList className="w-full grid grid-cols-4 md:grid-cols-8 bg-white shadow-lg rounded-full p-1">
              <TabsTrigger value="all" className="rounded-full text-xs md:text-sm">
                All
              </TabsTrigger>
              <TabsTrigger value="my-events" className="rounded-full text-xs md:text-sm">
                ✅ My Events
              </TabsTrigger>
              <TabsTrigger value="creative" className="rounded-full text-xs md:text-sm">
                🎨 Creative
              </TabsTrigger>
              <TabsTrigger value="food" className="rounded-full text-xs md:text-sm">
                🍕 Food
              </TabsTrigger>
              <TabsTrigger value="adventure" className="rounded-full text-xs md:text-sm">
                🏔️ Adventure
              </TabsTrigger>
              <TabsTrigger value="nightlife" className="rounded-full text-xs md:text-sm">
                🌙 Nightlife
              </TabsTrigger>
              <TabsTrigger value="wellness" className="rounded-full text-xs md:text-sm">
                🧘 Wellness
              </TabsTrigger>
              <TabsTrigger value="music" className="rounded-full text-xs md:text-sm">
                🎵 Music
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Events grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg">
                  <Skeleton className="w-full h-48" />
                  <div className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
          </div>
        ) : filteredEvents?.length === 0 && filter === "my-events" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-charcoal mb-2">No events yet</h3>
            <p className="text-gray-600 mb-6">You haven't signed up for any events. Browse and join one!</p>
            <Button
              onClick={() => setFilter("all")}
              className="bg-coral hover:bg-coral/90 text-white rounded-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Browse Events
            </Button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents?.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 ${signedUpEventIds.has(event.id) ? 'border-green-400 bg-green-50/30' : 'border-transparent hover:border-electric-blue'} group`}>
                  <div className="relative overflow-hidden">
                    <img
                      src={event.imageUrl ?? "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop"}
                      alt={event.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className="bg-white/90 text-charcoal font-bold text-lg px-3 py-1">
                        {categoryEmojis[event.category]} {event.category}
                      </Badge>
                      {signedUpEventIds.has(event.id) && (
                        <Badge className="bg-green-500 text-white font-bold px-3 py-1">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Going!
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-charcoal mb-2">{event.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{event.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-coral" />
                        <span>{format(new Date(event.date), "EEEE, MMM d 'at' h:mm a")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-electric-blue" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    {/* Vibe tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {event.vibeTags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-soft-pink text-coral text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {signedUpEventIds.has(event.id) ? (
                      <Button
                        onClick={() => setSelectedEvent(event)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white rounded-full"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        You're Going!
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setSelectedEvent(event)}
                        className="w-full gradient-coral-blue text-white rounded-full hover:opacity-90"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Join This Adventure
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Event Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-charcoal">
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <img
              src={selectedEvent?.imageUrl ?? "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop"}
              alt={selectedEvent?.title}
              className="w-full h-48 object-cover rounded-xl"
            />

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-coral mt-1" />
                <div>
                  <div className="font-semibold text-charcoal">When</div>
                  <div className="text-gray-600">
                    {selectedEvent?.date &&
                      format(new Date(selectedEvent.date), "EEEE, MMMM d 'at' h:mm a")}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-electric-blue mt-1" />
                <div>
                  <div className="font-semibold text-charcoal">Where</div>
                  <div className="text-gray-600">{selectedEvent?.location}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-coral mt-1" />
                <div>
                  <div className="font-semibold text-charcoal">Mystery Hint</div>
                  <div className="text-gray-600 italic">{selectedEvent?.mysteryHint}</div>
                </div>
              </div>
            </div>

            <div className="bg-soft-pink rounded-xl p-4">
              <div className="font-bold text-charcoal mb-2 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Who&apos;s coming?
              </div>
              <p className="text-sm text-gray-700">
                You&apos;ll meet other FrienderBender members who share your vibe. Perfect
                for making new connections!
              </p>
            </div>
          </div>

          {selectedEvent && signedUpEventIds.has(selectedEvent.id) ? (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <div className="font-bold text-green-700">You're signed up!</div>
                  <div className="text-sm text-green-600">See you there 🎉</div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 rounded-full"
                >
                  Close
                </Button>
                <Button
                  onClick={() => router.push("/matches")}
                  className="flex-1 bg-coral hover:bg-coral/90 text-white rounded-full"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Invite a Match
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedEvent(null)}
                className="flex-1 rounded-full"
              >
                Maybe Later
              </Button>
              <Button
                onClick={() => {
                  if (selectedEvent) {
                    handleJoinEvent(selectedEvent.id);
                  }
                }}
                disabled={joinEvent.isPending}
                className="flex-1 gradient-coral-blue text-white rounded-full"
              >
                {joinEvent.isPending ? "Signing up..." : "Count Me In!"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
