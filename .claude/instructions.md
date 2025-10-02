# StoryWeaver - Simple Collaborative Story App

## What This App Does
Users submit short phrases (max 10 words), vote on their favorites, and the winning phrase generates a short animated video clip. Videos stack up episode-by-episode to create a collaborative animated story.

## Core User Flow (Keep It Simple!)
1. **Land on app** → See current story and latest episode
2. **Submit phrase** → Simple text input (up to 10 words)
3. **Vote** → Tap heart/upvote on favorite phrases
4. **Wait** → Timer shows when next episode arrives
5. **Watch** → New episode auto-plays when ready

---

## Technical Stack
- **Next.js 15** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS** (mobile-first utility classes)
- **Supabase** (PostgreSQL + realtime subscriptions)
- **Zustand** (lightweight state management)
- **React Player** (video playback)
- **Framer Motion** (smooth animations)

---

## Development Principles

### 1. Mobile-First Always
- Design for 375px width first, scale up
- Thumb-friendly zones (main actions in bottom 1/3)
- Minimum touch target: **48x48px**
- Test at breakpoints: 375px, 768px, 1024px
- Fast load: < 2 seconds on 3G

### 2. Anonymous & Simple
- No authentication/login required
- Track users via localStorage (add fingerprinting only if needed)
- One submission per session per browser
- Privacy-first: minimal data collection

### 3. Instant Feedback
- Optimistic UI updates (don't wait for server)
- Live vote counts via Supabase subscriptions
- Loading skeletons for async content
- Clear error messages in plain language

### 4. Progressive Disclosure
- Show one primary action at a time
- Don't overwhelm with features
- Guide new users with simple 3-step onboarding
- Use visual hierarchy to emphasize key actions

---

## Code Standards

### TypeScript
- Strict mode enabled (no `any` unless critical)
- Functional components + hooks only
- Descriptive variable names (no single letters except `i`, `x`, `y`)
- Always handle async errors gracefully

### File Organization
```
src/
  app/
    api/              # Next.js API routes (REST endpoints)
      episodes/
      stories/
      submissions/
      votes/
    page.tsx          # Main app page
    layout.tsx        # Root layout

  components/
    story/            # Story viewing components
    video/            # Video player components
    voting/           # Voting UI components

  lib/                # Utilities & services
    anonymousAuth.ts
    storyManager.ts
    validation.ts
    votingSession.ts
    supabase.ts

  types/              # TypeScript definitions
    database.ts
```

### Styling
- **Tailwind only** (no custom CSS files)
- Mobile-first responsive classes (`sm:`, `md:`, `lg:`)
- Use design system colors consistently
- Avoid inline styles (use Tailwind utilities)

### Component Structure
```tsx
// Good component structure
export function ComponentName() {
  // 1. Hooks at top
  const [state, setState] = useState()

  // 2. Derived values
  const computed = useMemo(() => ...)

  // 3. Handlers
  const handleAction = () => {}

  // 4. Effects
  useEffect(() => {}, [])

  // 5. Early returns for loading/error states
  if (loading) return <Skeleton />
  if (error) return <ErrorMessage />

  // 6. Main render
  return <div>...</div>
}
```

---

## Database Schema (Simplified)

### Core Tables

#### submissions
```sql
- id (UUID, PK)
- phrase (TEXT) -- Full submission up to 10 words
- word_count (INT)
- session_date (DATE)
- session_time (INT) -- 0=8am, 1=10am, 2=12pm, 3=2pm
- anonymous_user_id (UUID)
- votes (INT, default 0)
- created_at (TIMESTAMP)
```

#### votes
```sql
- id (UUID, PK)
- submission_id (UUID, FK)
- anonymous_user_id (UUID)
- session_date (DATE)
- session_time (INT)
- created_at (TIMESTAMP)
- UNIQUE(anonymous_user_id, session_date, session_time)
```

#### stories
```sql
- id (UUID, PK)
- story_number (INT, unique)
- title (TEXT)
- total_duration_seconds (INT)
- episode_count (INT)
- is_complete (BOOLEAN)
- created_at (TIMESTAMP)
```

#### episodes
```sql
- id (UUID, PK)
- story_id (UUID, FK)
- episode_number (INT)
- video_url (TEXT)
- duration_seconds (INT) -- 10-20 seconds
- winning_phrase (TEXT)
- created_at (TIMESTAMP)
```

### Database Conventions
- Use `snake_case` for all column names
- Always include `created_at` timestamp
- Use UUIDs for primary keys
- Add indexes on frequently queried columns
- Use transactions for multi-table operations

---

## Business Rules (MVP)

### Phrase Submission
- **Max 10 words** per submission
- **Max 30 characters** per individual word
- **One submission per user per session**
- Validate on both client and server
- Show real-time word/character count

### Voting Rules
- Vote on any phrase except your own
- One vote per user per session
- Show live vote counts (Supabase realtime)
- Can change vote before session ends

### Voting Sessions (Start Simple)
- **MVP: 1 session per day** at a fixed time
- Session lasts 2 hours
- After session: generate video from winning phrase
- Future: expand to 4 daily sessions (8am, 10am, 12pm, 2pm)

### Story & Episodes
- Each episode: 10-20 seconds
- Story completes at: 7-9 minutes total
- Auto-start new story when current completes
- Show progress bar (% toward completion)

### Video Handling
- Use placeholder videos during development
- Lazy load videos not in viewport
- Show thumbnail before video loads
- Handle loading errors gracefully
- Auto-play new episode when ready

---

## User Experience Guidelines

### First-Time User Experience
```
Landing Screen:
┌─────────────────────────┐
│  🎬 StoryWeaver         │
│                         │
│  [Latest Episode Video] │
│                         │
│  "Help create the next  │
│   episode!"             │
│                         │
│  [ How It Works ]       │
│  [ Submit Phrase ]      │
└─────────────────────────┘

How It Works (3 steps):
1. 💬 Submit a phrase (up to 10 words)
2. 🗳️ Vote for your favorite
3. 🎥 Watch the winning phrase become a video!
```

### Visual Hierarchy
1. **Primary action**: Large CTA button (Submit/Vote)
2. **Current state**: Timer + session status
3. **Secondary info**: Vote counts, episode list
4. **Tertiary**: Settings, help, about

### Loading States
- Skeleton loaders for content
- Spinner for actions (submitting, voting)
- Progress bar for video loading
- Optimistic updates where possible

### Error Handling
```tsx
// Good: User-friendly messages
"Oops! Couldn't submit your phrase. Try again?"

// Bad: Technical jargon
"Error 500: Internal server error in POST /api/submissions"
```

### Accessibility
- Minimum contrast ratio: 4.5:1
- Keyboard navigation support
- Screen reader friendly labels
- Focus indicators on interactive elements
- Skip to main content link

---

## API Design

### Endpoint Structure
```
GET  /api/stories         # Get current/past stories
GET  /api/episodes        # Get episodes for a story
POST /api/submissions     # Submit a phrase
POST /api/votes          # Cast a vote
GET  /api/votes/results  # Get current voting results
```

### Response Format
```typescript
// Success
{ data: T, error: null }

// Error
{ data: null, error: { message: string, code?: string } }
```

### Validation
- Validate on client (immediate feedback)
- Validate on server (security)
- Use Zod schemas for both
- Return specific error messages

### Rate Limiting
- One submission per session per user
- Prevent spam voting (debounce client-side)
- Server-side rate limiting on write endpoints
- Return 429 status for rate limit exceeded

---

## State Management

### Zustand Store Structure
```typescript
interface AppStore {
  // User state
  anonymousUserId: string | null
  hasSubmittedThisSession: boolean
  hasVotedThisSession: boolean

  // Session state
  currentSession: VotingSession | null
  timeRemaining: number

  // Content state
  currentStory: Story | null
  episodes: Episode[]
  submissions: Submission[]

  // Actions
  submitPhrase: (phrase: string) => Promise<void>
  castVote: (submissionId: string) => Promise<void>
  fetchCurrentSession: () => Promise<void>
}
```

### When to Use Zustand vs Props
- **Zustand**: Global state (user, session, story)
- **Props**: Component-specific state (form inputs, UI toggles)
- **React Query**: Server state (if we add it later)

---

## Common Commands

### Development
```bash
# Start dev server
npm run dev

# Type checking
npm run typecheck

# Build for production
npm run build

# Start production server
npm start

# Linting
npm run lint
```

### Node Version Management
```bash
# Always use nvm for node commands
nvm use

# Install dependencies
nvm use && npm install
```

### Database (Supabase)
```bash
# Generate TypeScript types from schema
npx supabase gen types typescript --local > src/types/database.ts

# Run migrations (when we add them)
npx supabase db push
```

---

## Environment Variables

### Required
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### Future (Not MVP)
```env
OPENAI_API_KEY=sk-xxx           # For story prompt generation
VIDEO_API_KEY=xxx               # For video generation (Veo 3)
VIDEO_STORAGE_URL=xxx           # S3/Cloudinary URL
```

---

## Approved Dependencies

### Current (Keep Minimal)
- `@supabase/supabase-js` - Database + realtime
- `zustand` - State management
- `framer-motion` - Animations
- `react-player` - Video playback
- `date-fns` - Date manipulation
- `zod` - Schema validation
- `@fingerprintjs/fingerprintjs` - Anonymous tracking (Phase 2)

### Do NOT Add
- ❌ Authentication libraries (we're anonymous)
- ❌ Heavy UI libraries (build custom with Tailwind)
- ❌ Moment.js (use date-fns)
- ❌ Lodash (use native JS methods)
- ❌ Redux (Zustand is simpler)

---

## Pre-Implementation Checklist

Before building a feature, ask:

1. **Mobile-first**: How does this work on a 375px screen?
2. **Error handling**: What happens if the network fails?
3. **Loading states**: What does the user see while waiting?
4. **Accessibility**: Can I navigate this with keyboard only?
5. **Simplicity**: Does this make the app easier or harder to understand?
6. **MVP scope**: Can this wait for v2?

---

## Testing Strategy (MVP)

### Manual Testing Priorities
1. Submit phrase on mobile (375px width)
2. Vote on phrases with slow 3G network
3. Watch video on different devices
4. Try to submit twice in same session (should block)
5. Try to vote twice (should block)
6. Test with JavaScript disabled (graceful degradation)

### Browser Support
- Chrome (mobile + desktop)
- Safari (iOS + macOS)
- Firefox (desktop)
- Edge (desktop)
- Don't worry about IE11

---

## Deployment Strategy

### MVP Stack
- **Frontend + API**: Vercel (zero config for Next.js)
- **Database**: Supabase (hosted PostgreSQL)
- **Video Storage**: Cloudinary or placeholder URLs
- **Domain**: Custom domain via Vercel

### Environment Setup
- Use Vercel environment variables
- Separate preview + production environments
- Auto-deploy from `main` branch
- Preview deploys from PRs

---

## Future Features (Post-MVP)

See `ROADMAP.md` for:
- Multiple daily voting sessions (4x per day)
- Advanced device fingerprinting
- Content moderation tools
- Story branching/forking
- User profiles (optional)
- Social sharing features
- Analytics dashboard
- Video stitching service
- Character persistence across episodes
- AI-generated music/soundtrack

---

## When Making Changes

1. ✅ Test on mobile first (375px width)
2. ✅ Run typecheck before committing
3. ✅ Update types when changing data structures
4. ✅ Consider offline/slow network scenarios
5. ✅ Keep bundle size minimal (check with `npm run build`)
6. ✅ Preserve existing functionality unless explicitly changing
7. ✅ Write user-friendly error messages
8. ✅ Add loading states for async operations

---

## Getting Help

### Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)

### Project-Specific Questions
- Check `ROADMAP.md` for planned features
- Review existing component patterns before creating new ones
- When in doubt, prioritize simplicity over features
