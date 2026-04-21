import type { Tone } from '@/shared/types/components/buttons'

type TimelineItem = {
  id: string
  title: string
  description?: string
  timestamp: string
  tone: Tone
}

export const recentActivity: TimelineItem[] = [
  {
    id: 'activity-1',
    title: 'Jamie L. completed 45min session',
    description: 'Personal best: 12.5km distance, avg heart rate 145bpm',
    timestamp: '2 hours ago',
    tone: 'success',
  },
  {
    id: 'activity-2',
    title: 'Tyler M. completed morning session',
    description: 'Consistent improvement in endurance (+8% vs baseline)',
    timestamp: '5 hours ago',
    tone: 'primary',
  },
  {
    id: 'activity-3',
    title: 'Sophie K. achieved weekly goal',
    description: '5 sessions completed - 100% adherence this week!',
    timestamp: 'Yesterday',
    tone: 'success',
  },
]
