# StoryWeaver - Refined Implementation Guide

## Core Design Decisions

### 1. Anonymous Voting System
- **No authentication required** - Users identified by session/device fingerprint
- **Rate limiting**: One submission per session per user (tracked by IP/fingerprint)
- **Vote tracking**: Store anonymous user ID in localStorage to prevent double voting
- **Privacy-first**: No personal data collection

### 2. Word Submission Rules
- **Submission format**: Up to 10 words per submission
- **Character limit**: Maximum 30 characters per individual word
- **Validation**: Client and server-side validation for limits
- **Display**: Show full phrase submissions, not individual words

### 3. Story Arc Management
- **Target duration**: 7-9 minutes total
- **Episode length**: 10-20 seconds each (varies based on scene complexity)
- **Episode count**: Approximately 25-50 episodes per story
- **Auto-completion**: Story concludes when reaching time limit
- **New story trigger**: Automatically starts new story after completion

### 4. Content Moderation
- **Phase 1**: No active moderation (community self-policing)
- **Logging**: Track all submissions for future review
- **Phase 2 consideration**: Add reporting button and word filtering later

## Updated Database Schema

```sql
-- Anonymous user tracking
CREATE TABLE anonymous_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fingerprint TEXT UNIQUE,
  first_seen TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW()
);

-- Word/phrase submissions (updated)
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phrase TEXT NOT NULL, -- Full submission (up to 10 words)
  word_count INT NOT NULL,
  session_date DATE NOT NULL,
  session_time INT NOT NULL, -- 0=8am, 1=10am, 2=12pm, 3=2pm
  anonymous_user_id UUID REFERENCES anonymous_users(id),
  ip_hash TEXT, -- Hashed IP for rate limiting
  votes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT phrase_length CHECK (LENGTH(phrase) <= 300), -- ~10 words * 30 chars
  CONSTRAINT word_count_limit CHECK (word_count <= 10)
);

-- Voting records
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES submissions(id),
  anonymous_user_id UUID REFERENCES anonymous_users(id),
  session_date DATE,
  session_time INT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Prevent double voting
  UNIQUE(anonymous_user_id, session_date, session_time)
);

-- Stories with completion tracking
CREATE TABLE stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_number INT UNIQUE NOT NULL,
  title TEXT,
  total_duration_seconds INT DEFAULT 0,
  episode_count INT DEFAULT 0,
  is_complete BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  full_video_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Episodes linked to stories
CREATE TABLE episodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id),
  episode_number INT NOT NULL,
  video_url TEXT,
  duration_seconds INT, -- Actual duration (10-20s)
  winning_phrase TEXT,
  story_prompt TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(story_id, episode_number)
);
```

## Implementation Updates

### Anonymous User Tracking
```typescript
// utils/anonymousAuth.ts
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export async function getAnonymousUserId(): Promise<string> {
  // Try to get from localStorage first
  let userId = localStorage.getItem('anonymous_user_id');
  
  if (!userId) {
    // Generate fingerprint
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    
    // Create/fetch user in database
    const { data } = await supabase
      .from('anonymous_users')
      .upsert({ 
        fingerprint: result.visitorId 
      })
      .select('id')
      .single();
    
    userId = data.id;
    localStorage.setItem('anonymous_user_id', userId);
  }
  
  return userId;
}
```

### Phrase Submission Validation
```typescript
// components/SubmissionForm.tsx
interface SubmissionValidation {
  isValid: boolean;
  errors: string[];
}

function validateSubmission(text: string): SubmissionValidation {
  const errors: string[] = [];
  
  // Split into words
  const words = text.trim().split(/\s+/);
  
  // Check word count
  if (words.length > 10) {
    errors.push("Maximum 10 words allowed");
  }
  
  // Check individual word length
  const longWords = words.filter(word => word.length > 30);
  if (longWords.length > 0) {
    errors.push("Each word must be 30 characters or less");
  }
  
  // Check if empty
  if (text.trim().length === 0) {
    errors.push("Please enter at least one word");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### Story Completion Logic
```typescript
// services/storyManager.ts
interface StoryStatus {
  currentStory: Story;
  shouldComplete: boolean;
  nextEpisodeNumber: number;
}

async function checkStoryStatus(): Promise<StoryStatus> {
  // Get current active story
  const { data: currentStory } = await supabase
    .from('stories')
    .select('*')
    .eq('is_complete', false)
    .order('created_at', { ascending: false })
    .single();
  
  if (!currentStory) {
    // Create new story
    return createNewStory();
  }
  
  // Check if story should complete (7-9 minutes)
  const shouldComplete = currentStory.total_duration_seconds >= 420; // 7 minutes
  
  if (shouldComplete && currentStory.total_duration_seconds < 540) { // Less than 9 min
    // Generate finale episode
    return {
      currentStory,
      shouldComplete: true,
      nextEpisodeNumber: currentStory.episode_count + 1
    };
  } else if (currentStory.total_duration_seconds >= 540) { // 9+ minutes
    // Mark complete and start new story
    await completeStory(currentStory.id);
    return createNewStory();
  }
  
  return {
    currentStory,
    shouldComplete: false,
    nextEpisodeNumber: currentStory.episode_count + 1
  };
}
```

### Rate Limiting for Submissions
```typescript
// api/submit-phrase/route.ts
import { createHash } from 'crypto';

export async function POST(req: Request) {
  const { phrase } = await req.json();
  
  // Get IP for rate limiting
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const ipHash = createHash('sha256').update(ip).digest('hex');
  
  // Get anonymous user ID
  const anonymousUserId = req.headers.get('x-anonymous-user-id');
  
  // Check if user already submitted this session
  const currentSession = getCurrentSession();
  const today = new Date().toISOString().split('T')[0];
  
  const { data: existingSubmission } = await supabase
    .from('submissions')
    .select('id')
    .eq('anonymous_user_id', anonymousUserId)
    .eq('session_date', today)
    .eq('session_time', currentSession.index)
    .single();
  
  if (existingSubmission) {
    return NextResponse.json(
      { error: 'You have already submitted for this session' },
      { status: 429 }
    );
  }
  
  // Validate phrase
  const validation = validateSubmission(phrase);
  if (!validation.isValid) {
    return NextResponse.json(
      { error: validation.errors[0] },
      { status: 400 }
    );
  }
  
  // Insert submission
  const wordCount = phrase.trim().split(/\s+/).length;
  
  const { data, error } = await supabase
    .from('submissions')
    .insert({
      phrase,
      word_count: wordCount,
      session_date: today,
      session_time: currentSession.index,
      anonymous_user_id: anonymousUserId,
      ip_hash: ipHash
    });
  
  return NextResponse.json({ success: true, data });
}
```

## UI Updates for Anonymous Voting

```tsx
// components/VotingPanel.tsx
export function VotingPanel() {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [submission, setSubmission] = useState('');
  const [wordCount, setWordCount] = useState(0);
  
  const handleSubmissionChange = (text: string) => {
    setSubmission(text);
    setWordCount(text.trim().split(/\s+/).filter(w => w).length);
  };
  
  return (
    <div className="p-4">
      {!hasSubmitted ? (
        <div className="space-y-4">
          <h3>Submit Your Phrase</h3>
          <p className="text-sm text-gray-600">
            Up to 10 words to shape the story (max 30 characters per word)
          </p>
          
          <textarea
            value={submission}
            onChange={(e) => handleSubmissionChange(e.target.value)}
            placeholder="Enter your creative phrase..."
            className="w-full p-3 border rounded-lg"
            rows={3}
          />
          
          <div className="flex justify-between text-sm">
            <span className={wordCount > 10 ? 'text-red-500' : 'text-gray-500'}>
              {wordCount}/10 words
            </span>
            <button
              onClick={submitPhrase}
              disabled={wordCount === 0 || wordCount > 10}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
            >
              Submit Phrase
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-green-600 mb-4">✓ Your phrase has been submitted!</p>
          <VotingList onVote={handleVote} hasVoted={hasVoted} />
        </div>
      )}
    </div>
  );
}
```

## Story Completion Display

```tsx
// components/StoryProgress.tsx
export function StoryProgress({ story }: { story: Story }) {
  const progress = (story.total_duration_seconds / 540) * 100; // 9 minutes max
  const timeRemaining = Math.max(0, 420 - story.total_duration_seconds); // Min 7 minutes
  
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Story Progress</h3>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Episode {story.episode_count}</span>
          <span>{formatDuration(story.total_duration_seconds)} / 7-9 min</span>
        </div>
        
        <div className="w-full bg-gray-300 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
      
      {story.total_duration_seconds >= 420 && (
        <div className="text-orange-600 text-sm">
          ⚡ Story approaching finale! 
          {story.total_duration_seconds < 540 && 
            ` (${Math.ceil(timeRemaining / 60)} more minutes possible)`
          }
        </div>
      )}
    </div>
  );
}
```