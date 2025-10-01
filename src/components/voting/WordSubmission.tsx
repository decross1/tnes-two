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
      <div className="card-success">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-success">Phrase Submitted!</h3>
            <p className="text-sm text-success/80">Your submission is now available for voting</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="text-xl font-medium text-text-primary mb-2">Submit Your Phrase</h3>
        <p className="text-text-secondary text-sm">
          Category: <span className="text-primary font-medium">{session.category}</span>
        </p>
        <p className="text-text-muted text-xs mt-1">
          Up to 10 words • Max 30 characters per word
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder={`Enter your ${session.category.toLowerCase()} phrase...`}
            className="textarea-field"
            rows={3}
            maxLength={300}
            disabled={isSubmitting}
          />

          <div className="flex justify-between items-center mt-2 text-sm">
            <div className="flex space-x-4">
              <span className={`${validation.wordCount > 10 ? 'text-error' : 'text-text-secondary'}`}>
                {validation.wordCount}/10 words
              </span>
              <span className="text-text-muted">
                {phrase.length}/300 chars
              </span>
            </div>

            {validation.errors.length > 0 && (
              <span className="text-error text-xs">
                {validation.errors[0]}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="card-error">
            <p className="text-error text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!validation.isValid || isSubmitting || phrase.trim().length === 0}
          className="btn-primary w-full"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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