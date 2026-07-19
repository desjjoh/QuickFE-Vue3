import type { Tone } from '@/library/types/components/badges'

export type PerformerMetric = {
  label: string
  value: string
}

export type ClientStatus = {
  label: string
  tone: Tone
}

export type MetricsRow = {
  id: string
  initials: string
  name: string
  subtitle: string
  metrics: PerformerMetric[]
  status: ClientStatus
}
