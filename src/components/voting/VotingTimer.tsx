'use client'

import { useState, useEffect } from 'react'
import { formatTimeRemaining, getSessionStatus } from '@/lib/votingSession'
import { VotingSession } from '@/types/database'

interface VotingTimerProps {
  onSessionChange: (session: VotingSession | null) => void
}

export function VotingTimer({ onSessionChange }: VotingTimerProps) {
  const [sessionStatus, setSessionStatus] = useState(getSessionStatus())
  
  useEffect(() => {
    const updateTimer = () => {
      const newStatus = getSessionStatus()
      setSessionStatus(newStatus)
      
      // Notify parent when session changes
      const currentSessionId = sessionStatus.currentSession ? 
        `${sessionStatus.currentSession.date}-${sessionStatus.currentSession.time}` : null
      const newSessionId = newStatus.currentSession ? 
        `${newStatus.currentSession.date}-${newStatus.currentSession.time}` : null
      
      if (currentSessionId !== newSessionId) {
        onSessionChange(newStatus.currentSession)
      }
    }

    // Update immediately
    updateTimer()
    
    // Then update every second
    const interval = setInterval(updateTimer, 1000)
    
    return () => clearInterval(interval)
  }, [onSessionChange])

  const { currentSession, nextSession, timeUntilNext, timeUntilEnd } = sessionStatus

  if (currentSession) {
    return (
      <div className="card bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30 lg:h-full lg:flex lg:flex-col lg:justify-center">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Voting Active</h3>
            <p className="text-sm text-gray-300">
              Category: <span className="text-accent font-medium">{currentSession.category}</span>
            </p>
          </div>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </div>

        <div className="bg-black/20 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Time remaining:</span>
            <span className="font-mono text-lg text-accent">
              {formatTimeRemaining(timeUntilEnd)}
            </span>
          </div>

          <div className="mt-2 bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-accent to-secondary h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.max(0, (timeUntilEnd / (2 * 60 * 60 * 1000)) * 100)}%`
              }}
            />
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-2">
          Session ends at {currentSession.endTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    )
  }

  return (
    <div className="card bg-gray-800/50 border-gray-600 lg:h-full lg:flex lg:flex-col lg:justify-center">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-300">Next Session</h3>
          <p className="text-sm text-gray-400">
            Category: <span className="text-accent font-medium">{nextSession.category}</span>
          </p>
        </div>
        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
      </div>

      <div className="bg-black/20 rounded-lg p-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Starts in:</span>
          <span className="font-mono text-lg text-gray-300">
            {formatTimeRemaining(timeUntilNext)}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Voting opens at {nextSession.startTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })}
        {nextSession.startTime.toDateString() !== new Date().toDateString() &&
          ` on ${nextSession.startTime.toLocaleDateString()}`
        }
      </p>
    </div>
  )
}