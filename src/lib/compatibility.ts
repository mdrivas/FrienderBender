// Calculate real compatibility score between two quiz responses

export interface QuizData {
  interests?: string[];
  socialStyle?: string | null;
  friendshipValues?: string[];
  communicationStyle?: string | null;
  hangoutVibe?: string[];
  dealbreakers?: string[];
}

export function calculateCompatibility(myQuiz: QuizData | null, theirQuiz: QuizData | null): number {
  if (!myQuiz || !theirQuiz) return 50; // Default if no quiz data

  let score = 0;
  let maxScore = 0;

  // 1. Shared interests (weight: 25%)
  const myInterests = myQuiz.interests ?? [];
  const theirInterests = theirQuiz.interests ?? [];
  const sharedInterests = myInterests.filter((i) => theirInterests.includes(i));
  const totalInterests = new Set([...myInterests, ...theirInterests]).size;

  if (totalInterests > 0) {
    // Bonus for having 3+ shared interests
    const interestRatio = sharedInterests.length / totalInterests;
    const bonusMultiplier = sharedInterests.length >= 3 ? 1.2 : 1;
    score += Math.min(interestRatio * bonusMultiplier, 1) * 25;
  }
  maxScore += 25;

  // 2. Social style compatibility (weight: 20%)
  const socialScore = getSocialStyleCompatibility(
    myQuiz.socialStyle,
    theirQuiz.socialStyle
  );
  score += socialScore * 20;
  maxScore += 20;

  // 3. Friendship values overlap (weight: 20%)
  const myValues = myQuiz.friendshipValues ?? [];
  const theirValues = theirQuiz.friendshipValues ?? [];
  const sharedValues = myValues.filter((v) => theirValues.includes(v));

  if (myValues.length > 0 && theirValues.length > 0) {
    // Having at least 1 shared value = good, 2 = great
    score += (sharedValues.length / 2) * 20;
  }
  maxScore += 20;

  // 4. Communication style match (weight: 15%)
  const commScore = getCommunicationCompatibility(
    myQuiz.communicationStyle,
    theirQuiz.communicationStyle
  );
  score += commScore * 15;
  maxScore += 15;

  // 5. Hangout vibe overlap (weight: 15%)
  const myVibes = myQuiz.hangoutVibe ?? [];
  const theirVibes = theirQuiz.hangoutVibe ?? [];
  const sharedVibes = myVibes.filter((v) => theirVibes.includes(v));
  const totalVibes = new Set([...myVibes, ...theirVibes]).size;

  if (totalVibes > 0) {
    score += (sharedVibes.length / totalVibes) * 15;
  }
  maxScore += 15;

  // 6. Dealbreaker check (weight: 5% bonus or -10% penalty)
  const dealbreakersScore = checkDealbreakers(myQuiz, theirQuiz);
  score += dealbreakersScore;
  maxScore += 5;

  // Calculate percentage (minimum 35% so no one feels bad, max 98%)
  const rawPercent = Math.round((score / maxScore) * 100);
  return Math.max(35, Math.min(98, rawPercent));
}

function getSocialStyleCompatibility(s1: string | null | undefined, s2: string | null | undefined): number {
  if (!s1 || !s2) return 0.5;

  // Same social style = great match
  if (s1 === s2) return 1;

  // "depends" matches well with everyone
  if (s1 === "depends" || s2 === "depends") return 0.85;

  // Small group matches well with solo (both prefer intimate settings)
  if ((s1 === "solo" && s2 === "small_group") || (s1 === "small_group" && s2 === "solo")) {
    return 0.75;
  }

  // Big group + solo = potential mismatch
  if ((s1 === "solo" && s2 === "big_group") || (s1 === "big_group" && s2 === "solo")) {
    return 0.4;
  }

  // Small group + big group = can work
  return 0.6;
}

function getCommunicationCompatibility(c1: string | null | undefined, c2: string | null | undefined): number {
  if (!c1 || !c2) return 0.5;

  // Same style = perfect
  if (c1 === c2) return 1;

  // Low maintenance pairs well with everyone (they're flexible)
  if (c1 === "low_maintenance" || c2 === "low_maintenance") return 0.85;

  // Texter + spontaneous = both are responsive, good match
  if ((c1 === "texter" && c2 === "spontaneous") || (c1 === "spontaneous" && c2 === "texter")) {
    return 0.8;
  }

  // Planner + spontaneous = some friction
  if ((c1 === "planner" && c2 === "spontaneous") || (c1 === "spontaneous" && c2 === "planner")) {
    return 0.5;
  }

  // Default decent compatibility
  return 0.65;
}

function checkDealbreakers(myQuiz: QuizData, theirQuiz: QuizData): number {
  const myDealbreakers = myQuiz.dealbreakers ?? [];
  const theirDealbreakers = theirQuiz.dealbreakers ?? [];

  // If either has "none" as dealbreaker, they're easygoing - bonus!
  if (myDealbreakers.includes("none") || theirDealbreakers.includes("none")) {
    return 5;
  }

  // Check for potential conflicts based on communication/social styles
  let penalty = 0;

  // If I hate flaky people and they're spontaneous/low_maintenance, slight concern
  if (myDealbreakers.includes("flaky") &&
      (theirQuiz.communicationStyle === "spontaneous" || theirQuiz.communicationStyle === "low_maintenance")) {
    penalty -= 2;
  }

  // Same check in reverse
  if (theirDealbreakers.includes("flaky") &&
      (myQuiz.communicationStyle === "spontaneous" || myQuiz.communicationStyle === "low_maintenance")) {
    penalty -= 2;
  }

  // No conflicts found
  if (penalty === 0) return 3;

  return Math.max(-10, penalty);
}

export function getSharedInterests(myQuiz: QuizData | null, theirQuiz: QuizData | null): string[] {
  if (!myQuiz?.interests || !theirQuiz?.interests) return [];
  return myQuiz.interests.filter((i) => theirQuiz.interests!.includes(i));
}

export function getVibeMatch(myQuiz: QuizData | null, theirQuiz: QuizData | null): string | null {
  if (!myQuiz?.hangoutVibe || !theirQuiz?.hangoutVibe) return null;
  const shared = myQuiz.hangoutVibe.filter((v) => theirQuiz.hangoutVibe!.includes(v));
  return shared[0] ?? null;
}

// Helper to get a friendly description of why they match
export function getMatchReason(myQuiz: QuizData | null, theirQuiz: QuizData | null): string {
  if (!myQuiz || !theirQuiz) return "You might vibe well together!";

  const sharedInterests = getSharedInterests(myQuiz, theirQuiz);
  const sharedVibes = (myQuiz.hangoutVibe ?? []).filter(v => (theirQuiz.hangoutVibe ?? []).includes(v));
  const sharedValues = (myQuiz.friendshipValues ?? []).filter(v => (theirQuiz.friendshipValues ?? []).includes(v));

  if (sharedInterests.length >= 3) {
    return `You share ${sharedInterests.length} interests!`;
  }

  if (sharedValues.length >= 2) {
    return "You value the same things in friendship";
  }

  if (sharedVibes.length >= 2) {
    return "You're looking for the same kind of hangouts";
  }

  if (myQuiz.socialStyle === theirQuiz.socialStyle) {
    return "Similar social energy";
  }

  return "Great potential for a friendship!";
}
