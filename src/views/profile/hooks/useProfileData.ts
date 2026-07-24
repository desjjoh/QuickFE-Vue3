import { computed, type ComputedRef, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { formatIsoDate, formatLocalizedDateTime } from '@/helpers/date.ts'
import type { UserDto } from '@/library/models/user'
import { useReferenceTranslations } from '@/shared/hooks/useReferenceTranslations.ts'
import { useFormatter } from '@/shared/hooks/useFormatter'

export type ProfileDataItem = {
  key: string
  label: string
  value?: string | null
  emptyLabel?: string
}

export type ProfileData = {
  timelineData: ComputedRef<ProfileDataItem[]>
  sessionData: ComputedRef<ProfileDataItem[]>
  securityData: ComputedRef<ProfileDataItem[]>
  overviewData: ComputedRef<ProfileDataItem[]>
}

export function useProfileData(user: Ref<UserDto>): ProfileData {
  const { locale, t } = useI18n()
  const { genderLabel, countryLabel, timezoneLabel } = useReferenceTranslations()
  const { formatPhoneNumber, formatAddressLineOne } = useFormatter()

  function getLastChangedLabel(value: Date | null): string {
    return formatLocalizedDateTime(value, String(locale.value))
  }

  function formatSessionDevice(browser: string | null, os: string | null): string | null {
    if (browser && os) return t('profile.data.session.deviceValue', { browser, os })

    return browser ?? os
  }

  function formatSessionLocation(city: string | null, regionCode: string | null): string | null {
    return [city, regionCode].filter(Boolean).join(', ') || null
  }

  const timelineData = computed<ProfileDataItem[]>(() => [
    {
      key: 'member_since',
      label: t('profile.data.timeline.memberSince'),
      value: getLastChangedLabel(user.value.createdAt),
    },
    {
      key: 'last_sign_in',
      label: t('profile.data.timeline.lastSignIn'),
      value: getLastChangedLabel(user.value.metadata.lastSignIn),
    },
    {
      key: 'last_updated',
      label: t('profile.data.timeline.lastUpdated'),
      value: getLastChangedLabel(user.value.metadata.lastUpdatedAt),
    },
  ])

  const sessionData = computed<ProfileDataItem[]>(() => [
    {
      key: 'device',
      label: t('profile.data.session.device'),
      value: formatSessionDevice(user.value.session.browser, user.value.session.os),
    },
    {
      key: 'last_location',
      label: t('profile.data.session.lastLocation'),
      value: formatSessionLocation(user.value.session.city, user.value.session.regionName),
      emptyLabel: t('profile.data.security.notAvailable'),
    },
    {
      key: 'ip_address',
      label: t('profile.data.session.ipAddress'),
      value: user.value.session.ipAddress,
    },
  ])

  const securityData = computed<ProfileDataItem[]>(() => {
    const lastChangedPassword = getLastChangedLabel(user.value.metadata.lastChangedPassword)
    const lastChangedEmail = getLastChangedLabel(user.value.metadata.lastChangedEmail)
    const has2fa = user.value.metadata.mfa_enabled
      ? t('settings.security.items.twoFactor.badge.enabled')
      : undefined

    return [
      {
        key: '2fa',
        label: t('profile.data.security.twoFactor'),
        value: has2fa,
        emptyLabel: t('profile.data.security.notAvailable'),
      },
      {
        key: 'email',
        label: t('profile.data.security.emailChanged'),
        value: lastChangedEmail,
        emptyLabel: t('profile.data.security.notAvailable'),
      },
      {
        key: 'password',
        label: t('profile.data.security.passwordChanged'),
        value: lastChangedPassword,
        emptyLabel: t('profile.data.security.notAvailable'),
      },
    ]
  })

  const overviewData = computed<ProfileDataItem[]>(() => [
    {
      key: 'preferred_name',
      label: t('profile.data.overview.preferredName'),
      value: user.value.profile.name.preferred,
      emptyLabel: t('profile.cards.overview.empty.preferredName'),
    },
    {
      key: 'dob',
      label: t('profile.data.overview.dateOfBirth'),
      value: formatIsoDate(user.value.profile.personal.dob, locale.value),
    },
    {
      key: 'gender',
      label: t('profile.data.overview.gender'),
      value: genderLabel(user.value.profile.personal.gender),
    },
    {
      key: 'country',
      label: t('profile.data.overview.country'),
      value: countryLabel(user.value.profile.region.country),
    },
    {
      key: 'timezone',
      label: t('profile.data.overview.timezone'),
      value: timezoneLabel(user.value.profile.region.timezone),
    },
    {
      key: 'phone',
      label: t('profile.data.overview.phone'),
      value: formatPhoneNumber(user.value.profile.contact.phone),
      emptyLabel: t('settings.profile.items.phone.empty'),
    },
    {
      key: 'address',
      label: t('profile.data.overview.address'),
      value: formatAddressLineOne(user.value.profile.contact.address),
      emptyLabel: t('settings.profile.items.address.empty'),
    },
  ])

  return {
    timelineData,
    sessionData,
    securityData,
    overviewData,
  }
}
