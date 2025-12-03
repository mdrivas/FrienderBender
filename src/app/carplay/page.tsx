"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { ArrowRight, Sparkles, Heart } from "lucide-react";

const prompts = [
  {
    id: 1,
    emoji: "🎤",
    question: "What's your go-to karaoke song?",
    subtitle: "Even if you can't sing, what do you belt out?",
    background: "from-pink-400 to-rose-500",
  },
  {
    id: 2,
    emoji: "🌅",
    question: "Finish the sentence: My perfect weekend involves...",
    subtitle: "No wrong answers—just your vibe",
    background: "from-blue-400 to-cyan-500",
  },
  {
    id: 3,
    emoji: "🍕",
    question: "What's a food opinion that might be controversial?",
    subtitle: "Pineapple on pizza? Hot dog is a sandwich?",
    background: "from-orange-400 to-amber-500",
  },
  {
    id: 4,
    emoji: "🎬",
    question: "What movie/show could you watch on repeat?",
    subtitle: "Comfort content hits different",
    background: "from-purple-400 to-violet-500",
  },
  {
    id: 5,
    emoji: "✈️",
    question: "If you could teleport anywhere right now, where?",
    subtitle: "Real place, fictional world, or your couch",
    background: "from-green-400 to-emerald-500",
  },
  {
    id: 6,
    emoji: "🎨",
    question: "What's something you're weirdly good at?",
    subtitle: "Hidden talents welcome",
    background: "from-red-400 to-pink-500",
  },
  {
    id: 7,
    emoji: "☕",
    question: "Coffee, tea, or something else to start your day?",
    subtitle: "And how do you take it?",
    background: "from-yellow-400 to-orange-500",
  },
  {
    id: 8,
    emoji: "🎮",
    question: "What's your comfort activity after a long day?",
    subtitle: "Gaming? Reading? Scrolling? All valid.",
    background: "from-indigo-400 to-blue-500",
  },
];

export default function CarPlay() {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const currentPrompt = prompts[currentPromptIndex]!;

  const handleNext = () => {
    setDirection(1);
    setCurrentPromptIndex((prev) => (prev + 1) % prompts.length);
  };

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentPromptIndex((prev) => (prev - 1 + prompts.length) % prompts.length);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-4">
            <Sparkles className="w-5 h-5 text-coral" />
            <span className="font-bold text-charcoal">FrienderBender Ice Breaker</span>
          </div>
          <p className="text-gray-600">
            Break the ice with your ride buddy—one question at a time
          </p>
        </motion.div>

        {/* Prompt card */}
        <div className="relative h-[500px] mb-8">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentPrompt.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0"
            >
              <Card
                className={`h-full bg-gradient-to-br ${currentPrompt.background} p-12 flex flex-col items-center justify-center text-center border-4 border-white shadow-2xl`}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="text-8xl mb-8"
                >
                  {currentPrompt.emoji}
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-4xl font-bold text-white mb-4 px-4"
                >
                  {currentPrompt.question}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-white/90 px-4"
                >
                  {currentPrompt.subtitle}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                >
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-semibold">
                    {currentPromptIndex + 1} / {prompts.length}
                  </div>
                </motion.div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={handlePrevious}
            variant="outline"
            size="lg"
            className="rounded-full px-8 bg-white hover:bg-gray-50"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            size="lg"
            className="rounded-full px-8 gradient-coral-blue text-white hover:opacity-90"
          >
            Next Prompt
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Helper text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8"
        >
          <Card className="inline-block bg-white/80 backdrop-blur-sm px-6 py-3 shadow-lg">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Heart className="w-4 h-4 text-coral" />
              Take turns answering! No rush—just have fun getting to know each other.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
