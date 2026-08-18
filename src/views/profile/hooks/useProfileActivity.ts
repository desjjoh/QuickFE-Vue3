import { computed, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'

import type { AuditDto } from '@/library/models/audit'
import type {
  ActivityTimelineItemData,
  ActivityTimelineTone,
} from '@/library/components/timeline/ActivityTimeline.vue'
import { useProfileStore } from '../stores/profile'

function activityTone(event: string, outcome: string): ActivityTimelineTone {
  if (outcome === 'failed') return 'danger'
  if (outcome === 'denied') return 'warning'
  if (outcome === 'pending') return 'info'

  if (/(deleted|removed|revoked|disabled)$/.test(event)) return 'danger'
  if (/(created|assigned|enabled|verification_succeeded)$/.test(event)) return 'success'
  if (/\.(sign_in|sign_out|completed)\./.test(event)) return 'primary'
  if (/(changed|updated|replaced)$/.test(event)) return 'warning'

  return 'neutral'
}

function activityDescription(activity: AuditDto): string {
  return [activity.resourceType, activity.resourceId].filter(Boolean).join(' · ') || activity.domain
}

export interface ProfileActivity {
  activityItems: ComputedRef<ActivityTimelineItemData[]>
}

export function useProfileActivity(): ProfileActivity {
  const profileStore = useProfileStore()
  const { locale, t, te } = useI18n()

  const activityItems = computed<ActivityTimelineItemData[]>(() =>
    profileStore.activity.map((activity) => ({
      id: activity.id,
      title: eventTitle(activity.event),
      description: activityDescription(activity),
      timestamp: new Intl.DateTimeFormat(locale.value, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(activity.occurredAt),
      tone: activityTone(activity.event, activity.outcome),
    })),
  )

  function eventTitle(event: string): string {
    const key = `profile.cards.activity.events.${event.replace(/\./g, '_')}`
    return te(key) ? t(key) : event
  }

  return { activityItems }
}
