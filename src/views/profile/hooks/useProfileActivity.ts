import { computed, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ActivityTimelineItemData } from '@/library/components/timeline/ActivityTimeline.vue'
import type { AuditDto } from '@/library/models/audit'
import { useProfileStore } from '../stores/profile'
import { useAuditPresentation } from '@/shared/hooks/useAuditPresentation'

export interface ProfileActivity {
  activityItems: ComputedRef<ActivityTimelineItemData[]>
}

export function useProfileActivity(): ProfileActivity {
  const profileStore = useProfileStore()
  const { activityDescription, activityTone, eventLabel, formatDateTime } = useAuditPresentation()

  const activityItems = computed<ActivityTimelineItemData[]>(() =>
    profileStore.feedActivity.map((activity) => ({
      id: activity.id,
      title: eventLabel(activity.event),
      description: activityDescription(activity),
      timestamp: formatDateTime(activity.occurredAt),
      tone: activityTone(activity.event),
    })),
  )

  return { activityItems }
}

export function useProfileActivityDetails(record: () => AuditDto | null) {
  const { t } = useI18n()

  const unavailable = computed(() => t('profile.data.security.notAvailable'))
  const originFields = computed(() => {
    const item = record()

    if (!item) return []

    const { city, regionName, regionCode, countryName } = item.ipLocation

    return [
      { key: 'detail.route', value: item.route },
      { key: 'table.ipAddress', value: item.ipAddress },
      {
        key: 'detail.location',
        value: [city, regionName || regionCode, countryName].filter(Boolean).join(', '),
      },
      {
        key: 'detail.browser',
        value: [item.browser, item.browserVersion].filter(Boolean).join(' '),
      },
      { key: 'detail.device', value: item.device },
      { key: 'detail.os', value: [item.os, item.osVersion].filter(Boolean).join(' ') },
      { key: 'detail.userAgent', value: item.userAgent },
    ]
  })

  return { unavailable, originFields }
}
