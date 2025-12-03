# FrienderBender

## What is FrienderBender?

FrienderBender is a friend-matching app designed for young adults (20s-30s) who have recently graduated college or moved to a new city. Making friends as an adult is hard - this app solves that by matching people based on compatibility and organizing fun group activities.

**Tagline:** "More than swiping. Less than dating. Exactly what making friends IRL should be."

## Target Audience

- Recent college graduates entering the workforce
- Young professionals who moved to a new city
- People in their 20s-30s looking to expand their social circle
- Anyone who finds traditional networking events awkward

## Core Features

### 1. Friendship Quiz
Users take a personality quiz that captures:
- **Interests**: Sports, arts, gaming, outdoors, foodie, nightlife, fitness, music, tech, travel, reading, volunteering
- **Personality Type**: Introvert, extrovert, or ambivert
- **Spontaneity Level**: Spontaneous, planner, or flexible
- **Event Vibes**: Chill hangouts, adventure activities, group dinners, game nights, outdoor exploration, creative workshops
- **Availability**: Weekday mornings/afternoons/evenings, weekend options
- **Bio**: Short personal description

### 2. Compatibility Matching
The app uses a matching algorithm that calculates compatibility based on:
- Shared interests (weighted by number of common interests)
- Complementary personality types
- Similar spontaneity preferences
- Overlapping event vibe preferences

Users see their top matches with compatibility scores (e.g., "87% compatible").

### 3. Events & Activities
Curated events across categories:
- **Chill**: Coffee meetups, park hangs, casual dinners
- **Adventure**: Hiking, escape rooms, kayaking
- **Social**: Game nights, trivia, group dinners
- **Creative**: Art classes, cooking workshops, pottery

Users can browse events and book rides to attend with their matches.

### 4. Mystery Car Rides
The signature feature - users get matched and go on a "mystery adventure" together:
- Book a ride to an event
- Get paired with a compatible match
- Destination is revealed during the ride
- Built-in ice breakers for the car ride

### 5. CarPlay Ice Breakers
Interactive prompts for the car ride to break the ice:
- "What's the most spontaneous thing you've done?"
- "If you could live anywhere for a year, where?"
- "What's your go-to karaoke song?"

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom color palette
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Drizzle ORM
- **API**: tRPC for type-safe endpoints
- **Auth**: NextAuth.js with Google OAuth

## Database Schema

### Tables
- `users` - NextAuth user accounts
- `accounts` - OAuth account links
- `sessions` - User sessions
- `profiles` - Extended user profile (bio, interests, quiz completion status)
- `quizResponses` - User quiz answers (interests, personality, spontaneity, etc.)
- `events` - Available activities/events
- `matches` - User-to-user matches with compatibility scores
- `rideBookings` - Event ride reservations

## Brand Colors

- **Coral**: `#FF6B6B` - Primary action color
- **Soft Pink**: `#FFD6D6` - Backgrounds, accents
- **Electric Blue**: `#4FACF7` - Secondary highlights
- **Cream**: `#FFF7F1` - Light backgrounds
- **Charcoal**: `#2C3E50` - Text, dark sections

## Key Pages

1. **Landing** (`/`) - Hero, how it works, CTA
2. **Sign In** (`/auth/signin`) - Google OAuth login
3. **Quiz** (`/quiz`) - 6-step onboarding quiz
4. **Matches** (`/matches`) - View compatible users
5. **Events** (`/events`) - Browse and book activities
6. **Profile** (`/profile`) - Edit user profile
7. **CarPlay** (`/carplay`) - Ice breaker prompts
8. **Ride Confirmation** (`/ride-confirmation`) - Booking success page

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/signin/        # Sign-in page
│   ├── carplay/            # Ice breaker game
│   ├── events/             # Event browsing
│   ├── matches/            # Match list
│   ├── profile/            # User profile
│   ├── quiz/               # Onboarding quiz
│   └── ride-confirmation/  # Booking confirmation
├── components/ui/          # shadcn/ui components
├── lib/                    # Utilities (compatibility algorithm)
├── server/
│   ├── api/routers/        # tRPC routers (profile, quiz, event, ride)
│   ├── auth.ts             # NextAuth configuration
│   └── db/schema.ts        # Drizzle database schema
└── styles/globals.css      # Global styles, CSS variables
```

## Environment Variables

Required in `.env`:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Session encryption key
- `NEXTAUTH_URL` - App URL (http://localhost:3000 for dev)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

## Running the App

```bash
npm install          # Install dependencies
npm run db:push      # Push schema to database
npm run dev          # Start dev server at localhost:3000
```

## Key User Flows

### New User Flow
1. Land on homepage → Click "Take the Friender Quiz"
2. Redirected to sign in → Sign in with Google
3. Take 6-step quiz → Submit responses
4. View matches → Browse compatible users
5. Browse events → Book a ride to an event
6. CarPlay → Use ice breakers during the ride

### Returning User Flow
1. Sign in → Go directly to matches or events
2. Update profile if needed
3. Book new events, meet new people
