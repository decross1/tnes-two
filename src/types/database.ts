export interface AnonymousUser {
  id: string
  fingerprint: string
  first_seen: string
  last_active: string
}

export interface Submission {
  id: string
  phrase: string
  word_count: number
  session_date: string
  session_time: number // 0=8am, 1=10am, 2=12pm, 3=2pm
  anonymous_user_id: string
  ip_hash: string
  votes: number
  created_at: string
}

export interface Vote {
  id: string
  submission_id: string
  anonymous_user_id: string
  session_date: string
  session_time: number
  created_at: string
}

export interface Story {
  id: string
  story_number: number
  title: string | null
  total_duration_seconds: number
  episode_count: number
  is_complete: boolean
  completed_at: string | null
  full_video_url: string | null
  created_at: string
}

export interface Episode {
  id: string
  story_id: string
  episode_number: number
  video_url: string | null
  duration_seconds: number | null
  winning_phrase: string | null
  story_prompt: string | null
  created_at: string
}

export interface VotingSession {
  date: string
  time: number
  startTime: Date
  endTime: Date
  isActive: boolean
  category: 'Character/Subject' | 'Action/Verb' | 'Object/Setting' | 'Mood/Twist'
}