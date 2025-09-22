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
        <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!storyStatus?.currentStory) {
    return (
      <div className="card">
        <h2 className="text-2xl font-semibold mb-4 text-secondary">Current Story</h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-300 mb-2">No Story in Progress</h3>
          <p className="text-sm text-gray-500">A new story will begin when voting starts!</p>
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
          <h2 className="text-2xl font-semibold text-secondary">Current Story</h2>
          <h3 className="text-lg text-white mt-1">{currentStory.title || `Story #${currentStory.story_number}`}</h3>
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
            <span className="text-gray-300">Episode {episodes.length}</span>
            <span className="text-gray-300">
              {formatDuration(totalDuration)} / 7-9 min
            </span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-secondary to-accent h-3 rounded-full transition-all duration-500 relative"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            >
              {progressPercentage > 5 && (
                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0:00</span>
            <span className="text-orange-400">7:00</span>
            <span className="text-red-400">9:00</span>
          </div>
        </div>

        {/* Story Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
          <div className="text-center">
            <div className="text-xl font-bold text-accent">{episodes.length}</div>
            <div className="text-xs text-gray-400">Episodes</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-secondary">{formatDuration(totalDuration)}</div>
            <div className="text-xs text-gray-400">Duration</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-primary">{Math.round(progressPercentage)}%</div>
            <div className="text-xs text-gray-400">Complete</div>
          </div>
        </div>

        {/* Completion Warning */}
        {totalDuration >= 420 && (
          <div className="bg-orange-900/20 border border-orange-500/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-orange-400 text-sm font-medium">Story Approaching Finale!</p>
                <p className="text-orange-300 text-xs">
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