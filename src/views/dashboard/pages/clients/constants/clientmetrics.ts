import type { MetricsRow } from '@/views/dashboard/shared/types/clientmetrics'

export const clients: MetricsRow[] = [
  {
    id: 'jamie-lopez',
    initials: 'JL',
    name: 'Jamie Lopez, 14',
    subtitle: 'Physical Therapy',
    metrics: [
      { label: 'Sessions', value: '47' },
      { label: 'Adherence', value: '89%' },
      { label: 'Total Distance', value: '342km' },
    ],
    status: {
      label: 'active',
      tone: 'success',
    },
  },
  {
    id: 'sophie-kim',
    initials: 'SK',
    name: 'Sophie Kim, 16',
    subtitle: 'Youth Wellness',
    metrics: [
      { label: 'Sessions', value: '62' },
      { label: 'Adherence', value: '95%' },
      { label: 'Total Distance', value: '458km' },
    ],
    status: {
      label: 'active',
      tone: 'success',
    },
  },
  {
    id: 'emma-thompson',
    initials: 'ET',
    name: 'Emma Thompson, 12',
    subtitle: 'Occupational Therapy',
    metrics: [
      { label: 'Sessions', value: '18' },
      { label: 'Adherence', value: '62%' },
      { label: 'Total Distance', value: '87km' },
    ],
    status: {
      label: 'at risk',
      tone: 'warning',
    },
  },
  {
    id: 'tyler-martinez',
    initials: 'TM',
    name: 'Tyler Martinez, 15',
    subtitle: 'School Program',
    metrics: [
      { label: 'Sessions', value: '83' },
      { label: 'Adherence', value: '91%' },
      { label: 'Total Distance', value: '612km' },
    ],
    status: {
      label: 'active',
      tone: 'success',
    },
  },
  {
    id: 'alex-kovach',
    initials: 'AK',
    name: 'Alex Kovach, 13',
    subtitle: 'Physical Therapy',
    metrics: [
      { label: 'Sessions', value: '5' },
      { label: 'Adherence', value: '35%' },
      { label: 'Total Distance', value: '23km' },
    ],
    status: {
      label: 'inactive',
      tone: 'danger',
    },
  },
]
