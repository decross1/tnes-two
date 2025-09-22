import { z } from 'zod'

export const submissionSchema = z.object({
  phrase: z.string()
    .min(1, "Please enter at least one word")
    .max(300, "Phrase is too long")
    .refine((phrase) => {
      const words = phrase.trim().split(/\s+/)
      return words.length <= 10
    }, "Maximum 10 words allowed")
    .refine((phrase) => {
      const words = phrase.trim().split(/\s+/)
      return words.every(word => word.length <= 30)
    }, "Each word must be 30 characters or less")
})

export interface SubmissionValidation {
  isValid: boolean
  errors: string[]
  wordCount: number
}

export function validateSubmission(text: string): SubmissionValidation {
  const errors: string[] = []
  
  // Split into words
  const words = text.trim().split(/\s+/).filter(word => word.length > 0)
  const wordCount = words.length
  
  // Check if empty
  if (wordCount === 0) {
    errors.push("Please enter at least one word")
  }
  
  // Check word count
  if (wordCount > 10) {
    errors.push("Maximum 10 words allowed")
  }
  
  // Check individual word length
  const longWords = words.filter(word => word.length > 30)
  if (longWords.length > 0) {
    errors.push("Each word must be 30 characters or less")
  }
  
  // Check total length
  if (text.length > 300) {
    errors.push("Phrase is too long (max 300 characters)")
  }
  
  // Check for inappropriate content (basic check)
  const inappropriatePatterns = [
    /\b(fuck|shit|damn|hell|bitch|ass|crap)\b/i
  ]
  
  if (inappropriatePatterns.some(pattern => pattern.test(text))) {
    errors.push("Please keep submissions family-friendly")
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    wordCount
  }
}

export function sanitizePhrase(phrase: string): string {
  return phrase
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s'-]/g, '') // Keep only letters, numbers, spaces, hyphens, and apostrophes
}

export const voteSchema = z.object({
  submissionId: z.string().uuid(),
  anonymousUserId: z.string().uuid(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sessionTime: z.number().min(0).max(3)
})