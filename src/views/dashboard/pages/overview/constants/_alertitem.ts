import { TriangleAlert } from 'lucide-vue-next'

import type { AlertItem } from '@/views/dashboard/library/types/alertitem'

export const dashboardAlerts: AlertItem[] = [
  {
    id: 'low-client-activity',
    icon: TriangleAlert,
    title: '3 clients below activity targets',
    message: "Emma T., Marcus R., and Alex K. haven't logged sessions in 7+ days",
    variant: 'warning',
  },
]
