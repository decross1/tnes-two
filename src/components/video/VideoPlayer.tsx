'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Episode } from '@/types/database'

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false })

interface VideoPlayerProps {
  episodes: Episode[]
  currentEpisodeIndex: number
  onEpisodeChange: (index: number) => void
  autoPlay?: boolean
}

export function VideoPlayer({ 
  episodes, 
  currentEpisodeIndex, 
  onEpisodeChange,
  autoPlay = false 
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [played, setPlayed] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const playerRef = useRef<any>(null)

  const currentEpisode = episodes[currentEpisodeIndex]

  useEffect(() => {
    setLoading(true)
    setError(null)
    setPlayed(0)
  }, [currentEpisodeIndex])

  const handleReady = () => {
    setLoading(false)
    if (autoPlay) {
      setPlaying(true)
    }
  }

  const handleError = (error: any) => {
    console.error('Video player error:', error)
    setError('Failed to load video')
    setLoading(false)
  }

  const handleEnded = () => {
    setPlaying(false)
    // Auto-advance to next episode
    if (currentEpisodeIndex < episodes.length - 1) {
      setTimeout(() => {
        onEpisodeChange(currentEpisodeIndex + 1)
      }, 1000)
    }
  }

  const handleProgress = (state: any) => {
    setPlayed(state.played)
  }

  const handleDuration = (duration: number) => {
    setDuration(duration)
  }

  const handleSeek = (value: number) => {
    const seekTo = value / 100
    setPlayed(seekTo)
    if (playerRef.current) {
      playerRef.current.seekTo(seekTo)
    }
  }

  const togglePlayPause = () => {
    setPlaying(!playing)
  }

  const goToPrevious = () => {
    if (currentEpisodeIndex > 0) {
      onEpisodeChange(currentEpisodeIndex - 1)
    }
  }

  const goToNext = () => {
    if (currentEpisodeIndex < episodes.length - 1) {
      onEpisodeChange(currentEpisodeIndex + 1)
    }
  }

  if (!currentEpisode) {
    return (
      <div className="card">
        <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-400">No episodes available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-white">
            Episode {currentEpisode.episode_number}
          </h3>
          <span className="text-sm text-gray-400">
            {currentEpisodeIndex + 1} of {episodes.length}
          </span>
        </div>
        
        {currentEpisode.winning_phrase && (
          <p className="text-sm text-accent italic">
            "{currentEpisode.winning_phrase}"
          </p>
        )}
      </div>

      <div className="relative">
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
                <p className="text-gray-400">Loading episode...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          )}

          <ReactPlayer
            ref={playerRef}
            url={currentEpisode.video_url || ''}
            playing={playing}
            onReady={handleReady}
            onError={handleError}
            onEnded={handleEnded}
            onProgress={handleProgress}
            onDuration={handleDuration}
            width="100%"
            height="100%"
            controls={false}
            config={{
              file: {
                attributes: {
                  crossOrigin: 'anonymous'
                }
              }
            }}
          />
        </div>

        {/* Custom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-3">
            <input
              type="range"
              min={0}
              max={100}
              value={played * 100}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPrevious}
                disabled={currentEpisodeIndex === 0}
                className="p-2 text-white hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={togglePlayPause}
                className="p-3 bg-accent hover:bg-accent/80 rounded-full text-black transition-colors"
              >
                {playing ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2z" />
                  </svg>
                )}
              </button>

              <button
                onClick={goToNext}
                disabled={currentEpisodeIndex === episodes.length - 1}
                className="p-2 text-white hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="text-white text-sm">
              {Math.floor(played * duration / 60)}:{Math.floor((played * duration) % 60).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* Episode Info */}
      {currentEpisode.story_prompt && (
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
          <p className="text-sm text-gray-300">
            <span className="font-medium text-white">Scene: </span>
            {currentEpisode.story_prompt}
          </p>
        </div>
      )}
    </div>
  )
}