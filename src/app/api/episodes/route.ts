import { NextRequest } from 'next/server'
import { supabase, isDevelopment } from '@/lib/supabase'
import { 
  createErrorResponse, 
  createSuccessResponse
} from '@/lib/apiUtils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storyId = searchParams.get('storyId')
    const limit = searchParams.get('limit')

    if (!storyId) {
      return createErrorResponse(
        { message: 'storyId is required' },
        400
      )
    }

    if (isDevelopment) {
      // Return mock episodes for development
      const mockEpisodes = [
        {
          id: 'ep-1',
          story_id: storyId,
          episode_number: 1,
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          duration_seconds: 20,
          winning_phrase: 'magical butterfly garden',
          story_prompt: 'A magical butterfly garden filled with colorful flowers and sparkling fairy dust',
          created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'ep-2',
          story_id: storyId,
          episode_number: 2,
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          duration_seconds: 20,
          winning_phrase: 'dancing fairy',
          story_prompt: 'A graceful fairy appears among the flowers, dancing in the moonlight',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'ep-3',
          story_id: storyId,
          episode_number: 3,
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          duration_seconds: 20,
          winning_phrase: 'mysterious door',
          story_prompt: 'The fairy discovers a mysterious glowing door hidden behind the ancient rose bushes',
          created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]

      let episodes = mockEpisodes
      if (limit) {
        episodes = episodes.slice(0, parseInt(limit))
      }

      return createSuccessResponse({ episodes })
    }

    let query = supabase
      .from('episodes')
      .select('*')
      .eq('story_id', storyId)
      .order('episode_number', { ascending: true })

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return createErrorResponse(
        { message: 'Failed to fetch episodes' },
        500
      )
    }

    return createSuccessResponse({ episodes: data || [] })

  } catch (err) {
    console.error('API error:', err)
    return createErrorResponse(
      { message: 'Internal server error' },
      500
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      storyId, 
      videoUrl, 
      durationSeconds, 
      winningPhrase, 
      storyPrompt,
      adminKey 
    } = body

    // Simple admin protection (in production, use proper auth)
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return createErrorResponse(
        { message: 'Unauthorized' },
        401
      )
    }

    if (!storyId || !winningPhrase) {
      return createErrorResponse(
        { message: 'storyId and winningPhrase are required' },
        400
      )
    }

    if (isDevelopment) {
      // Return mock success for development
      return createSuccessResponse({
        message: 'Episode created successfully',
        episode: {
          id: 'mock-episode-' + Date.now(),
          story_id: storyId,
          episode_number: 4,
          video_url: videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          duration_seconds: durationSeconds || 20,
          winning_phrase: winningPhrase,
          story_prompt: storyPrompt || `Generated scene based on: ${winningPhrase}`,
          created_at: new Date().toISOString()
        }
      }, 201)
    }

    // Verify story exists
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, episode_count, is_complete')
      .eq('id', storyId)
      .single()

    if (storyError) {
      console.error('Story check error:', storyError)
      return createErrorResponse(
        { message: 'Story not found' },
        404
      )
    }

    if (story.is_complete) {
      return createErrorResponse(
        { message: 'Cannot add episodes to completed story' },
        400
      )
    }

    // Get next episode number
    const nextEpisodeNumber = story.episode_count + 1

    // Create episode
    const { data, error } = await supabase
      .from('episodes')
      .insert({
        story_id: storyId,
        episode_number: nextEpisodeNumber,
        video_url: videoUrl,
        duration_seconds: durationSeconds,
        winning_phrase: winningPhrase,
        story_prompt: storyPrompt
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return createErrorResponse(
        { message: 'Failed to create episode' },
        500
      )
    }

    // Update story episode count and duration
    const newTotalDuration = (story.total_duration_seconds || 0) + (durationSeconds || 0)
    
    await supabase
      .from('stories')
      .update({
        episode_count: nextEpisodeNumber,
        total_duration_seconds: newTotalDuration
      })
      .eq('id', storyId)

    return createSuccessResponse({
      message: 'Episode created successfully',
      episode: data
    }, 201)

  } catch (err) {
    console.error('API error:', err)
    return createErrorResponse(
      { message: 'Internal server error' },
      500
    )
  }
}