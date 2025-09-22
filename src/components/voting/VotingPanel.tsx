'use client'

import { useState, useEffect } from 'react'
import { getCurrentSession } from '@/lib/votingSession'
import { getAnonymousUserId } from '@/lib/anonymousAuth'
import { supabase } from '@/lib/supabase'
import { VotingSession } from '@/types/database'
import { VotingTimer } from './VotingTimer'
import { WordSubmission } from './WordSubmission'
import { VotingList } from './VotingList'

export function VotingPanel() {
  const [currentSession, setCurrentSession] = useState<VotingSession | null>(getCurrentSession())
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [userSubmissionId, setUserSubmissionId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUserStatus()
  }, [currentSession])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!currentSession) return

    // Subscribe to new submissions
    const submissionsChannel = supabase
      .channel('submissions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'submissions',
          filter: `session_date=eq.${currentSession.date},session_time=eq.${currentSession.time}`
        },
        () => {
          // Trigger refresh in VotingList component
        }
      )
      .subscribe()

    // Subscribe to new votes
    const votesChannel = supabase
      .channel('votes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes',
          filter: `session_date=eq.${currentSession.date},session_time=eq.${currentSession.time}`
        },
        () => {
          // Trigger refresh in VotingList component
        }
      )
      .subscribe()

    return () => {
      submissionsChannel.unsubscribe()
      votesChannel.unsubscribe()
    }
  }, [currentSession])

  const checkUserStatus = async () => {
    if (!currentSession) {
      setLoading(false)
      return
    }

    try {
      const anonymousUserId = await getAnonymousUserId()

      // Check if user has submitted
      const { data: submission } = await supabase
        .from('submissions')
        .select('id')
        .eq('session_date', currentSession.date)
        .eq('session_time', currentSession.time)
        .eq('anonymous_user_id', anonymousUserId)
        .single()

      setHasSubmitted(!!submission)
      setUserSubmissionId(submission?.id)

      // Check if user has voted
      const { data: vote } = await supabase
        .from('votes')
        .select('id')
        .eq('session_date', currentSession.date)
        .eq('session_time', currentSession.time)
        .eq('anonymous_user_id', anonymousUserId)
        .single()

      setHasVoted(!!vote)
    } catch (error) {
      console.error('Error checking user status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSessionChange = (session: VotingSession | null) => {
    setCurrentSession(session)
    setHasSubmitted(false)
    setHasVoted(false)
    setUserSubmissionId(undefined)
  }

  const handleSubmissionSuccess = () => {
    setHasSubmitted(true)
    checkUserStatus() // Refresh to get submission ID
  }

  const handleVote = () => {
    setHasVoted(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card animate-pulse">
          <div className="h-20 bg-gray-700 rounded"></div>
        </div>
        <div className="card animate-pulse">
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <VotingTimer onSessionChange={handleSessionChange} />
      
      {currentSession ? (
        <div className="space-y-6">
          {!hasSubmitted ? (
            <WordSubmission
              session={currentSession}
              onSubmissionSuccess={handleSubmissionSuccess}
              hasSubmitted={hasSubmitted}
            />
          ) : (
            <div className="card bg-green-900/20 border-green-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-green-400">Phrase Submitted!</h3>
                  <p className="text-sm text-green-300">
                    {hasVoted 
                      ? "Thanks for voting! Results at 4pm." 
                      : "Now vote on other submissions below."
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <VotingList
            session={currentSession}
            onVote={handleVote}
            hasVoted={hasVoted}
            userSubmissionId={userSubmissionId}
          />
        </div>
      ) : (
        <div className="card text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">No Active Voting Session</h3>
            <p className="text-sm text-gray-500">
              Check back during voting windows:<br />
              8-10am, 10am-12pm, 12-2pm, 2-4pm
            </p>
          </div>
        </div>
      )}
    </div>
  )
}