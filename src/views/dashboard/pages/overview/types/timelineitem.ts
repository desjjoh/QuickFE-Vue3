import type { Tone } from '@/library/types/components/buttons'

export type TimelineItem = {
  id: string
  title: string
  description?: string
  timestamp: string
  tone: Tone
}
