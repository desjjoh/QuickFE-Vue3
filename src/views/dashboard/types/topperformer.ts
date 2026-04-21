export type PerformerMetric = {
  label: string
  value: string
}

export type TopPerformer = {
  id: string
  initials: string
  name: string
  subtitle: string
  metrics: PerformerMetric[]
  status: string
}

export const performers: TopPerformer[] = [
  {
    id: 'jamie-lopez',
    initials: 'JL',
    name: 'Jamie Lopez, 14',
    subtitle: 'Physical Therapy • Started Jan 15, 2026',
    metrics: [
      { label: 'Sessions', value: '4' },
      { label: 'Adherence', value: '92%' },
      { label: 'Distance', value: '45km' },
    ],
    status: 'EXCELLENT',
  },
  {
    id: 'sophie-kim',
    initials: 'SK',
    name: 'Sophie Kim, 16',
    subtitle: 'Youth Wellness Program • Started Dec 3, 2025',
    metrics: [
      { label: 'Sessions', value: '5' },
      { label: 'Adherence', value: '100%' },
      { label: 'Distance', value: '38km' },
    ],
    status: 'ON TRACK',
  },
]
