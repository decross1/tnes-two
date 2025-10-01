'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getAnonymousUserId } from '@/lib/anonymousAuth'
import { Submission, VotingSession } from '@/types/database'

interface VotingListProps {
  session: VotingSession
  onVote: () => void
  hasVoted: boolean
  userSubmissionId?: string
}

export function VotingList({ session, onVote, hasVoted, userSubmissionId }: VotingListProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSubmissions()
  }, [session.date, session.time])

  const loadSubmissions = async () => {
    try {
      const response = await fetch(`/api/submissions?sessionDate=${session.date}&sessionTime=${session.time}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load submissions')
      }

      setSubmissions(data.submissions || [])
    } catch (err) {
      console.error('Error loading submissions:', err)
      setError('Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (submissionId: string) => {
    if (hasVoted || voting || submissionId === userSubmissionId) return

    setVoting(submissionId)
    setError(null)

    try {
      const anonymousUserId = await getAnonymousUserId()

      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: submissionId,
          anonymousUserId: anonymousUserId,
          sessionDate: session.date,
          sessionTime: session.time
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to cast vote')
        return
      }

      // Update local state optimistically
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === submissionId 
            ? { ...sub, votes: sub.votes + 1 }
            : sub
        )
      )

      onVote()
    } catch (err) {
      console.error('Voting error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setVoting(null)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-xl font-semibold text-secondary mb-4">Community Submissions</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-600 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="card">
        <h3 className="text-xl font-semibold text-secondary mb-4">Community Submissions</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">No submissions yet</div>
          <p className="text-sm text-gray-500">Be the first to submit a phrase!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-secondary">Community Submissions</h3>
        <span className="text-sm text-gray-400">{submissions.length} phrase{submissions.length !== 1 ? 's' : ''}</span>
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/20 rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      {hasVoted && (
        <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-3 mb-4">
          <p className="text-green-400 text-sm">✓ Thank you for voting! Results will be revealed at 4pm.</p>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {submissions.map((submission) => {
          const isUserSubmission = submission.id === userSubmissionId
          const canVote = !hasVoted && !isUserSubmission && !voting

          return (
            <div
              key={submission.id}
              className={`
                border rounded-lg p-4 transition-all duration-200
                ${isUserSubmission 
                  ? 'border-primary/50 bg-primary/10' 
                  : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50'
                }
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-white font-medium flex-1 mr-4">
                  {submission.phrase}
                  {isUserSubmission && (
                    <span className="text-xs text-primary ml-2">(Your submission)</span>
                  )}
                </p>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-accent">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">{submission.votes}</span>
                  </div>
                  
                  {canVote && (
                    <button
                      onClick={() => handleVote(submission.id)}
                      disabled={voting === submission.id}
                      className="btn-secondary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      {voting === submission.id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          <span>Voting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span>Vote</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                {submission.word_count} word{submission.word_count !== 1 ? 's' : ''} • 
                {new Date(submission.created_at).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}