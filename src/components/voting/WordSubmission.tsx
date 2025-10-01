'use client'

import { useState, useEffect } from 'react'
import { validateSubmission, sanitizePhrase } from '@/lib/validation'
import { getAnonymousUserId } from '@/lib/anonymousAuth'
import { supabase } from '@/lib/supabase'
import { VotingSession } from '@/types/database'

interface WordSubmissionProps {
  session: VotingSession
  onSubmissionSuccess: () => void
  hasSubmitted: boolean
}

export function WordSubmission({ session, onSubmissionSuccess, hasSubmitted }: WordSubmissionProps) {
  const [phrase, setPhrase] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validation, setValidation] = useState(validateSubmission(''))

  useEffect(() => {
    setValidation(validateSubmission(phrase))
    setError(null)
  }, [phrase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validation.isValid || hasSubmitted) return
    
    setIsSubmitting(true)
    setError(null)

    try {
      const anonymousUserId = await getAnonymousUserId()
      const sanitizedPhrase = sanitizePhrase(phrase)
      
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phrase: sanitizedPhrase,
          sessionDate: session.date,
          sessionTime: session.time,
          anonymousUserId: anonymousUserId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to submit phrase')
        return
      }

      setPhrase('')
      onSubmissionSuccess()
    } catch (err) {
      console.error('Submission error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }


  if (hasSubmitted) {
    return (
      <div className="card bg-green-900/20 border-green-500/20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-green-400">Phrase Submitted!</h3>
            <p className="text-sm text-green-300">Your submission is now available for voting</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-primary mb-2">Submit Your Phrase</h3>
        <p className="text-gray-400 text-sm">
          Category: <span className="text-accent font-medium">{session.category}</span>
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Up to 10 words (max 30 characters per word)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder={`Enter your ${session.category.toLowerCase()} phrase...`}
            className="input-field w-full resize-none"
            rows={3}
            maxLength={300}
            disabled={isSubmitting}
          />
          
          <div className="flex justify-between items-center mt-2 text-sm">
            <div className="flex space-x-4">
              <span className={`${validation.wordCount > 10 ? 'text-red-400' : 'text-gray-400'}`}>
                {validation.wordCount}/10 words
              </span>
              <span className="text-gray-500">
                {phrase.length}/300 characters
              </span>
            </div>
            
            {validation.errors.length > 0 && (
              <span className="text-red-400 text-xs">
                {validation.errors[0]}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/20 rounded-lg p-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!validation.isValid || isSubmitting || phrase.trim().length === 0}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <span>Submit Phrase</span>
          )}
        </button>
      </form>
    </div>
  )
}