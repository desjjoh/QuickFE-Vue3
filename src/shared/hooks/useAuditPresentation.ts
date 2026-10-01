import { useI18n } from 'vue-i18n'

import type { ActivityTimelineTone } from '@/library/components/timeline/ActivityTimeline.vue'
import type { AuditDto } from '@/library/models/audit'
import {
  formatLocalizedDateTime,
  type DateTimeInput,
  type LocalizedDateTimeFormat,
} from '@/shared/helpers/date'

type AuditPresentationOptions = {
  eventKeyNamespace?: string
  dateFallbackKey?: string
  unavailableKey?: string
  deviceValueKey?: string
}

export function useAuditPresentation(options: AuditPresentationOptions = {}) {
  const { locale, t, te } = useI18n()
  const eventKeyNamespace = options.eventKeyNamespace ?? 'profile.cards.activity.events'
  const dateFallbackKey = options.dateFallbackKey ?? 'profile.data.security.notAvailable'
  const unavailableKey = options.unavailableKey ?? 'profile.data.security.notAvailable'
  const deviceValueKey = options.deviceValueKey ?? 'profile.data.session.deviceValue'

  function eventLabel(event: string): string {
    const key = `${eventKeyNamespace}.${event.replace(/\./g, '_')}`
    return te(key) ? t(key) : event
  }

  function activityTone(event: string): ActivityTimelineTone {
    if (/(deleted|removed|revoked|disabled)$/.test(event)) return 'danger'
    if (/(created|assigned|enabled|verification_succeeded)$/.test(event)) return 'success'
    if (/(changed|updated|replaced)$|(^|\.)sign_out(\.|$)/.test(event)) return 'warning'
    if (/(^|\.)sign_in(\.|$)|(^|\.)completed(\.|$)/.test(event)) return 'primary'

    return 'neutral'
  }

  function deviceDescription(browser: string | null, os: string | null): string | null {
    if (browser && os) return t(deviceValueKey, { browser, os })

    return browser ?? os
  }

  function locationDescription(city: string | null, region: string | null): string {
    return [city, region].filter(Boolean).join(', ') || t(unavailableKey)
  }

  function activityDescription(activity: AuditDto): string {
    return (
      [
        deviceDescription(activity.browser, activity.os),
        locationDescription(
          activity.ipLocation?.city ?? null,
          activity.ipLocation?.regionName ?? null,
        ),
      ]
        .filter(Boolean)
        .join(' · ') || activity.domain
    )
  }

  function formatDateTime(value: DateTimeInput, format: LocalizedDateTimeFormat = 'short'): string {
    return formatLocalizedDateTime(value, locale.value, format) || t(dateFallbackKey)
  }

  return {
    activityDescription,
    activityTone,
    deviceDescription,
    eventLabel,
    formatDateTime,
    locationDescription,
  }
}
