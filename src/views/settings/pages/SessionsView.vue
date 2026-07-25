<template>
  <SettingsLayout>
    <SettingsSection
      :title="$t('settings.sessions.section.title')"
      :description="$t('settings.sessions.section.description')"
    >
      <SettingsListItem
        v-for="session in sessions"
        :key="session.id"
        :tone="session.isCurrent ? 'primary' : session.isStale ? 'neutral' : 'success'"
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

            <BlockText v-if="hasLocation(session.data)" size="sm">
              {{ formatSessionLocation(session.data) }}
            </BlockText>

            <BlockText v-else size="sm" tone="tertiary">
              {{ $t('settings.sessions.notAvailable') }}
            </BlockText>
          </FlexBox>
        </template>

        <template #value>
          <FlexBox direction="column" :gap="1">
            <BlockText v-if="session.isCurrent" tone="primary" weight="semibold">
              {{ $t('settings.sessions.current.title') }}
            </BlockText>

            <StatusIndicator v-if="session.isCurrent" tone="success">
              <InlineText size="sm">{{ $t('settings.sessions.active') }}</InlineText>
            </StatusIndicator>

            <template v-else>
              <BlockText tone="primary" size="sm">
                {{
                  $t('settings.sessions.lastActive', {
                    date: formatLastActive(session.data.updatedAt),
                  })
                }}
              </BlockText>

              <StatusIndicator :tone="session.isStale ? 'neutral' : 'success'">
                <InlineText size="sm">
                  {{ $t(session.isStale ? 'settings.sessions.stale' : 'settings.sessions.active') }}
                </InlineText>
              </StatusIndicator>
            </template>
          </FlexBox>
        </template>

        <IconButton
          variant="surface"
          tone="danger"
          :loading="revokingSessionId === session.id"
          @click="revokeSession(session)"
          :icon="RefreshCwOff"
        />
      </SettingsListItem>
    </SettingsSection>

    <SettingsSection
      :title="$t('settings.sessions.revokeAll.section.title')"
      :description="$t('settings.sessions.revokeAll.section.description')"
    >
      <SettingsListItem
        :title="$t('settings.sessions.revokeAll.title')"
        :description="$t('settings.sessions.revokeAll.description')"
        tone="danger"
      >
        <BaseButton
          variant="surface"
          tone="danger"
          :loading="isRevokingAll"
          @click="revokeAllSessions"
        >
          {{ $t('settings.sessions.revokeAll.action') }}
        </BaseButton>
      </SettingsListItem>
    </SettingsSection>
  </SettingsLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useAuthStore, type AuthStore } from '@/stores/auth.ts'
import type { SessionDto, UserDto } from '@/library/models/user.ts'
import { formatLocalizedDateTime } from '@/helpers/date.ts'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import SettingsLayout from '../layouts/SettingsLayout.vue'
import SettingsSection from '../layouts/SettingsSection.vue'
import SettingsListItem from '../widgets/SettingsListItem.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import StatusIndicator from '@/shared/components/badges/StatusIndicator.vue'
import InlineText from '@/shared/components/text/InlineText.vue'
import { useSessions } from '../hooks/useSessionsActions.ts'
import IconButton from '@/shared/components/buttons/IconButton.vue'
import { RefreshCwOff } from 'lucide-vue-next'

const authStore: AuthStore = useAuthStore()
const { t, locale } = useI18n()

const user = computed<UserDto>(() => authStore.user!)
const { sessions, revokingSessionId, isRevokingAll, revokeSession, revokeAllSessions } =
  useSessions(user, t)

function formatSessionDevice(session: SessionDto): string {
  const browser = session.browser
  const operatingSystem = session.os

  if (browser && operatingSystem)
    return t('settings.sessions.deviceValue', { browser, os: operatingSystem })

  return browser || operatingSystem || session.device || t('settings.sessions.notAvailable')
}

function hasLocation(session: SessionDto): boolean {
  return !!session.city || !!session.regionName
}

function formatSessionLocation(session: SessionDto): string {
  return [session.city, session.regionName].filter(Boolean).join(', ')
}

function formatLastActive(value: Date): string {
  return formatLocalizedDateTime(value, String(locale.value))
}
</script>
