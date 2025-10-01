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

      const response = await fetch(
        `/api/votes?sessionDate=${currentSession.date}&sessionTime=${currentSession.time}&anonymousUserId=${anonymousUserId}`
      )
      
      const data = await response.json()

      if (response.ok) {
        setHasSubmitted(data.hasSubmitted)
        setHasVoted(data.hasVoted)
        setUserSubmissionId(data.submissionId)
      } else {
        console.error('Error checking user status:', data.error)
      }
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
          <div className="h-20 bg-card rounded"></div>
        </div>
        <div className="card animate-pulse">
          <div className="h-32 bg-card rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-4 lg:h-full">
      {/* Voting Timer - 30% height */}
      <div className="lg:h-[30%]">
        <VotingTimer onSessionChange={handleSessionChange} />
      </div>

      {/* Voting Content - 70% height */}
      {currentSession ? (
        <div className="flex flex-col space-y-4 lg:flex-1 lg:overflow-hidden">
          {!hasSubmitted ? (
            <WordSubmission
              session={currentSession}
              onSubmissionSuccess={handleSubmissionSuccess}
              hasSubmitted={hasSubmitted}
            />
          ) : (
            <div className="card-success">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-success">Phrase Submitted!</h3>
                  <p className="text-sm text-success/80">
                    {hasVoted
                      ? "Thanks for voting! Results at 4pm."
                      : "Now vote on other submissions below."
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="lg:flex-1 lg:overflow-auto">
            <VotingList
              session={currentSession}
              onVote={handleVote}
              hasVoted={hasVoted}
              userSubmissionId={userSubmissionId}
            />
          </div>
        </div>
      ) : (
        <div className="card text-center py-8 lg:flex-1 lg:flex lg:flex-col lg:justify-center">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-text-primary mb-2">No Active Voting Session</h3>
            <p className="text-sm text-text-secondary">
              Check back during voting windows:<br />
              8-10am, 10am-12pm, 12-2pm, 2-4pm
            </p>
          </div>
        </div>
      )}
    </div>
  )
}