import { Target, Pause, Trophy } from 'lucide-vue-next'

import type { RecommendationItem } from '../types/recommendationitem'

export const recommendations: RecommendationItem[] = [
  {
    id: 'increase-challenge-jamie',
    icon: Target,
    title: 'Increase challenge for Jamie L.',
    description:
      'Consistent performance suggests readiness for difficulty increase. Consider adding hill climbs or intervals.',
  },
  {
    id: 'reengagement-emma',
    icon: Pause,
    title: 'Re-engagement strategy for Emma T.',
    description:
      '7 days inactive. Suggest motivational check-in or goal adjustment to prevent dropout.',
  },
  {
    id: 'group-challenge',
    icon: Trophy,
    title: 'Group challenge opportunity',
    description:
      '5 clients at similar levels. Consider creating peer group challenge to boost engagement.',
  },
]
