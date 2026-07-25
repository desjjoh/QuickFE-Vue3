<template>
  <SettingsLayout>
    <SettingsSection
      :title="$t('settings.security.sections.signIn.title')"
      :description="$t('settings.security.sections.signIn.description')"
    >
      <!-- CHANGE EMAIL -->
      <SettingsListItem
        :key="`${ref_id}-email`"
        :title="$t('settings.security.items.email.title')"
        :description="$t('settings.security.items.email.description')"
      >
        <template #value>
          <FlexBox direction="column" :gap="1">
            <FlexBox align-items="center" :gap="2">
              <CircleCheck :size="16" class="check__success" stroke-width="3" />

              <BlockText tone="primary" truncate>
                {{ authenticatedUser.identity.email }}
              </BlockText>
            </FlexBox>

            <BlockText size="sm" tone="secondary" truncate>
              {{ getLastChangedLabel(authenticatedUser.metadata.lastChangedEmail) }}
            </BlockText>
          </FlexBox>
        </template>

        <BaseButton :variant="$variant" tone="neutral" @click="updateEmail">
          {{ $t('common.edit') }}
        </BaseButton>
      </SettingsListItem>

      <!-- CHANGE PASSWORD -->
      <SettingsListItem
        :key="`${ref_id}-password`"
        :title="$t('settings.security.items.password.title')"
        :description="$t('settings.security.items.password.description')"
      >
        <template #value>
          <FlexBox direction="column" :gap="1">
            <BlockText tone="primary" size="sm">••••••••</BlockText>
            <BlockText size="sm" tone="secondary" truncate>
              {{ getLastChangedLabel(authenticatedUser.metadata.lastChangedPassword) }}
            </BlockText>
          </FlexBox>
        </template>

        <BaseButton :variant="$variant" tone="neutral" @click="updatePassword">
          {{ $t('common.edit') }}
        </BaseButton>
      </SettingsListItem>
    </SettingsSection>

    <!-- TWO FACTOR AUTHENTICATION -->
    <SettingsSection
      :title="$t('settings.security.sections.twoFactor.title')"
      :description="$t('settings.security.sections.twoFactor.description')"
    >
      <SettingsListItem
        :tone="mfaTone"
        :key="`${ref_id}-two-factor-authentication`"
        :title="$t('settings.security.items.twoFactor.title')"
        :description="$t('settings.security.items.twoFactor.description')"
      >
        <template #value>
          <BaseBadge variant="soft" :tone="mfaTone" pill>
            {{ getTwoFactorBadgeLabel(authenticatedUser.metadata.mfa_enabled) }}
          </BaseBadge>
        </template>

        <BaseButton
          v-if="!authenticatedUser.metadata.mfa_enabled"
          :variant="$variant"
          tone="success"
          @click="updateMfa(true)"
        >
          {{ $t('common.enable') }}
        </BaseButton>

        <BaseButton v-else :variant="$variant" tone="danger" @click="updateMfa(false)">
          {{ $t('common.disable') }}
        </BaseButton>
      </SettingsListItem>
    </SettingsSection>

    <!-- DELETE ACCOUNT -->
    <SettingsSection
      :title="$t('settings.security.sections.deleteAccount.title')"
      :description="$t('settings.security.sections.deleteAccount.description')"
    >
      <SettingsListItem
        :key="`${ref_id}-delete-account`"
        tone="danger"
        :title="$t('settings.security.items.deleteAccount.title')"
        :description="$t('settings.security.items.deleteAccount.description')"
      >
        <BaseButton :variant="$variant" tone="danger" @click="deleteAccount">
          {{ $t('settings.security.items.deleteAccount.action') }}
        </BaseButton>
      </SettingsListItem>
    </SettingsSection>
  </SettingsLayout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, useId } from 'vue'
import { CircleCheck } from 'lucide-vue-next'

import { useAuthStore } from '@/stores/auth.ts'
import type { UserDto } from '@/library/models/user.ts'
import { formatLocalizedDateTime } from '@/helpers/date.ts'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BaseBadge from '@/shared/components/badges/BaseBadge.vue'

import { $variant } from '../config/settings.ts'
import { useSettingsActions } from '../hooks/useAccountActions.ts'
import SettingsLayout from '../layouts/SettingsLayout.vue'
import SettingsSection from '../layouts/SettingsSection.vue'
import SettingsListItem from '../widgets/SettingsListItem.vue'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const { updateEmail, updatePassword, deleteAccount, updateMfa } = useSettingsActions(t)

const authenticatedUser = computed<UserDto>(() => authStore.user!)
const ref_id = useId()

type MfaTone = 'success' | 'neutral'
const mfaTone = computed<MfaTone>(() =>
  authenticatedUser.value.metadata.mfa_enabled ? 'success' : 'neutral',
)

function getLastChangedLabel(value: Date | null): string {
  const date = value
    ? formatLocalizedDateTime(value, String(locale.value))
    : t('common.notApplicable')

  return t('settings.security.lastChanged', { date })
}

function getTwoFactorBadgeLabel(value: boolean): string {
  return value
    ? t('settings.security.items.twoFactor.badge.enabled')
    : t('settings.security.items.twoFactor.badge.notEnabled')
}
</script>

<style lang="scss" scoped>
.check__success {
  flex: 0 0 auto;
  color: color(theme, success, theme-alpha, 11);
}
</style>
