import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

export interface ApiError {
  message: string
  code?: string
  details?: any
}

export function createErrorResponse(error: ApiError, status: number = 500) {
  return NextResponse.json(
    { 
      error: error.message, 
      code: error.code,
      details: error.details 
    },
    { status }
  )
}

export function createSuccessResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status })
}

export function hashIP(ip: string): string {
  return createHash('sha256').update(ip + process.env.IP_SALT || 'default-salt').digest('hex')
}

export function getClientIP(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('remote-addr')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  return realIP || remoteAddr || 'unknown'
}

export async function validateAnonymousUser(anonymousUserId: string): Promise<boolean> {
  // Basic UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(anonymousUserId)
}

export function validateSessionParams(sessionDate: string, sessionTime: number): boolean {
  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(sessionDate)) {
    return false
  }
  
  // Validate session time (0-3)
  return Number.isInteger(sessionTime) && sessionTime >= 0 && sessionTime <= 3
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  key: string, 
  maxRequests: number = 5, 
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimitStore.get(key)
  
  if (!record || now > record.resetTime) {
    // New window
    const resetTime = now + windowMs
    rateLimitStore.set(key, { count: 1, resetTime })
    return { allowed: true, remaining: maxRequests - 1, resetTime }
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }
  
  // Increment count
  record.count++
  rateLimitStore.set(key, record)
  
  return { 
    allowed: true, 
    remaining: maxRequests - record.count, 
    resetTime: record.resetTime 
  }
}

export function cleanupRateLimit() {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Clean up every 30 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimit, 30 * 60 * 1000)
}