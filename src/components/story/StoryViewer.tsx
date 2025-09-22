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
      <div className="space-y-6">
        <div className="card animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
          <div className="aspect-video bg-gray-700 rounded"></div>
        </div>
        <div className="card animate-pulse">
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!storyStatus?.currentStory || storyStatus.episodes.length === 0) {
    return (
      <div className="space-y-6">
        <StoryProgress />
        
        <div className="card text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Episodes Yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Episodes will appear here after the community votes and the daily story generation runs at 4pm.
          </p>
          
          <div className="inline-flex items-center space-x-2 text-sm text-accent">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Participate in voting to help create the first episode!</span>
          </div>
        </div>
      </div>
    )
  }

  const { episodes } = storyStatus

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <StoryProgress />

      {/* View Mode Tabs */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setViewMode('player')}
          className={`
            flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
            ${viewMode === 'player' 
              ? 'bg-primary text-white' 
              : 'text-gray-400 hover:text-white'
            }
          `}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2z" />
            </svg>
            <span>Video Player</span>
          </div>
        </button>
        
        <button
          onClick={() => setViewMode('timeline')}
          className={`
            flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
            ${viewMode === 'timeline' 
              ? 'bg-primary text-white' 
              : 'text-gray-400 hover:text-white'
            }
          `}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Episodes</span>
          </div>
        </button>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {viewMode === 'player' ? (
            <VideoPlayer
              episodes={episodes}
              currentEpisodeIndex={currentEpisodeIndex}
              onEpisodeChange={handleEpisodeChange}
              autoPlay={false}
            />
          ) : (
            <EpisodeTimeline
              episodes={episodes}
              currentEpisodeIndex={currentEpisodeIndex}
              onEpisodeSelect={handleEpisodeChange}
            />
          )}
        </div>

        <div className="space-y-6">
          {/* Quick episode selector for player mode */}
          {viewMode === 'player' && (
            <div className="card">
              <h4 className="font-semibold text-white mb-3">Quick Select</h4>
              <div className="grid grid-cols-2 gap-2">
                {episodes.slice(-6).map((episode, index) => {
                  const actualIndex = episodes.length - 6 + index
                  const isActive = actualIndex === currentEpisodeIndex
                  
                  return (
                    <button
                      key={episode.id}
                      onClick={() => handleEpisodeChange(actualIndex)}
                      className={`
                        p-2 rounded text-xs transition-colors
                        ${isActive 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }
                      `}
                    >
                      Ep {episode.episode_number}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Episode details */}
          {episodes[currentEpisodeIndex] && (
            <div className="card">
              <h4 className="font-semibold text-white mb-3">Episode Details</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide">Winning Phrase</label>
                  <p className="text-accent italic">
                    "{episodes[currentEpisodeIndex].winning_phrase}"
                  </p>
                </div>
                
                {episodes[currentEpisodeIndex].story_prompt && (
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide">Scene</label>
                    <p className="text-sm text-gray-300">
                      {episodes[currentEpisodeIndex].story_prompt}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-700">
                  <div>
                    <label className="text-xs text-gray-400">Duration</label>
                    <p className="text-sm text-white">
                      {episodes[currentEpisodeIndex].duration_seconds}s
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Created</label>
                    <p className="text-sm text-white">
                      {new Date(episodes[currentEpisodeIndex].created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Share options */}
          <div className="card">
            <h4 className="font-semibold text-white mb-3">Share</h4>
            <div className="space-y-2">
              <button className="w-full btn-secondary text-left flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span>Share Episode</span>
              </button>
              
              <button className="w-full btn-primary text-left flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Story</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}