import { computed, type ComputedRef } from 'vue'
import type { ActivityTimelineItemData } from '@/library/components/timeline/ActivityTimeline.vue'
import { useProfileStore } from '../stores/profile'
import { useAuditPresentation } from '@/shared/hooks/useAuditPresentation'

export interface ProfileActivity {
  activityItems: ComputedRef<ActivityTimelineItemData[]>
}

export function useProfileActivity(): ProfileActivity {
  const profileStore = useProfileStore()
  const { activityDescription, activityTone, eventLabel, formatDateTime } = useAuditPresentation()

  const activityItems = computed<ActivityTimelineItemData[]>(() =>
    profileStore.accountHomeActivity.map((activity) => ({
      id: activity.id,
      title: eventLabel(activity.event),
      description: activityDescription(activity),
      timestamp: formatDateTime(activity.occurredAt),
      tone: activityTone(activity.event),
    })),
  )

  return { activityItems }
}
