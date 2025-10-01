import { NextRequest } from 'next/server'
import { supabase, isDevelopment } from '@/lib/supabase'
import { submissionSchema } from '@/lib/validation'
import { 
  createErrorResponse, 
  createSuccessResponse, 
  hashIP, 
  getClientIP,
  validateAnonymousUser,
  validateSessionParams,
  checkRateLimit
} from '@/lib/apiUtils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionDate = searchParams.get('sessionDate')
    const sessionTime = searchParams.get('sessionTime')
    
    if (!sessionDate || sessionTime === null) {
      return createErrorResponse(
        { message: 'sessionDate and sessionTime are required' },
        400
      )
    }
    
    const sessionTimeNum = parseInt(sessionTime)
    if (!validateSessionParams(sessionDate, sessionTimeNum)) {
      return createErrorResponse(
        { message: 'Invalid session parameters' },
        400
      )
    }

    if (isDevelopment) {
      // Return mock data for development
      const mockSubmissions = [
        {
          id: 'mock-1',
          phrase: 'enchanted fairy garden',
          word_count: 3,
          session_date: sessionDate,
          session_time: sessionTimeNum,
          anonymous_user_id: 'mock-user-1',
          votes: 15,
          created_at: new Date().toISOString()
        },
        {
          id: 'mock-2', 
          phrase: 'sparkling magical flowers',
          word_count: 3,
          session_date: sessionDate,
          session_time: sessionTimeNum,
          anonymous_user_id: 'mock-user-2',
          votes: 8,
          created_at: new Date().toISOString()
        },
        {
          id: 'mock-3',
          phrase: 'dancing butterfly wings',
          word_count: 3,
          session_date: sessionDate,
          session_time: sessionTimeNum,
          anonymous_user_id: 'mock-user-3',
          votes: 12,
          created_at: new Date().toISOString()
        }
      ]
      
      return createSuccessResponse({ submissions: mockSubmissions })
    }

    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('session_date', sessionDate)
      .eq('session_time', sessionTimeNum)
      .order('votes', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return createErrorResponse(
        { message: 'Failed to fetch submissions' },
        500
      )
    }

    return createSuccessResponse({ submissions: data || [] })

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
    const { phrase, sessionDate, sessionTime, anonymousUserId } = body

    // Validate required fields
    if (!phrase || !sessionDate || sessionTime === undefined || !anonymousUserId) {
      return createErrorResponse(
        { message: 'Missing required fields' },
        400
      )
    }

    // Validate phrase
    const phraseValidation = submissionSchema.safeParse({ phrase })
    if (!phraseValidation.success) {
      return createErrorResponse(
        { 
          message: 'Invalid phrase',
          details: phraseValidation.error.issues.map(i => i.message)
        },
        400
      )
    }

    // Validate session parameters
    if (!validateSessionParams(sessionDate, sessionTime)) {
      return createErrorResponse(
        { message: 'Invalid session parameters' },
        400
      )
    }

    // Validate anonymous user ID
    if (!await validateAnonymousUser(anonymousUserId)) {
      return createErrorResponse(
        { message: 'Invalid user ID' },
        400
      )
    }

    const clientIP = getClientIP(request)
    const ipHash = hashIP(clientIP)
    
    // Rate limiting
    const rateLimitKey = `submit:${ipHash}:${sessionDate}:${sessionTime}`
    const rateLimit = checkRateLimit(rateLimitKey, 1, 24 * 60 * 60 * 1000) // 1 per day
    
    if (!rateLimit.allowed) {
      return createErrorResponse(
        { message: 'Rate limit exceeded. Only one submission per session allowed.' },
        429
      )
    }

    if (isDevelopment) {
      // Return mock success for development
      return createSuccessResponse({
        message: 'Submission created successfully',
        submission: {
          id: 'mock-submission-' + Date.now(),
          phrase: phrase.trim(),
          word_count: phrase.trim().split(/\s+/).length,
          session_date: sessionDate,
          session_time: sessionTime,
          anonymous_user_id: anonymousUserId,
          votes: 0,
          created_at: new Date().toISOString()
        }
      }, 201)
    }

    // Calculate word count
    const wordCount = phrase.trim().split(/\s+/).length
    
    // Insert submission
    const { data, error } = await supabase
      .from('submissions')
      .insert({
        phrase: phrase.trim(),
        word_count: wordCount,
        session_date: sessionDate,
        session_time: sessionTime,
        anonymous_user_id: anonymousUserId,
        ip_hash: ipHash
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      
      if (error.code === '23505') {
        return createErrorResponse(
          { message: 'You have already submitted for this session' },
          409
        )
      }
      
      return createErrorResponse(
        { message: 'Failed to create submission' },
        500
      )
    }

    return createSuccessResponse({
      message: 'Submission created successfully',
      submission: data
    }, 201)

  } catch (err) {
    console.error('API error:', err)
    return createErrorResponse(
      { message: 'Internal server error' },
      500
    )
  }
}