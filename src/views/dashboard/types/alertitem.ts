import type { Variant } from '@/shared/types/components/text'
import { TriangleAlert } from 'lucide-vue-next'
import type { Component } from 'vue'

type AlertItem = {
  id: string
  icon: Component
  title: string
  message: string
  variant: Variant
}

export const dashboardAlerts: AlertItem[] = [
  {
    id: 'low-client-activity',
    icon: TriangleAlert,
    title: '3 clients below activity targets',
    message: "Emma T., Marcus R., and Alex K. haven't logged sessions in 7+ days",
    variant: 'warning',
  },
]
