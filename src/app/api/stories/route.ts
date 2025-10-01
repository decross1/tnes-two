import { NextRequest } from 'next/server'
import { supabase, isDevelopment } from '@/lib/supabase'
import { 
  createErrorResponse, 
  createSuccessResponse
} from '@/lib/apiUtils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeCompleted = searchParams.get('includeCompleted') === 'true'
    const currentOnly = searchParams.get('currentOnly') === 'true'

    if (isDevelopment) {
      // Return mock data for development
      const mockStories = [
        {
          id: 'story-1',
          story_number: 1,
          title: 'The Enchanted Garden',
          total_duration_seconds: 180,
          episode_count: 9,
          is_complete: false,
          completed_at: null,
          full_video_url: null,
          created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]

      if (currentOnly) {
        return createSuccessResponse({ 
          story: mockStories.find(s => !s.is_complete) || null 
        })
      }

      return createSuccessResponse({ 
        stories: includeCompleted ? mockStories : mockStories.filter(s => !s.is_complete)
      })
    }

    if (currentOnly) {
      // Get current active story
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('is_complete', false)
        .order('created_at', { ascending: false })
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Database error:', error)
        return createErrorResponse(
          { message: 'Failed to fetch current story' },
          500
        )
      }

      return createSuccessResponse({ story: data || null })
    }

    // Get all stories
    let query = supabase
      .from('stories')
      .select('*')
      .order('story_number', { ascending: false })

    if (!includeCompleted) {
      query = query.eq('is_complete', false)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return createErrorResponse(
        { message: 'Failed to fetch stories' },
        500
      )
    }

    return createSuccessResponse({ stories: data || [] })

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
    const { title, adminKey } = body

    // Simple admin protection (in production, use proper auth)
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return createErrorResponse(
        { message: 'Unauthorized' },
        401
      )
    }

    if (isDevelopment) {
      // Return mock success for development
      return createSuccessResponse({
        message: 'Story created successfully',
        story: {
          id: 'mock-story-' + Date.now(),
          story_number: 2,
          title: title || 'New Story',
          total_duration_seconds: 0,
          episode_count: 0,
          is_complete: false,
          completed_at: null,
          full_video_url: null,
          created_at: new Date().toISOString()
        }
      }, 201)
    }

    // Get next story number
    const { data: latestStory } = await supabase
      .from('stories')
      .select('story_number')
      .order('story_number', { ascending: false })
      .limit(1)
      .single()

    const nextStoryNumber = (latestStory?.story_number || 0) + 1

    // Create new story
    const { data, error } = await supabase
      .from('stories')
      .insert({
        story_number: nextStoryNumber,
        title: title || `Story #${nextStoryNumber}`
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return createErrorResponse(
        { message: 'Failed to create story' },
        500
      )
    }

    return createSuccessResponse({
      message: 'Story created successfully',
      story: data
    }, 201)

  } catch (err) {
    console.error('API error:', err)
    return createErrorResponse(
      { message: 'Internal server error' },
      500
    )
  }
}