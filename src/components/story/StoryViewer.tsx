'use client'

import { useState, useEffect } from 'react'
import { getStoryStatus } from '@/lib/storyManager'
import { StoryStatus } from '@/lib/storyManager'
import { VideoPlayer } from '@/components/video/VideoPlayer'
import { EpisodeTimeline } from '@/components/video/EpisodeTimeline'
import { StoryProgress } from './StoryProgress'

export function StoryViewer() {
  const [storyStatus, setStoryStatus] = useState<StoryStatus | null>(null)
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'player' | 'timeline'>('player')

  useEffect(() => {
    loadStoryStatus()
  }, [])

  const loadStoryStatus = async () => {
    try {
      const status = await getStoryStatus()
      setStoryStatus(status)
      
      // Start with the latest episode
      if (status.episodes.length > 0) {
        setCurrentEpisodeIndex(status.episodes.length - 1)
      }
    } catch (error) {
      console.error('Error loading story status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEpisodeChange = (index: number) => {
    setCurrentEpisodeIndex(index)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="card animate-pulse">
          <div className="h-6 bg-card rounded w-32 mb-4"></div>
          <div className="aspect-video bg-card rounded"></div>
        </div>
        <div className="card animate-pulse">
          <div className="h-32 bg-card rounded"></div>
        </div>
      </div>
    )
  }

  if (!storyStatus?.currentStory || storyStatus.episodes.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="w-16 h-16 mx-auto mb-3 bg-card rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>

        <h3 className="text-base font-medium text-text-primary mb-2">No Episodes Yet</h3>
        <p className="text-xs text-text-secondary">
          Vote to create the first episode!
        </p>
      </div>
    )
  }

  const { episodes } = storyStatus

  return (
    <div className="flex flex-col space-y-4 lg:h-full">
      {/* Combined Progress & Info Card - 30% height */}
      {episodes[currentEpisodeIndex] && (
        <div className="card lg:h-[30%] lg:flex lg:flex-col lg:justify-center">
          {/* Compact Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-text-secondary font-medium">Episode {episodes[currentEpisodeIndex].episode_number} of {episodes.length}</span>
              <span className="text-text-muted">
                {Math.round((storyStatus.totalDuration / 540) * 100)}% complete
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${Math.min((storyStatus.totalDuration / 540) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Episode Info */}
          <div className="space-y-2">
            <div>
              <p className="text-primary italic text-sm">
                "{episodes[currentEpisodeIndex].winning_phrase}"
              </p>
            </div>

            <div className="flex justify-between items-center text-xs pt-2 border-t border-border">
              <span className="text-text-muted">{episodes[currentEpisodeIndex].duration_seconds}s</span>
              <button
                onClick={() => setViewMode(viewMode === 'player' ? 'timeline' : 'player')}
                className="text-primary hover:text-primary-light"
              >
                {viewMode === 'player' ? 'View All →' : '← Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player - 70% height */}
      <div className="card lg:flex-1 lg:flex lg:flex-col lg:overflow-hidden">
        <VideoPlayer
          episodes={episodes}
          currentEpisodeIndex={currentEpisodeIndex}
          onEpisodeChange={handleEpisodeChange}
          autoPlay={false}
        />
      </div>

      {/* Timeline View (when toggled) */}
      {viewMode === 'timeline' && (
        <div className="card">
          <h4 className="text-base font-medium text-text-primary mb-3">All Episodes</h4>
          <EpisodeTimeline
            episodes={episodes}
            currentEpisodeIndex={currentEpisodeIndex}
            onEpisodeSelect={handleEpisodeChange}
          />
        </div>
      )}
    </div>
  )
}