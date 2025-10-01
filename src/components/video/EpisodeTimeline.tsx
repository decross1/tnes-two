'use client'

import { Episode } from '@/types/database'
import { formatDuration } from '@/lib/storyManager'

interface EpisodeTimelineProps {
  episodes: Episode[]
  currentEpisodeIndex: number
  onEpisodeSelect: (index: number) => void
}

export function EpisodeTimeline({ episodes, currentEpisodeIndex, onEpisodeSelect }: EpisodeTimelineProps) {
  if (episodes.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Episodes</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">No episodes yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Episodes</h3>
        <span className="text-sm text-gray-400">{episodes.length} episode{episodes.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {episodes.map((episode, index) => {
          const isActive = index === currentEpisodeIndex
          const isFuture = index > currentEpisodeIndex
          
          return (
            <button
              key={episode.id}
              onClick={() => onEpisodeSelect(index)}
              className={`
                w-full text-left p-3 rounded-lg transition-all duration-200 
                ${isActive 
                  ? 'bg-primary/20 border-2 border-primary' 
                  : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-700/50'
                }
                ${isFuture ? 'opacity-60' : ''}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-white'}`}>
                      Episode {episode.episode_number}
                    </span>
                    {isActive && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                        <span className="text-xs text-accent">Playing</span>
                      </div>
                    )}
                  </div>
                  
                  {episode.winning_phrase && (
                    <p className={`text-sm italic mb-1 truncate ${isActive ? 'text-accent' : 'text-gray-300'}`}>
                      "{episode.winning_phrase}"
                    </p>
                  )}
                  
                  {episode.story_prompt && (
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {episode.story_prompt}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col items-end space-y-1 ml-3">
                  {episode.duration_seconds && (
                    <span className="text-xs text-gray-500">
                      {formatDuration(episode.duration_seconds)}
                    </span>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    {new Date(episode.created_at).toLocaleDateString([], { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
              
              {/* Visual indicator for current episode */}
              {isActive && (
                <div className="mt-2 h-1 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
              )}
            </button>
          )
        })}
      </div>

      {/* Quick Navigation */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <button
            onClick={() => onEpisodeSelect(0)}
            disabled={currentEpisodeIndex === 0}
            className="text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            First Episode
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onEpisodeSelect(Math.max(0, currentEpisodeIndex - 1))}
              disabled={currentEpisodeIndex === 0}
              className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => onEpisodeSelect(Math.min(episodes.length - 1, currentEpisodeIndex + 1))}
              disabled={currentEpisodeIndex === episodes.length - 1}
              className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <button
            onClick={() => onEpisodeSelect(episodes.length - 1)}
            disabled={currentEpisodeIndex === episodes.length - 1}
            className="text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Latest Episode
          </button>
        </div>
      </div>
    </div>
  )
}