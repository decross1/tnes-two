import { VotingSession } from '@/types/database'

// Voting session times (in 24-hour format)
const VOTING_TIMES = [
  { hour: 8, minute: 0 },   // 8:00 AM
  { hour: 10, minute: 0 },  // 10:00 AM
  { hour: 12, minute: 0 },  // 12:00 PM
  { hour: 14, minute: 0 },  // 2:00 PM
]

const SESSION_DURATION_HOURS = 2
const CATEGORIES = [
  'Character/Subject',
  'Action/Verb', 
  'Object/Setting',
  'Mood/Twist'
] as const

export function getCurrentSession(): VotingSession | null {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  
  for (let i = 0; i < VOTING_TIMES.length; i++) {
    const sessionStart = new Date(now)
    sessionStart.setHours(VOTING_TIMES[i].hour, VOTING_TIMES[i].minute, 0, 0)
    
    const sessionEnd = new Date(sessionStart)
    sessionEnd.setHours(sessionStart.getHours() + SESSION_DURATION_HOURS)
    
    if (now >= sessionStart && now <= sessionEnd) {
      return {
        date: today,
        time: i,
        startTime: sessionStart,
        endTime: sessionEnd,
        isActive: true,
        category: CATEGORIES[i]
      }
    }
  }
  
  return null
}

export function getNextSession(): VotingSession {
  const now = new Date()
  let targetDate = new Date(now)
  
  // Check if there's a session later today
  for (let i = 0; i < VOTING_TIMES.length; i++) {
    const sessionStart = new Date(now)
    sessionStart.setHours(VOTING_TIMES[i].hour, VOTING_TIMES[i].minute, 0, 0)
    
    if (now < sessionStart) {
      const sessionEnd = new Date(sessionStart)
      sessionEnd.setHours(sessionStart.getHours() + SESSION_DURATION_HOURS)
      
      return {
        date: targetDate.toISOString().split('T')[0],
        time: i,
        startTime: sessionStart,
        endTime: sessionEnd,
        isActive: false,
        category: CATEGORIES[i]
      }
    }
  }
  
  // No more sessions today, get first session tomorrow
  targetDate.setDate(targetDate.getDate() + 1)
  const sessionStart = new Date(targetDate)
  sessionStart.setHours(VOTING_TIMES[0].hour, VOTING_TIMES[0].minute, 0, 0)
  
  const sessionEnd = new Date(sessionStart)
  sessionEnd.setHours(sessionStart.getHours() + SESSION_DURATION_HOURS)
  
  return {
    date: targetDate.toISOString().split('T')[0],
    time: 0,
    startTime: sessionStart,
    endTime: sessionEnd,
    isActive: false,
    category: CATEGORIES[0]
  }
}

export function getTimeUntilNextSession(): number {
  const nextSession = getNextSession()
  return nextSession.startTime.getTime() - Date.now()
}

export function getTimeUntilSessionEnd(): number {
  const currentSession = getCurrentSession()
  if (!currentSession) return 0
  return currentSession.endTime.getTime() - Date.now()
}

export function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) return '00:00:00'
  
  const hours = Math.floor(milliseconds / (1000 * 60 * 60))
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function getSessionStatus(): {
  currentSession: VotingSession | null
  nextSession: VotingSession
  timeUntilNext: number
  timeUntilEnd: number
} {
  const currentSession = getCurrentSession()
  const nextSession = getNextSession()
  const timeUntilNext = getTimeUntilNextSession()
  const timeUntilEnd = getTimeUntilSessionEnd()
  
  return {
    currentSession,
    nextSession,
    timeUntilNext,
    timeUntilEnd
  }
}