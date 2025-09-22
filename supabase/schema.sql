-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Anonymous user tracking
CREATE TABLE anonymous_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fingerprint TEXT UNIQUE NOT NULL,
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Word/phrase submissions
CREATE TABLE submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  phrase TEXT NOT NULL,
  word_count INT NOT NULL,
  session_date DATE NOT NULL,
  session_time INT NOT NULL, -- 0=8am, 1=10am, 2=12pm, 3=2pm
  anonymous_user_id UUID REFERENCES anonymous_users(id),
  ip_hash TEXT,
  votes INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT phrase_length CHECK (LENGTH(phrase) <= 300),
  CONSTRAINT word_count_limit CHECK (word_count <= 10 AND word_count > 0),
  CONSTRAINT session_time_valid CHECK (session_time >= 0 AND session_time <= 3)
);

-- Voting records
CREATE TABLE votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  anonymous_user_id UUID REFERENCES anonymous_users(id),
  session_date DATE NOT NULL,
  session_time INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent double voting
  UNIQUE(anonymous_user_id, session_date, session_time),
  -- Prevent voting on own submission
  CONSTRAINT no_self_vote CHECK (
    anonymous_user_id != (
      SELECT anonymous_user_id 
      FROM submissions 
      WHERE submissions.id = votes.submission_id
    )
  )
);

-- Stories with completion tracking
CREATE TABLE stories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_number INT UNIQUE NOT NULL,
  title TEXT,
  total_duration_seconds INT DEFAULT 0,
  episode_count INT DEFAULT 0,
  is_complete BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  full_video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Episodes linked to stories
CREATE TABLE episodes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  episode_number INT NOT NULL,
  video_url TEXT,
  duration_seconds INT,
  winning_phrase TEXT,
  story_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(story_id, episode_number),
  CONSTRAINT positive_duration CHECK (duration_seconds > 0)
);

-- Indexes for performance
CREATE INDEX idx_submissions_session ON submissions(session_date, session_time);
CREATE INDEX idx_submissions_user ON submissions(anonymous_user_id);
CREATE INDEX idx_votes_session ON votes(session_date, session_time);
CREATE INDEX idx_votes_submission ON votes(submission_id);
CREATE INDEX idx_episodes_story ON episodes(story_id, episode_number);
CREATE INDEX idx_stories_complete ON stories(is_complete, created_at);

-- Function to update vote count
CREATE OR REPLACE FUNCTION update_submission_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE submissions 
    SET votes = votes + 1 
    WHERE id = NEW.submission_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE submissions 
    SET votes = votes - 1 
    WHERE id = OLD.submission_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update vote counts
CREATE TRIGGER trigger_update_vote_count
  AFTER INSERT OR DELETE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_submission_vote_count();

-- Row Level Security policies
ALTER TABLE anonymous_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read/write their own data
CREATE POLICY "Users can manage their own anonymous profile" ON anonymous_users
  FOR ALL USING (true);

CREATE POLICY "Anyone can read submissions" ON submissions
  FOR SELECT USING (true);

CREATE POLICY "Users can create submissions" ON submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read votes" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Users can create votes" ON votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read stories" ON stories
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read episodes" ON episodes
  FOR SELECT USING (true);

-- Insert initial story if none exists
INSERT INTO stories (story_number, title) 
VALUES (1, 'The First Story')
ON CONFLICT (story_number) DO NOTHING;