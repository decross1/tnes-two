# StoryWeaver - Collaborative Animated Short Creator

## Project Overview
A mobile-friendly web application where users collectively create an animated short film by voting on words/phrases throughout the day. Each day, the community's chosen words generate a new 20-second video clip that continues the story, creating an ever-growing collaborative animated narrative.

## Core Features

### 1. Voting System
- **Schedule**: 4 daily voting windows at 8am, 10am, 12pm, and 2pm (configurable timezone)
- **Duration**: Each voting window lasts 2 hours
- **Participation**: Users can submit words/phrases and vote on others' submissions
- **Categories**: Each session focuses on different narrative elements:
  - 8am: Character/Subject
  - 10am: Action/Verb
  - 12pm: Object/Setting
  - 2pm: Mood/Twist

### 2. Story Generation Pipeline
- **4pm Daily**: Winning words are compiled
- **Context Management**: System maintains running story summary
- **Prompt Engineering**: Combines story context + new words into coherent scene description
- **Video Generation**: Calls Veo 3 API to create 20-second clip
- **Storage**: Saves generated videos to cloud storage

### 3. Viewing Experience
- **Main Player**: Displays the complete animated short (all stitched clips)
- **Episode View**: Individual 20-second segments with their generating words
- **Timeline**: Visual representation of story progression
- **Share Features**: Social media sharing for daily clips or full video

## Technical Architecture

### Frontend (React/Next.js)
```
src/
  components/
    VotingPanel/
      WordSubmission.tsx     # Form for submitting new words
      VotingList.tsx         # Display and vote on submitted words
      VotingTimer.tsx        # Countdown for current session
    
    VideoPlayer/
      MainPlayer.tsx         # Full animated short player
      EpisodeList.tsx        # Individual clip browser
      VideoControls.tsx      # Custom video controls
    
    StoryContext/
      ContextDisplay.tsx     # Shows current story summary
      WordHistory.tsx        # Previous winning words
    
    Layout/
      MobileNav.tsx          # Mobile-optimized navigation
      DesktopLayout.tsx      # Desktop responsive layout
  
  hooks/
    useVoting.ts            # Voting state management
    useVideoPlayback.ts     # Video player logic
    useRealtime.ts          # WebSocket for live updates
  
  pages/
    index.tsx               # Main app page
    api/
      vote.ts               # Voting endpoints
      generate.ts           # Video generation trigger
      videos.ts             # Video retrieval
```

### Backend (Node.js/Express or Next.js API Routes)
```
api/
  services/
    votingService.js        # Manage voting sessions
    storyService.js         # Story context and prompt generation
    veoService.js           # Veo 3 API integration
    videoStitcher.js        # Combine clips into full video
  
  models/
    Word.js                 # Submitted words/phrases
    Vote.js                 # User votes
    Episode.js              # Generated video segments
    Story.js                # Overall story metadata
  
  scheduled/
    dailyGeneration.js      # 4pm video generation job
    votingWindows.js        # Start/stop voting sessions
```

### Database Schema (PostgreSQL/Supabase)
```sql
-- Words submitted by users
CREATE TABLE words (
  id UUID PRIMARY KEY,
  text VARCHAR(100),
  category VARCHAR(50),
  session_date DATE,
  session_time TIME,
  user_id VARCHAR(100),
  created_at TIMESTAMP
);

-- Votes on words
CREATE TABLE votes (
  id UUID PRIMARY KEY,
  word_id UUID REFERENCES words(id),
  user_id VARCHAR(100),
  session_id UUID,
  created_at TIMESTAMP,
  UNIQUE(user_id, session_id)
);

-- Generated video episodes
CREATE TABLE episodes (
  id UUID PRIMARY KEY,
  episode_number INT,
  video_url TEXT,
  thumbnail_url TEXT,
  prompt TEXT,
  winning_words JSONB,
  story_context TEXT,
  duration_seconds INT DEFAULT 20,
  generated_at TIMESTAMP
);

-- Overall story metadata
CREATE TABLE stories (
  id UUID PRIMARY KEY,
  title VARCHAR(200),
  current_context TEXT,
  total_episodes INT,
  full_video_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Implementation Steps

### Phase 1: Core Voting System (Week 1)
1. Set up Next.js project with TypeScript
2. Create database schema and Supabase connection
3. Implement word submission and voting UI
4. Build voting session management (time windows)
5. Create real-time updates with WebSockets

### Phase 2: Story Generation (Week 2)
1. Integrate OpenAI/Claude API for context generation
2. Build prompt engineering system
3. Set up Veo 3 API integration (or placeholder)
4. Create scheduled job for 4pm generation
5. Implement video storage (S3/Cloudinary)

### Phase 3: Video Playback (Week 3)
1. Build main video player component
2. Implement video stitching service
3. Create episode browser/timeline
4. Add video caching and optimization
5. Build sharing features

### Phase 4: Polish & Mobile (Week 4)
1. Mobile-responsive design optimization
2. PWA features for app-like experience
3. User authentication (optional)
4. Analytics and monitoring
5. Performance optimization

## Environment Variables
```env
# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...

# APIs
VEO_API_KEY=...
OPENAI_API_KEY=...

# Storage
AWS_S3_BUCKET=...
AWS_ACCESS_KEY=...
AWS_SECRET_KEY=...

# App Config
VOTING_TIMEZONE=America/New_York
VOTING_TIMES=08:00,10:00,12:00,14:00
GENERATION_TIME=16:00
```

## UI/UX Design Guidelines

### Mobile-First Design
- **Split View**: Voting panel slides up from bottom, video player on top
- **Swipe Navigation**: Swipe between voting and viewing modes
- **Touch Optimized**: Large touch targets for voting buttons
- **Offline Support**: Cache videos for offline viewing

### Desktop Experience
- **Two-Panel Layout**: Left panel for voting/story context, right for video
- **Keyboard Shortcuts**: Space for play/pause, arrows for navigation
- **Hover States**: Rich previews on episode thumbnails
- **Multi-column**: Word submissions in grid layout

### Visual Design
- **Color Scheme**: 
  - Primary: Deep purple (#6B46C1)
  - Secondary: Coral (#FF6B6B)
  - Background: Dark mode friendly (#1A1A2E)
  - Accent: Bright yellow (#FFD93D)
- **Typography**: Modern, readable fonts (Inter for UI, Playfair for headings)
- **Animations**: Smooth transitions, loading skeletons, micro-interactions
- **Accessibility**: WCAG AA compliance, screen reader support

## API Endpoints

### Voting
- `POST /api/words/submit` - Submit a new word
- `GET /api/words/current` - Get words for current voting session
- `POST /api/votes` - Cast a vote
- `GET /api/votes/results` - Get voting results

### Videos
- `GET /api/episodes` - List all episodes
- `GET /api/episodes/:id` - Get specific episode
- `GET /api/story/full` - Get full stitched video URL
- `GET /api/story/context` - Get current story context

### Admin/Scheduled
- `POST /api/generate/trigger` - Manually trigger video generation
- `POST /api/voting/start` - Start voting session
- `POST /api/voting/end` - End voting session

## Testing Strategy
1. **Unit Tests**: Jest for components and services
2. **Integration Tests**: API endpoint testing
3. **E2E Tests**: Playwright for user flows
4. **Load Testing**: Simulate voting spikes
5. **Mobile Testing**: BrowserStack for device testing

## Deployment
1. **Frontend**: Vercel for Next.js hosting
2. **Backend**: Vercel Functions or Railway
3. **Database**: Supabase for PostgreSQL
4. **Storage**: Cloudinary or AWS S3
5. **CDN**: CloudFlare for video delivery
6. **Monitoring**: Sentry for error tracking

## Future Enhancements
- **Branching Stories**: Vote to fork the narrative
- **Character Persistence**: AI remembers recurring characters
- **Music Generation**: AI-generated soundtrack
- **Community Features**: Comments, reactions, badges
- **Story Themes**: Weekly themed stories
- **Director Mode**: Special users can influence direction
- **Export Options**: Download personal copies
- **NFT Integration**: Mint daily episodes as collectibles

## Success Metrics
- Daily active voters
- Voting participation rate
- Video completion rate
- Social shares
- Story continuity score (AI-evaluated)
- User retention (daily return rate)

## Notes for Claude Code Implementation
- Start with a minimal viable version focusing on voting and basic video display
- Use mock data for Veo 3 API initially (since it may not be publicly available)
- Implement Progressive Web App features for mobile experience
- Consider using Framer Motion for smooth animations
- Use Zustand or Redux Toolkit for state management
- Implement optimistic UI updates for better UX
- Add rate limiting to prevent vote manipulation
- Use server-sent events or WebSockets for real-time vote updates