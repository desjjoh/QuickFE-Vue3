<template>
  <CenteredLayout>
    <AccountHomeLayout
      title="Account home"
      :subtitle="`Welcome back, ${user.profile.name.preferred ?? user.profile.name.first}. Here's
            what's happening with your account.`"
    >
      <template #header>
        <ProfileHeader :user="user" />
      </template>

      <template #timeline>
        <CompactCard
          title="Account timeline"
          subtitle="Key milestones and account access history."
          :data_list="timeline_data"
        />
      </template>

      <template #session>
        <CompactCard
          title="Active session"
          subtitle="Details about your current sing-in session."
          :data_list="session_data"
        />
      </template>

      <template #security>
        <CompactCard
          title="Security summary"
          subtitle="A quick look at your account access settings."
          :data_list="security_data"
        />
      </template>

      <template #overview>
        <InfoCard
          title="Profile overview"
          subtitle="Review the personal and regional details associated with your profile."
          :data_list="overview_data"
        />
      </template>

      <template #activity>
        <CardSection
          title="Recent activity"
          subtitle="Review recent sign-ins, profile updates, and security changes on your account."
          :icon="History"
        >
          <div class="wip">
            <BlockText text-align="center">
              Sign-ins, profile changes, and security updates will appear here when activity is
              available.
            </BlockText>
          </div>
        </CardSection>
      </template>
    </AccountHomeLayout>
  </CenteredLayout>
</template>

<script setup lang="ts">
import { computed, type ComputedRef } from 'vue'

import type { UserDto } from '@/library/models/user'
import { useAuthStore, type AuthStore } from '@/stores/auth'

import CenteredLayout from '@/shared/layouts/CenteredLayout.vue'
import ProfileHeader from './widgets/ProfileHeader.vue'

import CardSection from './layouts/CardSection.vue'

import { formatIsoDate, formatLocalizedDateTime } from '@/helpers/date.ts'
import { useI18n } from 'vue-i18n'
import { useReferenceTranslations } from '@/shared/hooks/useReferenceTranslations.ts'
import { History } from 'lucide-vue-next'

import BlockText from '@/shared/components/text/BlockText.vue'
import AccountHomeLayout from './layouts/AccountHomeLayout.vue'
import CompactCard from './widgets/CompactCard.vue'
import InfoCard from './widgets/InfoCard.vue'

const { locale } = useI18n()

const { genderLabel, countryLabel, timezoneLabel } = useReferenceTranslations()

const authStore: AuthStore = useAuthStore()
const user = computed<UserDto>(() => authStore.user!)

function getLastChangedLabel(value: Date | null): string {
  return formatLocalizedDateTime(value, String(locale.value))
}

type Data = {
  key: string
  label: string
  value?: string | null
}

const timeline_data: ComputedRef<Data[]> = computed<Data[]>(() => {
  return [
    {
      key: 'member_since',
      label: 'Member since',
      value: getLastChangedLabel(user.value.createdAt),
    },
    {
      key: 'last_sign_in',
      label: 'Last sign-in',
      value: getLastChangedLabel(user.value.metadata.lastSignIn),
    },
    {
      key: 'last_updated',
      label: 'Last updated',
      value: getLastChangedLabel(user.value.metadata.lastUpdatedAt),
    },
  ]
})

const session_data: ComputedRef<Data[]> = computed<Data[]>(() => {
  return [
    {
      key: 'browser',
      label: 'Browser',
      value: `${user.value.session.browser} ${user.value.session.browserVersion}`,
    },
    {
      key: 'os',
      label: 'OS',
      value: `${user.value.session.os} ${user.value.session.osVersion}`,
    },
    {
      key: 'ip_address',
      label: 'IP address',
      value: user.value.session.ipAddress,
    },
  ]
})

const security_data: ComputedRef<Data[]> = computed<Data[]>(() => {
  const lastChangedPassword: string = formatLocalizedDateTime(
    user.value.metadata.lastChangedPassword,
    locale.value,
    'compact',
  )

  return [
    {
      key: 'status',
      label: 'Status',
      value: user.value.status.label,
    },
    {
      key: '2fa',
      label: '2FA',
      value: 'Not enabled',
    },
    {
      key: 'password',
      label: 'Password',
      value: lastChangedPassword ? `Last changed ${lastChangedPassword}` : 'Not available',
    },
  ]
})

const overview_data: ComputedRef<Data[]> = computed<Data[]>(() => {
  return [
    {
      key: 'full_name',
      label: 'Full name',
      value: user.value.getFullName(),
    },
    {
      key: 'preferred_name',
      label: 'Preferred name',
      value: user.value.profile.name.preferred,
    },
    {
      key: 'dob',
      label: 'Date of birth',
      value: formatIsoDate(user.value.profile.personal.dob, locale.value),
    },
    {
      key: 'gender',
      label: 'Gender',
      value: genderLabel(user.value.profile.personal.gender),
    },
    {
      key: 'country',
      label: 'Country',
      value: countryLabel(user.value.profile.region.country),
    },
    {
      key: 'timezone',
      label: 'Timezone',
      value: timezoneLabel(user.value.profile.region.timezone),
    },
  ]
})
</script>

<style scoped lang="scss">
.wip {
  display: grid;
  padding: space(10) space(8);
  flex: 1;

  align-items: center;
  justify-content: center;

  color: color(text, secondary);
  background: palette(white, 1);
  border-radius: border-radius(md);
  border: 0.2rem dashed color(theme, neutral, theme-alpha, 7);
}
</style>
