'use client'

import { useState, useEffect } from 'react'
import { getStoryStatus, formatDuration, getStoryCompletionStatus } from '@/lib/storyManager'
import { StoryStatus } from '@/lib/storyManager'

export function StoryProgress() {
  const [storyStatus, setStoryStatus] = useState<StoryStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStoryStatus()
  }, [])

  const loadStoryStatus = async () => {
    try {
      const status = await getStoryStatus()
      setStoryStatus(status)
    } catch (error) {
      console.error('Error loading story status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-card rounded w-32 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-card rounded"></div>
          <div className="h-4 bg-card rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!storyStatus?.currentStory) {
    return (
      <div className="card">
        <h2 className="text-2xl font-medium mb-4 text-text-primary">Current Story</h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-card rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-medium text-text-primary mb-2">No Story in Progress</h3>
          <p className="text-sm text-text-secondary">A new story will begin when voting starts!</p>
        </div>
      </div>
    )
  }

  const { currentStory, episodes, totalDuration, progressPercentage } = storyStatus
  const completionStatus = getStoryCompletionStatus(totalDuration)

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-medium text-text-primary">Current Story</h2>
          <h3 className="text-base text-text-secondary mt-1">{currentStory.title || `Story #${currentStory.story_number}`}</h3>
        </div>
        <div className="text-right">
          <div className={`text-sm font-medium ${completionStatus.color}`}>
            {completionStatus.message}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-text-secondary">Episode {episodes.length}</span>
            <span className="text-text-secondary">
              {formatDuration(totalDuration)} / 7-9 min
            </span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill relative"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            >
              {progressPercentage > 5 && (
                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>

          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>0:00</span>
            <span className="text-warning">7:00</span>
            <span className="text-error">9:00</span>
          </div>
        </div>

        {/* Story Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-xl font-semibold text-primary">{episodes.length}</div>
            <div className="text-xs text-text-muted">Episodes</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-secondary">{formatDuration(totalDuration)}</div>
            <div className="text-xs text-text-muted">Duration</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-primary">{Math.round(progressPercentage)}%</div>
            <div className="text-xs text-text-muted">Complete</div>
          </div>
        </div>

        {/* Completion Warning */}
        {totalDuration >= 420 && (
          <div className="card-warning">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-warning flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-warning text-sm font-medium">Story Approaching Finale!</p>
                <p className="text-warning/80 text-xs">
                  {totalDuration < 540
                    ? `${Math.ceil((540 - totalDuration) / 60)} more minutes possible`
                    : 'Story will conclude after next episode'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}