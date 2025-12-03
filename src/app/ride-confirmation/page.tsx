"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import Link from "next/link";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { CheckCircle, Users, MapPin, Calendar, Sparkles, MessageCircle } from "lucide-react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";

export default function RideConfirmation() {
  const { status } = useSession();

  const { data: booking, isLoading } = api.ride.getLatest.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-64 w-full mb-6" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="p-8 text-center max-w-md">
          <Calendar className="w-16 h-16 text-coral mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-charcoal mb-4">No events yet</h2>
          <p className="text-gray-600 mb-6">
            Browse events and sign up for your first adventure!
          </p>
          <Link href="/events">
            <Button className="bg-coral hover:bg-coral/90 text-white rounded-full">
              Browse Events
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const event = booking.event;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Success animation */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block"
            >
              <div className="w-24 h-24 gradient-coral-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-3">
              You&apos;re in! 🎉
            </h1>
            <p className="text-xl text-gray-600">
              Get ready for an unforgettable adventure
            </p>
          </div>

          {/* Event details card */}
          <Card className="p-8 mb-6 bg-white shadow-2xl border-2 border-coral/20">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-charcoal mb-2">{event.title}</h2>
                <div className="inline-block bg-soft-pink px-4 py-1 rounded-full">
                  <span className="text-coral font-semibold">Mystery Adventure</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 gradient-pink-coral rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-charcoal">When</div>
                    <div className="text-gray-600">
                      {format(new Date(event.date), "EEEE, MMMM d 'at' h:mm a")}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 gradient-coral-blue rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-charcoal">Where</div>
                    <div className="text-gray-600">{event.location}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-charcoal">Mystery Hint</div>
                    <div className="text-gray-600 italic">{event.mysteryHint}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Invite a match card */}
          <Card className="p-6 mb-6 bg-gradient-to-r from-coral to-electric-blue text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold">Going solo or with a friend?</div>
                  <div className="text-sm text-white/80">Invite one of your matches to join!</div>
                </div>
              </div>
              <Link href="/matches">
                <Button className="bg-white text-coral hover:bg-gray-100">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Invite Match
                </Button>
              </Link>
            </div>
          </Card>

          {/* Info card */}
          <Card className="p-6 bg-soft-pink border-2 border-coral/30 mb-6">
            <h3 className="font-bold text-charcoal mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-coral" />
              What happens next?
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="text-coral font-bold">•</span>
                <span>We&apos;ll send you a reminder the day before the event</span>
              </li>
              <li className="flex gap-2">
                <span className="text-coral font-bold">•</span>
                <span>Meet up with other FrienderBender members at the venue</span>
              </li>
              <li className="flex gap-2">
                <span className="text-coral font-bold">•</span>
                <span>Make new friends and enjoy the adventure together!</span>
              </li>
            </ul>
          </Card>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/matches" className="flex-1">
              <Button
                variant="outline"
                className="w-full rounded-full border-2 border-coral text-coral hover:bg-coral hover:text-white"
              >
                View My Matches
              </Button>
            </Link>
            <Link href="/events" className="flex-1">
              <Button className="w-full gradient-coral-blue text-white rounded-full">
                Browse More Events
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
