# StoryWeaver Roadmap

## Current Status: MVP Development

This document outlines features planned for future releases. Focus remains on shipping a simple, working MVP first.

---

## Phase 1: MVP (Current) ✅

**Goal**: Prove the core concept works

### Features
- [x] Single daily voting session
- [x] Anonymous user tracking (localStorage)
- [x] Phrase submission (max 10 words)
- [x] Simple voting system
- [x] Video episode viewer
- [x] Story progress tracking
- [x] Basic mobile-responsive UI

### Technical Stack
- Next.js 15 + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Realtime)
- Zustand (state management)
- React Player (video playback)

### Success Criteria
- Users can submit phrases without confusion
- Voting works on mobile devices
- Videos load and play reliably
- App loads in < 2 seconds on 3G

---

## Phase 2: Enhanced Engagement 🎯

**Timeline**: 4-6 weeks after MVP launch

### Features to Add

#### Multiple Daily Sessions
- **4 voting windows per day**: 8am, 10am, 12pm, 2pm
- **Session categories**:
  - 8am: Character/Subject
  - 10am: Action/Verb
  - 12pm: Object/Setting
  - 2pm: Mood/Twist
- Session-specific UI prompts
- Time zone detection/selection

#### Advanced Anonymous Tracking
- **Device fingerprinting** (@fingerprintjs/fingerprintjs)
- Cross-device user identification
- Better spam/duplicate prevention
- IP-based rate limiting (server-side)

#### Real-time Features
- Live vote count updates (Supabase subscriptions)
- User presence indicators ("X people voting now")
- Real-time submission feed
- WebSocket notifications for new episodes

#### Social Features
- Share episode clips to Twitter/Facebook
- Referral links with tracking
- Leaderboard for top contributors
- "Phrase of the Week" highlights

### Technical Improvements
- Implement React Query for data fetching
- Add service worker for offline support
- Video caching strategy (IndexedDB)
- Performance monitoring (Vercel Analytics)

---

## Phase 3: Content & Moderation 🛡️

**Timeline**: 8-10 weeks after MVP launch

### Content Moderation
- **Automated filtering**: Profanity and harmful content detection
- **User reporting**: Flag inappropriate submissions
- **Admin dashboard**: Review flagged content
- **Appeal system**: Users can contest removed phrases
- Community guidelines page

### Story Quality
- **AI prompt engineering**: Better story continuity
- **Character persistence**: Remember recurring characters
- **Story themes**: Weekly themed challenges
- **Story branching**: Fork narratives based on votes
- Episode remixes/variations

### Video Enhancements
- **Thumbnail generation**: Custom episode previews
- **Video stitching**: Combine episodes into full story
- **Quality settings**: Adjust resolution based on network
- **Download option**: Save favorite episodes

---

## Phase 4: Community & Monetization 💰

**Timeline**: 12-16 weeks after MVP launch

### User Profiles (Optional)
- **Pseudonymous profiles**: Username + avatar (still anonymous)
- Contribution history
- Badges and achievements
- Favorite episodes collection

### Analytics & Insights
- **Public stats**:
  - Total submissions
  - Most popular words
  - Story completion rate
  - Viewer engagement metrics
- **Creator dashboard**:
  - Your submission performance
  - Vote patterns over time
  - Contribution streaks

### Monetization Options
- **Sponsored episodes**: Brand partnerships
- **Premium features**:
  - Early access to new episodes
  - Extended voting windows
  - Exclusive story themes
- **NFT integration**: Mint episodes as collectibles
- **Tip jar**: Support the project

### Advanced Features
- **Director Mode**: Power users influence story direction
- **Story contests**: Themed competitions with prizes
- **Collaborative playlists**: Curated episode collections
- **Export options**: Download full stories

---

## Phase 5: Platform Expansion 🚀

**Timeline**: 6+ months after MVP launch

### New Formats
- **Audio stories**: Voice narration of winning phrases
- **AI-generated music**: Soundtrack for each episode
- **Comic strips**: Alternative visual format
- **Interactive stories**: Choose-your-own-adventure style

### Platform Features
- **Mobile apps**: Native iOS/Android apps
- **Desktop app**: Electron wrapper for desktop
- **TV app**: Apple TV, Roku, Fire TV support
- **API for developers**: Build on StoryWeaver platform

### International Expansion
- **Multi-language support**: Spanish, French, German, etc.
- Regional voting sessions
- Translation tools for submissions
- Localized story themes

### Enterprise/Education
- **Private instances**: Organizations run their own StoryWeaver
- **Educational tools**: Classroom storytelling exercises
- **Workshop mode**: Facilitated group sessions
- **API for custom integrations**

---

## Technical Debt to Address

### Performance
- [ ] Implement code splitting (reduce initial bundle size)
- [ ] Image optimization (use Next.js Image component)
- [ ] Database query optimization (add indexes)
- [ ] CDN for video delivery (CloudFlare/Fastly)

### Testing
- [ ] Unit tests for utility functions
- [ ] Integration tests for API routes
- [ ] E2E tests with Playwright
- [ ] Load testing for voting spikes

### DevOps
- [ ] CI/CD pipeline (automated tests + deploy)
- [ ] Error monitoring (Sentry integration)
- [ ] Database backups (automated + tested)
- [ ] Staging environment setup

### Documentation
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Component Storybook
- [ ] Contribution guidelines
- [ ] Deployment runbook

---

## Ideas Under Consideration 💡

These features need more research/validation:

### Experimental Features
- **AI co-writing**: AI suggests phrase completions
- **Voice input**: Speak your submission
- **Live events**: Special timed story challenges
- **Collaborative voting**: Teams vote together
- **Story remixes**: Re-generate episodes with different styles
- **Viewer reactions**: Emoji reactions to episodes
- **Story annotations**: Community notes on episodes
- **Behind-the-scenes**: Show prompt engineering process

### Technical Experiments
- **Edge computing**: Faster regional response times
- **P2P video delivery**: Reduce hosting costs
- **Blockchain voting**: Transparent vote counting
- **WebRTC streaming**: Live video generation events
- **Machine learning**: Predict winning phrases

---

## Community Requests

Track feature requests from users here:

| Feature | Votes | Status | Notes |
|---------|-------|--------|-------|
| Dark mode | - | Planned | Phase 2 |
| Episode bookmarking | - | Considering | Phase 4 |
| Story branching | - | Research | Phase 3 |

---

## Success Metrics to Track

### MVP Metrics (Phase 1)
- Daily active users
- Submission rate (% of visitors who submit)
- Voting participation rate
- Video completion rate
- Page load time (< 2s goal)

### Growth Metrics (Phase 2+)
- User retention (7-day, 30-day)
- Session frequency (visits per user per day)
- Social shares
- Referral conversion rate

### Quality Metrics (Phase 3+)
- Story continuity score (AI-evaluated)
- User satisfaction (NPS)
- Content moderation queue size
- Appeal rate (false positives)

---

## How to Prioritize

When deciding what to build next:

1. **User feedback**: What are users asking for?
2. **Engagement impact**: Will this increase daily usage?
3. **Technical feasibility**: Can we build this quickly?
4. **MVP alignment**: Does this fit the core concept?
5. **Resource constraints**: Do we have time/budget?

**Default answer**: When in doubt, ship the simpler version first.

---

## Contributing to Roadmap

Want to suggest a feature? Consider:

1. **Problem**: What user problem does this solve?
2. **Solution**: How would this feature work?
3. **Alternatives**: What else could solve this problem?
4. **Scope**: Is this MVP, Phase 2, or later?
5. **Risks**: What could go wrong?

Open an issue or PR to discuss!

---

## Last Updated

- **Date**: 2025-09-30
- **Current Phase**: Phase 1 (MVP)
- **Next Milestone**: Launch MVP

---

_Remember: The best roadmap is the one that adapts to user needs. Stay flexible._
