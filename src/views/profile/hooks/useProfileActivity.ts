import { computed, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'

import type { AuditDto } from '@/library/models/audit'
import type {
  ActivityTimelineItemData,
  ActivityTimelineTone,
} from '@/library/components/timeline/ActivityTimeline.vue'
import { useProfileStore } from '../stores/profile'
import { LOCALIZED_DATE_TIME_FORMATS } from '@/shared/helpers/date'

function activityTone(event: string): ActivityTimelineTone {
  if (/(deleted|removed|revoked|disabled)$/.test(event)) return 'danger'
  if (/(created|assigned|enabled|verification_succeeded)$/.test(event)) return 'success'
  if (/\.(sign_in|sign_out|completed)\./.test(event)) return 'primary'
  if (/(changed|updated|replaced)$/.test(event)) return 'warning'

  return 'neutral'
}

export interface ProfileActivity {
  activityItems: ComputedRef<ActivityTimelineItemData[]>
}

export function useProfileActivity(): ProfileActivity {
  const profileStore = useProfileStore()
  const { locale, t, te } = useI18n()

  function formatSessionDevice(browser: string | null, os: string | null): string | null {
    if (browser && os) return t('profile.data.session.deviceValue', { browser, os })

    return browser ?? os
  }

  function formatSessionLocation(city: string | null, regionCode: string | null): string {
    return [city, regionCode].filter(Boolean).join(', ') || t('profile.data.security.notAvailable')
  }

  function activityDescription(activity: AuditDto): string {
    return (
      [
        formatSessionDevice(activity.browser, activity.os),
        formatSessionLocation(
          activity.ipLocation?.city ?? null,
          activity.ipLocation?.regionName ?? null,
        ),
      ]
        .filter(Boolean)
        .join(' · ') || activity.domain
    )
  }

  const activityItems = computed<ActivityTimelineItemData[]>(() =>
    profileStore.activity.map((activity) => ({
      id: activity.id,
      title: eventTitle(activity.event),
      description: activityDescription(activity),
      timestamp: new Intl.DateTimeFormat(locale.value, LOCALIZED_DATE_TIME_FORMATS['short']).format(
        activity.occurredAt,
      ),
      tone: activityTone(activity.event),
    })),
  )

  function eventTitle(event: string): string {
    const key = `profile.cards.activity.events.${event.replace(/\./g, '_')}`
    return te(key) ? t(key) : event
  }

  return { activityItems }
}
