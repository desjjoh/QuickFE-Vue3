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
}

export type ProfileData = {
  timelineData: ComputedRef<ProfileDataItem[]>
  sessionData: ComputedRef<ProfileDataItem[]>
  securityData: ComputedRef<ProfileDataItem[]>
  overviewData: ComputedRef<ProfileDataItem[]>
}

export function useProfileData(user: Ref<UserDto>): ProfileData {
  const { locale, t } = useI18n()
  const { genderLabel, countryLabel, timezoneLabel, statusLabel } = useReferenceTranslations()
  const { formatPhoneNumber, formatAddressLineOne } = useFormatter()

  function getLastChangedLabel(value: Date | null): string {
    return formatLocalizedDateTime(value, String(locale.value))
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
      key: 'browser',
      label: t('profile.data.session.browser'),
      value: `${user.value.session.browser} ${user.value.session.browserVersion}`,
    },
    {
      key: 'os',
      label: t('profile.data.session.os'),
      value: `${user.value.session.os} ${user.value.session.osVersion}`,
    },
    {
      key: 'ip_address',
      label: t('profile.data.session.ipAddress'),
      value: user.value.session.ipAddress,
    },
  ])

  const securityData = computed<ProfileDataItem[]>(() => {
    const lastChangedPassword = formatLocalizedDateTime(
      user.value.metadata.lastChangedPassword,
      locale.value,
      'compact',
    )

    return [
      {
        key: 'status',
        label: t('profile.data.security.status'),
        value: statusLabel(user.value.status),
      },
      {
        key: '2fa',
        label: t('profile.data.security.twoFactor'),
        value: t('profile.data.security.notEnabled'),
      },
      {
        key: 'password',
        label: t('profile.data.security.password'),
        value: lastChangedPassword
          ? t('profile.data.security.lastChanged', { date: lastChangedPassword })
          : t('profile.data.security.notAvailable'),
      },
    ]
  })

  const overviewData = computed<ProfileDataItem[]>(() => [
    {
      key: 'full_name',
      label: t('profile.data.overview.fullName'),
      value: user.value.getFullName(),
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
    },
    {
      key: 'address',
      label: t('profile.data.overview.address'),
      value: formatAddressLineOne(user.value.profile.contact.address),
    },
  ])

  return {
    timelineData,
    sessionData,
    securityData,
    overviewData,
  }
}
