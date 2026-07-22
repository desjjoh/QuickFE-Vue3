<template>
  <SettingsLayout>
    <SettingsSection
      :title="$t('settings.sessions.section.title')"
      :description="$t('settings.sessions.section.description')"
    >
      <SettingsListItem
        v-for="session in sessions"
        :key="session.id"
        :tone="session.isCurrent ? 'success' : 'primary'"
      >
        <template #header>
          <FlexBox direction="column" :gap="1">
            <FlexBox direction="column">
              <BlockText element="h6" weight="semibold">
                {{ formatSessionDevice(session.data) }}
              </BlockText>

              <BlockText size="sm">
                {{ session.data.ipAddress ?? $t('settings.sessions.notAvailable') }}
              </BlockText>
            </FlexBox>

            <BlockText v-if="hasLocation(session.data)" size="sm" tone="secondary">
              {{ formatSessionLocation(session.data) }}
            </BlockText>

            <BlockText size="sm" tone="secondary">
              {{ $t('settings.sessions.notAvailable') }}
            </BlockText>
          </FlexBox>
        </template>

        <template #value>
          <FlexBox direction="column" :gap="1">
            <BlockText tone="primary"> Your current session </BlockText>
            <StatusIndicator tone="success">
              <InlineText size="sm">Active</InlineText>
            </StatusIndicator>
          </FlexBox>
        </template>

        <BaseButton variant="surface" tone="neutral">
          {{ $t('settings.sessions.actions.details') }}
        </BaseButton>
      </SettingsListItem>
    </SettingsSection>
  </SettingsLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useAuthStore, type AuthStore } from '@/stores/auth.ts'
import type { Session, UserDto } from '@/library/models/user.ts'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import SettingsLayout from '../layouts/SettingsLayout.vue'
import SettingsSection from '../layouts/SettingsSection.vue'
import SettingsListItem from '../widgets/SettingsListItem.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import StatusIndicator from '@/shared/components/badges/StatusIndicator.vue'
import InlineText from '@/shared/components/text/InlineText.vue'

type SessionListItem = {
  id: string
  data: Session
  isCurrent: boolean
}

const authStore: AuthStore = useAuthStore()
const { t } = useI18n()

const user = computed<UserDto>(() => authStore.user!)
const sessions = computed<SessionListItem[]>(() => [
  {
    id: 'current-session',
    data: user.value.session,
    isCurrent: true,
  },
])

function formatSessionDevice(session: Session): string {
  const browser = session.browser
  const operatingSystem = session.os

  if (browser && operatingSystem)
    return t('settings.sessions.deviceValue', { browser, os: operatingSystem })

  return browser || operatingSystem || session.device || t('settings.sessions.notAvailable')
}

function hasLocation(session: Session): boolean {
  return !!session.city || !!session.regionName
}

function formatSessionLocation(session: Session): string {
  return [session.city, session.regionName].filter(Boolean).join(', ')
}
</script>
