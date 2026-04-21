import type { Component } from 'vue'
import { Target, Pause, Trophy } from 'lucide-vue-next'

type RecommendationItem = {
  id: string
  icon: Component
  title: string
  description: string
}

export const recommendations: RecommendationItem[] = [
  {
    id: 'increase-challenge-jamie',
    icon: Target,
    title: 'Increase Challenge for Jamie L.',
    description:
      'Consistent performance suggests readiness for difficulty increase. Consider adding hill climbs or intervals.',
  },
  {
    id: 'reengagement-emma',
    icon: Pause,
    title: 'Re-engagement Strategy for Emma T.',
    description:
      '7 days inactive. Suggest motivational check-in or goal adjustment to prevent dropout.',
  },
  {
    id: 'group-challenge',
    icon: Trophy,
    title: 'Group Challenge Opportunity',
    description:
      '5 clients at similar levels. Consider creating peer group challenge to boost engagement.',
  },
]
