import { NextRequest } from 'next/server'
import { supabase, isDevelopment } from '@/lib/supabase'
import { voteSchema } from '@/lib/validation'
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
    const anonymousUserId = searchParams.get('anonymousUserId')
    
    if (!sessionDate || sessionTime === null || !anonymousUserId) {
      return createErrorResponse(
        { message: 'sessionDate, sessionTime, and anonymousUserId are required' },
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

    if (!await validateAnonymousUser(anonymousUserId)) {
      return createErrorResponse(
        { message: 'Invalid user ID' },
        400
      )
    }

    if (isDevelopment) {
      // Return mock data for development
      return createSuccessResponse({
        hasVoted: false,
        hasSubmitted: false
      })
    }

    // Check if user has voted in this session
    const { data: voteData, error: voteError } = await supabase
      .from('votes')
      .select('id')
      .eq('session_date', sessionDate)
      .eq('session_time', sessionTimeNum)
      .eq('anonymous_user_id', anonymousUserId)
      .single()

    if (voteError && voteError.code !== 'PGRST116') {
      console.error('Vote check error:', voteError)
      return createErrorResponse(
        { message: 'Failed to check vote status' },
        500
      )
    }

    // Check if user has submitted in this session
    const { data: submissionData, error: submissionError } = await supabase
      .from('submissions')
      .select('id')
      .eq('session_date', sessionDate)
      .eq('session_time', sessionTimeNum)
      .eq('anonymous_user_id', anonymousUserId)
      .single()

    if (submissionError && submissionError.code !== 'PGRST116') {
      console.error('Submission check error:', submissionError)
      return createErrorResponse(
        { message: 'Failed to check submission status' },
        500
      )
    }

    return createSuccessResponse({
      hasVoted: !!voteData,
      hasSubmitted: !!submissionData,
      submissionId: submissionData?.id
    })

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
    const { submissionId, anonymousUserId, sessionDate, sessionTime } = body

    // Validate required fields
    if (!submissionId || !anonymousUserId || !sessionDate || sessionTime === undefined) {
      return createErrorResponse(
        { message: 'Missing required fields' },
        400
      )
    }

    // Validate with Zod schema
    const voteValidation = voteSchema.safeParse(body)
    if (!voteValidation.success) {
      return createErrorResponse(
        { 
          message: 'Invalid vote data',
          details: voteValidation.error.issues.map(i => i.message)
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
    const rateLimitKey = `vote:${ipHash}:${sessionDate}:${sessionTime}`
    const rateLimit = checkRateLimit(rateLimitKey, 1, 24 * 60 * 60 * 1000) // 1 per day
    
    if (!rateLimit.allowed) {
      return createErrorResponse(
        { message: 'Rate limit exceeded. Only one vote per session allowed.' },
        429
      )
    }

    if (isDevelopment) {
      // Return mock success for development
      return createSuccessResponse({
        message: 'Vote cast successfully',
        vote: {
          id: 'mock-vote-' + Date.now(),
          submission_id: submissionId,
          anonymous_user_id: anonymousUserId,
          session_date: sessionDate,
          session_time: sessionTime,
          created_at: new Date().toISOString()
        }
      }, 201)
    }

    // Check if submission exists and is for the correct session
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select('id, anonymous_user_id, session_date, session_time')
      .eq('id', submissionId)
      .single()

    if (submissionError) {
      console.error('Submission check error:', submissionError)
      return createErrorResponse(
        { message: 'Submission not found' },
        404
      )
    }

    // Prevent voting on own submission
    if (submission.anonymous_user_id === anonymousUserId) {
      return createErrorResponse(
        { message: 'Cannot vote on your own submission' },
        400
      )
    }

    // Verify submission is for the correct session
    if (submission.session_date !== sessionDate || submission.session_time !== sessionTime) {
      return createErrorResponse(
        { message: 'Invalid submission for this session' },
        400
      )
    }

    // Insert vote
    const { data, error } = await supabase
      .from('votes')
      .insert({
        submission_id: submissionId,
        anonymous_user_id: anonymousUserId,
        session_date: sessionDate,
        session_time: sessionTime
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      
      if (error.code === '23505') {
        return createErrorResponse(
          { message: 'You have already voted in this session' },
          409
        )
      }
      
      return createErrorResponse(
        { message: 'Failed to cast vote' },
        500
      )
    }

    return createSuccessResponse({
      message: 'Vote cast successfully',
      vote: data
    }, 201)

  } catch (err) {
    console.error('API error:', err)
    return createErrorResponse(
      { message: 'Internal server error' },
      500
    )
  }
}