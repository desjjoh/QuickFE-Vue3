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

export function useProfileActivityDetails(record: () => AuditDto) {
  const { t } = useI18n()

  const unavailable = computed(() => t('profile.data.security.notAvailable'))
  const operatingSystem = computed(() => {
    const { os, osVersion } = record()

    return os ? [os, osVersion].filter(Boolean).join(' ') : null
  })

  const browser = computed(() => {
    const { browser, browserVersion } = record()

    return browser ? [browser, browserVersion].filter(Boolean).join(' ') : null
  })

  const device = computed(() => {
    const deviceName = record().device
    const os = operatingSystem.value

    if (deviceName && os)
      return t('profile.activityHistory.detail.deviceValue', { device: deviceName, os })

    return deviceName || os
  })

  const location = computed(() => {
    const { city, regionCode } = record().ipLocation

    return [city, regionCode].filter(Boolean).join(', ') || null
  })

  return { unavailable, browser, device, location }
}
