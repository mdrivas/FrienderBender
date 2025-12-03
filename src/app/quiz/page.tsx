"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { Card } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { ArrowRight, ArrowLeft, Sparkles, Check } from "lucide-react";
import { api } from "~/trpc/react";
import LoadingSkeleton from "~/app/components/LoadingSkeleton";

interface MultiSelectOption {
  value: string;
  label: string;
  emoji: string;
  description?: string;
}

interface SingleSelectOption {
  value: string;
  label: string;
  description: string;
}

interface AvailabilityPreset {
  value: string;
  label: string;
  description: string;
}

interface QuizStep {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  options?: MultiSelectOption[] | SingleSelectOption[] | {
    presets: AvailabilityPreset[];
    customDays: string[];
    customTimes: string[];
  };
  maxSelections?: number;
  placeholder?: string;
}

const quizSteps: QuizStep[] = [
  {
    id: "interests",
    title: "What lights you up?",
    subtitle: "Pick all that vibe with you (at least 3)",
    type: "multi-select",
    options: [
      { value: "brunch", label: "Brunch & Coffee", emoji: "🥐" },
      { value: "hiking", label: "Hiking & Nature", emoji: "🥾" },
      { value: "concerts", label: "Concerts & Shows", emoji: "🎤" },
      { value: "gaming", label: "Video Games", emoji: "🎮" },
      { value: "fitness", label: "Gym & Fitness", emoji: "💪" },
      { value: "cooking", label: "Cooking & Restaurants", emoji: "👩‍🍳" },
      { value: "movies", label: "Movies & TV Binges", emoji: "🍿" },
      { value: "travel", label: "Weekend Trips", emoji: "✈️" },
      { value: "sports", label: "Playing Sports", emoji: "🏀" },
      { value: "art", label: "Museums & Art", emoji: "🎨" },
      { value: "nightlife", label: "Bars & Clubs", emoji: "🍸" },
      { value: "boardgames", label: "Board Game Nights", emoji: "🎲" },
    ] as MultiSelectOption[],
  },
  {
    id: "social_style",
    title: "How do you recharge?",
    subtitle: "After a long week, you'd rather...",
    type: "single-select",
    options: [
      { value: "solo", label: "Solo time first", description: "Recharge alone, then maybe see people" },
      { value: "small_group", label: "Hang with 1-2 close friends", description: "Quality over quantity" },
      { value: "big_group", label: "The bigger the better!", description: "Energy from being around people" },
      { value: "depends", label: "Honestly, it depends", description: "Could go either way" },
    ] as SingleSelectOption[],
  },
  {
    id: "friendship_values",
    title: "In a friendship, what matters most?",
    subtitle: "Pick your top 2",
    type: "multi-select-limited",
    maxSelections: 2,
    options: [
      { value: "reliability", label: "Reliability", emoji: "🤝", description: "Shows up when they say they will" },
      { value: "humor", label: "Humor", emoji: "😂", description: "Can make you laugh about anything" },
      { value: "depth", label: "Deep Talks", emoji: "💭", description: "Goes beyond surface-level" },
      { value: "adventure", label: "Spontaneity", emoji: "🎢", description: "Always down for something new" },
      { value: "support", label: "Emotional Support", emoji: "💗", description: "There through the hard stuff" },
      { value: "shared_interests", label: "Shared Hobbies", emoji: "🎯", description: "Same things excite you both" },
    ] as MultiSelectOption[],
  },
  {
    id: "communication_style",
    title: "How do you prefer to make plans?",
    subtitle: "Be honest—no wrong answers",
    type: "single-select",
    options: [
      { value: "texter", label: "Text me anytime", description: "I'm always on my phone" },
      { value: "planner", label: "Schedule in advance", description: "Put it on the calendar or it won't happen" },
      { value: "spontaneous", label: "Last minute is fine", description: "\"You free in 20?\" works for me" },
      { value: "low_maintenance", label: "Low maintenance friend", description: "We can go weeks without talking and pick right back up" },
    ] as SingleSelectOption[],
  },
  {
    id: "hangout_vibe",
    title: "What's your ideal hangout?",
    subtitle: "Select all that sound fun",
    type: "multi-select",
    options: [
      { value: "active", label: "Something Active", emoji: "🏃", description: "Hiking, sports, gym buddy" },
      { value: "chill", label: "Low-Key Hangs", emoji: "🛋️", description: "Netflix, wine, just talking" },
      { value: "explore", label: "Exploring the City", emoji: "🏙️", description: "New spots, hidden gems" },
      { value: "creative", label: "Creative Activities", emoji: "🎨", description: "Pottery, painting, cooking class" },
      { value: "nightout", label: "Night Out", emoji: "🌙", description: "Bars, clubs, concerts" },
      { value: "outdoors", label: "Outdoor Adventures", emoji: "⛰️", description: "Beach days, camping, road trips" },
    ] as MultiSelectOption[],
  },
  {
    id: "availability",
    title: "When are you usually free?",
    subtitle: "This helps us find people with matching schedules",
    type: "availability-improved",
    options: {
      presets: [
        { value: "weekday_evenings", label: "Weekday evenings", description: "After work drinks/activities" },
        { value: "weekends", label: "Weekends", description: "Saturday & Sunday anytime" },
        { value: "flexible", label: "Pretty flexible", description: "Can make most times work" },
        { value: "busy", label: "Limited but I'll make it work", description: "Schedule is packed but friendship is priority" },
      ],
      customDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      customTimes: ["Morning", "Afternoon", "Evening", "Late Night"],
    },
  },
  {
    id: "dealbreakers",
    title: "Any dealbreakers?",
    subtitle: "Pick any that would be a hard no (optional)",
    type: "multi-select-optional",
    options: [
      { value: "flaky", label: "Flaky people", emoji: "👻" },
      { value: "negative", label: "Constant negativity", emoji: "😤" },
      { value: "competitive", label: "Too competitive", emoji: "🏆" },
      { value: "drama", label: "Drama seekers", emoji: "🎭" },
      { value: "none", label: "I'm pretty easygoing", emoji: "😎" },
    ] as MultiSelectOption[],
  },
  {
    id: "bio",
    title: "One last thing—introduce yourself!",
    subtitle: "What should your future friend know about you?",
    type: "textarea",
    placeholder: "I just moved here from Chicago, work in marketing, and I'm on a mission to find the best tacos in the city. I have strong opinions about coffee and weak opinions about most everything else...",
  },
];

interface Answers {
  interests: string[];
  social_style: string;
  friendship_values: string[];
  communication_style: string;
  hangout_vibe: string[];
  availability: { preset: string; customDays: string[]; customTimes: string[] };
  dealbreakers: string[];
  bio: string;
}

export default function Quiz() {
  const router = useRouter();
  const { status } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [showCustomAvailability, setShowCustomAvailability] = useState(false);
  const [answers, setAnswers] = useState<Answers>({
    interests: [],
    social_style: "",
    friendship_values: [],
    communication_style: "",
    hangout_vibe: [],
    availability: { preset: "", customDays: [], customTimes: [] },
    dealbreakers: [],
    bio: "",
  });

  // Check if user already completed quiz
  const { data: existingQuiz, isLoading: quizLoading } = api.quiz.getMyQuiz.useQuery(
    undefined,
    { enabled: status === "authenticated" }
  );

  const submitQuiz = api.quiz.submit.useMutation({
    onSuccess: () => {
      router.push("/matches");
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      void signIn(undefined, { callbackUrl: "/quiz" });
    }
  }, [status]);

  // Redirect to matches if quiz already completed
  useEffect(() => {
    if (existingQuiz) {
      router.push("/matches");
    }
  }, [existingQuiz, router]);

  if (status === "loading" || status === "unauthenticated" || quizLoading || existingQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSkeleton message="Checking your vibe..." />
      </div>
    );
  }

  const progress = ((currentStep + 1) / quizSteps.length) * 100;

  const handleMultiSelect = (stepId: keyof Answers, value: string, maxSelections?: number) => {
    const current = answers[stepId] as string[];
    if (current.includes(value)) {
      setAnswers(prev => ({ ...prev, [stepId]: current.filter(v => v !== value) }));
    } else if (!maxSelections || current.length < maxSelections) {
      setAnswers(prev => ({ ...prev, [stepId]: [...current, value] }));
    }
  };

  const handleSingleSelect = (stepId: keyof Answers, value: string) => {
    setAnswers(prev => ({ ...prev, [stepId]: value }));
  };

  const canProceed = (): boolean => {
    const step = quizSteps[currentStep]!;

    switch (step.type) {
      case "multi-select":
        return answers[step.id as keyof Answers] !== undefined &&
               (answers[step.id as keyof Answers] as string[]).length >= 1;
      case "multi-select-limited":
        return answers[step.id as keyof Answers] !== undefined &&
               (answers[step.id as keyof Answers] as string[]).length === step.maxSelections;
      case "multi-select-optional":
        return true; // Optional, can always proceed
      case "single-select":
        return (answers[step.id as keyof Answers] as string).length > 0;
      case "availability-improved":
        return answers.availability.preset !== "" ||
               (answers.availability.customDays.length > 0 && answers.availability.customTimes.length > 0);
      case "textarea":
        return answers.bio.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < quizSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (status !== "authenticated") {
      void signIn();
      return;
    }

    submitQuiz.mutate({
      interests: answers.interests,
      socialStyle: answers.social_style,
      friendshipValues: answers.friendship_values,
      communicationStyle: answers.communication_style,
      hangoutVibe: answers.hangout_vibe,
      availability: answers.availability,
      dealbreakers: answers.dealbreakers,
      bio: answers.bio,
    });
  };

  const isLastStep = currentStep === quizSteps.length - 1;
  const step = quizSteps[currentStep]!;

  const renderMultiSelect = (options: MultiSelectOption[], stepId: string, maxSelections?: number) => {
    const selected = answers[stepId as keyof Answers] as string[];
    const hasDescriptions = options.some(o => o.description);

    return (
      <div className={hasDescriptions ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "grid grid-cols-2 md:grid-cols-4 gap-4"}>
        {options.map((option, index) => {
          const isSelected = selected.includes(option.value);
          const isDisabled = maxSelections && !isSelected && selected.length >= maxSelections;

          return (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <div
                onClick={() => !isDisabled && handleMultiSelect(stepId as keyof Answers, option.value, maxSelections)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all transform hover:scale-105 ${
                  isSelected
                    ? "border-coral bg-coral/10 shadow-lg"
                    : isDisabled
                    ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                    : "border-gray-200 hover:border-coral/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{option.emoji}</div>
                  <div className="flex-1">
                    <div className="font-medium text-charcoal">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-gray-500">{option.description}</div>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-coral" />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderSingleSelect = (options: SingleSelectOption[], stepId: string) => {
    const selected = answers[stepId as keyof Answers] as string;

    return (
      <div className="space-y-4">
        {options.map((option, index) => {
          const isSelected = selected === option.value;

          return (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                onClick={() => handleSingleSelect(stepId as keyof Answers, option.value)}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-coral bg-coral/10 shadow-lg"
                    : "border-gray-200 hover:border-coral/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-lg text-charcoal mb-1">{option.label}</div>
                    <div className="text-gray-600">{option.description}</div>
                  </div>
                  {isSelected && <Check className="w-6 h-6 text-coral" />}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderAvailability = () => {
    const opts = step.options as { presets: AvailabilityPreset[]; customDays: string[]; customTimes: string[] };

    return (
      <div className="space-y-6">
        {/* Presets */}
        <div className="space-y-3">
          {opts.presets.map((preset, index) => {
            const isSelected = answers.availability.preset === preset.value;

            return (
              <motion.div
                key={preset.value}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  onClick={() => {
                    setAnswers(prev => ({
                      ...prev,
                      availability: { ...prev.availability, preset: preset.value }
                    }));
                    setShowCustomAvailability(false);
                  }}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-coral bg-coral/10 shadow-lg"
                      : "border-gray-200 hover:border-coral/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-charcoal">{preset.label}</div>
                      <div className="text-sm text-gray-600">{preset.description}</div>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-coral" />}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Custom toggle */}
        <div className="pt-4 border-t">
          <button
            onClick={() => {
              setShowCustomAvailability(!showCustomAvailability);
              if (!showCustomAvailability) {
                setAnswers(prev => ({
                  ...prev,
                  availability: { ...prev.availability, preset: "" }
                }));
              }
            }}
            className="text-electric-blue font-medium hover:underline"
          >
            {showCustomAvailability ? "Hide custom options" : "Or pick specific days & times"}
          </button>
        </div>

        {/* Custom selection */}
        {showCustomAvailability && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-4"
          >
            <div>
              <h4 className="font-medium text-charcoal mb-2">Days</h4>
              <div className="flex flex-wrap gap-2">
                {opts.customDays.map(day => {
                  const isSelected = answers.availability.customDays.includes(day);
                  return (
                    <div
                      key={day}
                      onClick={() => {
                        const current = answers.availability.customDays;
                        const newDays = current.includes(day)
                          ? current.filter(d => d !== day)
                          : [...current, day];
                        setAnswers(prev => ({
                          ...prev,
                          availability: { ...prev.availability, customDays: newDays, preset: "" }
                        }));
                      }}
                      className={`px-4 py-2 rounded-full border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-coral bg-coral text-white"
                          : "border-gray-200 hover:border-coral"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-charcoal mb-2">Times</h4>
              <div className="flex flex-wrap gap-2">
                {opts.customTimes.map(time => {
                  const isSelected = answers.availability.customTimes.includes(time);
                  return (
                    <div
                      key={time}
                      onClick={() => {
                        const current = answers.availability.customTimes;
                        const newTimes = current.includes(time)
                          ? current.filter(t => t !== time)
                          : [...current, time];
                        setAnswers(prev => ({
                          ...prev,
                          availability: { ...prev.availability, customTimes: newTimes, preset: "" }
                        }));
                      }}
                      className={`px-4 py-2 rounded-full border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-electric-blue bg-electric-blue text-white"
                          : "border-gray-200 hover:border-electric-blue"
                      }`}
                    >
                      {time}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-charcoal">
              Question {currentStep + 1} of {quizSteps.length}
            </span>
            <span className="text-sm font-medium text-coral">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-soft-pink" />
        </motion.div>

        {/* Quiz step */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 md:p-12 bg-white shadow-xl border-2 border-transparent hover:border-coral transition-all">
              <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-3">
                {step.title}
              </h2>
              <p className="text-lg text-gray-600 mb-8">{step.subtitle}</p>

              {/* Multi-select */}
              {step.type === "multi-select" &&
                renderMultiSelect(step.options as MultiSelectOption[], step.id)}

              {/* Multi-select limited */}
              {step.type === "multi-select-limited" &&
                renderMultiSelect(step.options as MultiSelectOption[], step.id, step.maxSelections)}

              {/* Multi-select optional */}
              {step.type === "multi-select-optional" &&
                renderMultiSelect(step.options as MultiSelectOption[], step.id)}

              {/* Single select */}
              {step.type === "single-select" &&
                renderSingleSelect(step.options as SingleSelectOption[], step.id)}

              {/* Improved Availability */}
              {step.type === "availability-improved" && renderAvailability()}

              {/* Textarea */}
              {step.type === "textarea" && (
                <Textarea
                  value={answers.bio}
                  onChange={(e) => setAnswers(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder={step.placeholder}
                  className="min-h-[200px] text-lg p-4 border-2 border-gray-200 focus:border-coral rounded-2xl"
                />
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {!isLastStep ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-coral hover:bg-coral/90 text-white rounded-full px-8"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || submitQuiz.isPending}
              className="bg-coral hover:bg-coral/90 text-white rounded-full px-8"
            >
              {submitQuiz.isPending ? (
                "Finding Your Matches..."
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  See My Matches
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
