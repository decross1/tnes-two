import { supabase, isDevelopment } from './supabase'
import { Story, Episode } from '@/types/database'

export interface StoryStatus {
  currentStory: Story | null
  episodes: Episode[]
  shouldComplete: boolean
  nextEpisodeNumber: number
  totalDuration: number
  progressPercentage: number
}

export async function getCurrentStory(): Promise<Story | null> {
  if (isDevelopment) {
    // Return mock data for development
    return {
      id: 'dev-story-1',
      story_number: 1,
      title: 'The Enchanted Garden',
      total_duration_seconds: 180, // 3 minutes
      episode_count: 9,
      is_complete: false,
      completed_at: null,
      full_video_url: null,
      created_at: new Date().toISOString()
    }
  }

  try {
    const response = await fetch('/api/stories?currentOnly=true')
    const data = await response.json()

    if (!response.ok) {
      console.error('Error fetching current story:', data.error)
      return null
    }

    return data.story
  } catch (err) {
    console.error('Error in getCurrentStory:', err)
    return null
  }
}

export async function getStoryEpisodes(storyId: string): Promise<Episode[]> {
  if (isDevelopment) {
    // Return mock episodes for development
    return [
      {
        id: 'ep-1',
        story_id: storyId,
        episode_number: 1,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration_seconds: 20,
        winning_phrase: 'magical butterfly garden',
        story_prompt: 'A magical butterfly garden filled with colorful flowers',
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'ep-2',
        story_id: storyId,
        episode_number: 2,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        duration_seconds: 20,
        winning_phrase: 'dancing fairy',
        story_prompt: 'A dancing fairy appears among the flowers',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'ep-3',
        story_id: storyId,
        episode_number: 3,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration_seconds: 20,
        winning_phrase: 'mysterious door',
        story_prompt: 'The fairy discovers a mysterious door behind the roses',
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }

  try {
    const response = await fetch(`/api/episodes?storyId=${storyId}`)
    const data = await response.json()

    if (!response.ok) {
      console.error('Error fetching episodes:', data.error)
      return []
    }

    return data.episodes || []
  } catch (err) {
    console.error('Error in getStoryEpisodes:', err)
    return []
  }
}

export async function getStoryStatus(): Promise<StoryStatus> {
  const currentStory = await getCurrentStory()
  
  if (!currentStory) {
    return {
      currentStory: null,
      episodes: [],
      shouldComplete: false,
      nextEpisodeNumber: 1,
      totalDuration: 0,
      progressPercentage: 0
    }
  }

  const episodes = await getStoryEpisodes(currentStory.id)
  const totalDuration = episodes.reduce((sum, ep) => sum + (ep.duration_seconds || 0), 0)
  
  // Story should complete between 7-9 minutes (420-540 seconds)
  const shouldComplete = totalDuration >= 420 && totalDuration < 540
  const progressPercentage = Math.min((totalDuration / 540) * 100, 100)
  
  return {
    currentStory,
    episodes,
    shouldComplete,
    nextEpisodeNumber: episodes.length + 1,
    totalDuration,
    progressPercentage
  }
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function getStoryCompletionStatus(totalDuration: number): {
  status: 'starting' | 'growing' | 'climax' | 'complete'
  message: string
  color: string
} {
  if (totalDuration < 120) { // Under 2 minutes
    return {
      status: 'starting',
      message: 'Story just beginning...',
      color: 'text-blue-400'
    }
  } else if (totalDuration < 300) { // Under 5 minutes
    return {
      status: 'growing',
      message: 'Story developing...',
      color: 'text-green-400'
    }
  } else if (totalDuration < 420) { // Under 7 minutes
    return {
      status: 'climax',
      message: 'Approaching climax...',
      color: 'text-yellow-400'
    }
  } else {
    return {
      status: 'complete',
      message: 'Story complete!',
      color: 'text-purple-400'
    }
  }
}