"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Sparkles, Brain, Users, Car, Zap, MapPin, GraduationCap } from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function Landing() {
  const steps = [
    {
      icon: Brain,
      emoji: "🧠",
      title: "Take the quiz",
      description:
        "Tell us what makes you tick. Your interests, your vibe, your perfect Friday night.",
    },
    {
      icon: Users,
      emoji: "💬",
      title: "Get matched",
      description:
        "Our algorithm finds your friendship soulmate based on compatibility, not just common interests.",
    },
    {
      icon: Car,
      emoji: "🚗",
      title: "Mystery car ride",
      description:
        "Meet up for a surprise adventure. The destination? That's the fun part—you'll find out together.",
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-coral opacity-20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-electric-blue opacity-20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <motion.div
          className="max-w-4xl mx-auto text-center relative z-10"
          {...fadeInUp}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block mb-6"
          >
            <div className="gradient-coral-blue px-6 py-2 rounded-full text-white font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>Your Next Connection Starts Here</span>
            </div>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold text-charcoal mb-6 leading-tight">
            Find new friends.
            <br />
            Go on <span className="text-coral">mystery adventures</span>.
            <br />
            <span className="text-electric-blue">Your next connection</span>{" "}
            starts in a FrienderBender.
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
            More than swiping. Less than dating. Exactly what making friends IRL
            should be.
          </p>

          <Link href="/quiz">
            <Button className="bg-coral hover:bg-coral/90 text-white text-lg px-8 py-6 rounded-full shadow-2xl transform hover:scale-105 transition-all">
              <Sparkles className="w-5 h-5 mr-2" />
              Take the Friender Quiz
            </Button>
          </Link>

          <p className="text-sm text-gray-500 mt-4">
            Join others finding their vibe
          </p>
        </motion.div>
      </section>

      {/* For Young Adults Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="flex justify-center gap-4 mb-6">
              <div className="w-12 h-12 bg-coral/10 rounded-full flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-coral" />
              </div>
              <div className="w-12 h-12 bg-electric-blue/10 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-electric-blue" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
              Just graduated? New city? We get it.
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Moving somewhere new after college is exciting—but making friends
              as an adult? That&apos;s the hard part. FrienderBender is built for
              young adults like you who are ready to make new connections. No
              awkward networking events. No forced small talk. Just real
              connections with people who actually get your vibe.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">
              How FrienderBender Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to your next friendship adventure
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <Card className="p-8 text-center hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-transparent hover:border-coral">
                    <div className="w-20 h-20 mx-auto mb-6 gradient-pink-coral rounded-2xl flex items-center justify-center text-4xl transform hover:rotate-12 transition-transform">
                      {step.emoji}
                    </div>
                    <div className="text-coral font-bold text-sm mb-2">
                      STEP {index + 1}
                    </div>
                    <h3 className="text-2xl font-bold text-charcoal mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-charcoal text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <Zap className="w-16 h-16 text-coral mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to vibe IRL?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Let&apos;s find your partner-in-crime for the weekend. Take the quiz
            and see who you match with.
          </p>
          <Link href="/quiz">
            <Button className="bg-coral hover:bg-coral/90 text-white text-lg px-8 py-6 rounded-full shadow-2xl">
              Start Your Adventure
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 gradient-coral-blue rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">FrienderBender</span>
              </div>
              <p className="text-gray-400">
                Making real friendships through mystery adventures.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-coral transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-coral transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-coral transition-colors">
                    Safety
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-coral transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-coral transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-coral transition-colors">
                    TikTok
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-coral transition-colors">
                    Twitter
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            2025 FrienderBender. Friendship, but make it an adventure.
          </div>
        </div>
      </footer>
    </div>
  );
}
