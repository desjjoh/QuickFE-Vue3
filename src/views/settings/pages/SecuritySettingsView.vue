<template>
  <SettingsLayout>
    <SettingsSection
      :title="$t('settings.security.sections.signIn.title')"
      :description="$t('settings.security.sections.signIn.description')"
    >
      <SettingsListItem
        :key="`${ref_id}-email`"
        :icon="Mail"
        :title="$t('settings.security.items.email.title')"
        :description="$t('settings.security.items.email.description')"
      >
        <template #value>
          <FlexBox direction="column" :gap="1">
            <FlexBox align-items="center" :gap="2">
              <CircleCheck :size="18" class="check__success" stroke-width="2.5" />

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

      <SettingsListItem
        :key="`${ref_id}-password`"
        :icon="Lock"
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

    <SettingsSection
      :title="$t('settings.security.sections.twoFactor.title')"
      :description="$t('settings.security.sections.twoFactor.description')"
    >
      <SettingsListItem
        :key="`${ref_id}-two-factor-authentication`"
        :icon="Shield"
        :title="$t('settings.security.sections.twoFactor.title')"
        :description="$t('settings.security.items.twoFactor.description')"
      >
        <template #value>
          <BaseBadge variant="soft" tone="neutral" pill>
            {{ $t('settings.security.items.twoFactor.notEnabled') }}
          </BaseBadge>
        </template>

        <BaseButton :variant="$variant" disabled>
          {{ $t('common.enable') }}
        </BaseButton>
      </SettingsListItem>
    </SettingsSection>

    <SettingsSection
      :title="$t('settings.security.sections.deleteAccount.title')"
      :description="$t('settings.security.sections.deleteAccount.description')"
    >
      <SettingsListItem
        :key="`${ref_id}-delete-account`"
        :icon="Trash2"
        icon-tone="danger"
        :title="$t('settings.security.items.deleteAccount.title')"
        :description="$t('settings.security.items.deleteAccount.description')"
      >
        <BaseButton :variant="$variant" tone="danger" @click="deleteAccount">
          {{ $t('settings.security.sections.deleteAccount.title') }}
        </BaseButton>
      </SettingsListItem>
    </SettingsSection>
  </SettingsLayout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, useId } from 'vue'
import { CircleCheck, Lock, Mail, Shield, Trash2 } from 'lucide-vue-next'

import { $variant } from '../config/settings.ts'
import { useSettingsActions } from '../hooks/useAccountActions.ts'

import SettingsLayout from '../layouts/SettingsLayout.vue'
import SettingsSection from '../layouts/SettingsSection.vue'
import SettingsListItem from '../widgets/SettingsListItem.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import { useAuthStore } from '@/stores/auth.ts'
import type { UserDto } from '@/library/models/user.ts'

import BaseBadge from '@/shared/components/badges/BaseBadge.vue'
import { formatLocalizedDateTime } from '@/helpers/date.ts'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const { updateEmail, updatePassword, deleteAccount } = useSettingsActions(t)

const authenticatedUser = computed<UserDto>(() => authStore.user!)
const ref_id = useId()

function getLastChangedLabel(value: Date | null): string {
  const date = value
    ? formatLocalizedDateTime(value, String(locale.value))
    : t('common.notApplicable')

  return t('settings.security.lastChanged', { date })
}
</script>

<style lang="scss" scoped>
.check__success {
  flex: 0 0 auto;
  color: color(theme, success, theme-alpha, 11);
}
</style>
