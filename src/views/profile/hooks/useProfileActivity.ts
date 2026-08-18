import { computed, ref, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { auditEventLabel, type CurrentUserActivityRecord } from '@/library/models/audit'
import type {
  ActivityTimelineItemData,
  ActivityTimelineTone,
} from '@/library/components/timeline/ActivityTimeline.vue'
import { useLocalHostAPI } from '@/shared/api/useLocalhostAPI'
import { useAuthStore } from '@/shared/stores/auth'

const PROFILE_ACTIVITY_LIMIT = 5

function outcomeTone(outcome: string): ActivityTimelineTone {
  if (outcome === 'succeeded') return 'success'
  if (outcome === 'failed') return 'danger'
  if (outcome === 'denied') return 'warning'
  if (outcome === 'pending') return 'info'

  return 'neutral'
}

function activityDescription(activity: CurrentUserActivityRecord): string {
  return [activity.resourceType, activity.resourceId].filter(Boolean).join(' · ') || activity.domain
}

export interface ProfileActivity {
  activityItems: ComputedRef<ActivityTimelineItemData[]>
  loadActivity: () => Promise<void>
}

export function useProfileActivity(): ProfileActivity {
  const api = useLocalHostAPI()
  const authStore = useAuthStore()
  const { locale } = useI18n()
  const activities = ref<CurrentUserActivityRecord[]>([])

  const activityItems = computed<ActivityTimelineItemData[]>(() =>
    activities.value.map((activity) => ({
      id: activity.id,
      title: auditEventLabel(activity.event),
      description: activityDescription(activity),
      timestamp: new Intl.DateTimeFormat(locale.value, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(activity.occurredAt)),
      tone: outcomeTone(activity.outcome),
    })),
  )

  async function loadActivity(): Promise<void> {
    if (!authStore.canActivate(['read_current_user_activity'])) return

    const [accessToken, csrfToken] = await Promise.all([
      authStore.getValidAccessToken(),
      authStore.getValidCsrfToken(),
    ])
    const response = await api.account.activity(accessToken, csrfToken, {
      take: PROFILE_ACTIVITY_LIMIT,
    })
    activities.value = response.data
  }

  return { activityItems, loadActivity }
}
