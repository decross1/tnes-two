# Project: StoryWeaver

## Project Context
You are working on StoryWeaver, a collaborative storytelling web app where users vote on phrases throughout the day to create animated shorts. The app is built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Core Principles
1. **Mobile-first development** - Always test and optimize for mobile devices first
2. **Anonymous users** - No authentication required, track users via fingerprinting
3. **Real-time updates** - Use Supabase subscriptions for live voting updates
4. **Performance matters** - Optimize for fast loading, especially video content

## Development Guidelines

### Code Style
- Use TypeScript strictly - no `any` types unless absolutely necessary
- Prefer functional components with hooks over class components
- Use descriptive variable names (no single letters except in loops)
- Always include error handling for async operations
- Add comments for complex logic

### File Organization
- Components go in `/components` with PascalCase naming
- Utilities in `/lib` with camelCase naming
- Types in `/types` folder
- API routes follow Next.js 14 App Router conventions

### UI/UX Standards
- All interactive elements must be at least 44x44px on mobile
- Use Tailwind classes exclusively for styling (no inline styles)
- Include loading states for all async operations
- Show error messages in user-friendly language
- Implement optimistic UI updates where possible

### Database Conventions
- Always use UUID for primary keys
- Include created_at and updated_at timestamps
- Use snake_case for column names
- Add appropriate indexes for frequently queried columns
- Use transactions for multi-table operations

### Testing Requirements
- Write unit tests for utility functions
- Test edge cases (empty states, max limits, errors)
- Ensure mobile responsiveness at 320px, 768px, and 1024px widths
- Test with slow network conditions

## Specific Project Rules

### Voting System
- Sessions run at 8am, 10am, 12pm, 2pm (2 hours each)
- Maximum 10 words per submission, 30 characters per word
- One submission per user per session (tracked anonymously)
- No voting on your own submission

### Story Management
- Stories complete at 7-9 minutes total duration
- Episodes are 10-20 seconds each
- Automatically start new story when current completes
- Maintain narrative continuity in prompts

### Video Handling
- Use placeholder videos for development
- Lazy load videos not in viewport
- Implement video caching strategy
- Show thumbnails before video loads
- Handle video loading errors gracefully

## Environment Variables Required
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- OPENAI_API_KEY (for story generation)
- VIDEO_STORAGE_URL (S3 or Cloudinary)

## Common Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run test suite
- `npx supabase db push` - Push database changes
- `npx supabase gen types` - Generate TypeScript types

## External Dependencies Approved
- @supabase/supabase-js - Database and real-time
- zustand - State management
- framer-motion - Animations
- react-player - Video playback
- @fingerprintjs/fingerprintjs - Anonymous user tracking
- date-fns - Date manipulation
- zod - Schema validation

## Do NOT Use
- Authentication libraries (we're anonymous only)
- Heavy component libraries (build custom with Tailwind)
- Moment.js (use date-fns instead)
- Lodash (use native methods)

## When Making Changes
1. Always preserve existing functionality unless explicitly asked to change it
2. Run the app and test changes before committing
3. Update types when changing data structures
4. Consider mobile experience first
5. Keep bundle size minimal

## API Design
- Use POST for mutations, GET for queries
- Return consistent error formats: `{ error: string, details?: any }`
- Include appropriate status codes
- Validate input on both client and server
- Rate limit submission endpoints

## Questions to Ask Before Implementation
1. How will this work on mobile?
2. What happens if the network fails?
3. How does this affect the voting timeline?
4. Will this scale to hundreds of concurrent users?
5. Is there an edge case I'm missing?