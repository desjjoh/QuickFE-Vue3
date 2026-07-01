<template>
  <SettingsLayout>
    <SettingsSection
      title="Sign in methods"
      description="Manage how you sign in and keep your account secure."
    >
      <SettingsListItem
        :key="`${ref_id}-email`"
        :icon="Mail"
        title="Email"
        description="Used to sign in and receive account messages."
      >
        <template #value>
          <FlexBox direction="column" :gap="1">
            <FlexBox align-items="center" :gap="2">
              <CircleCheck :size="18" class="check__success" />

              <BlockText tone="primary" truncate>
                {{ authenticatedUser.identity.email }}
              </BlockText>
            </FlexBox>

            <BlockText size="sm" tone="secondary" truncate>
              Last changed: —
              {{ formatLocalizedDateTime(authenticatedUser.metadata.lastChangedEmail, locale) }}
            </BlockText>
          </FlexBox>
        </template>

        <BaseButton :variant="$variant" tone="neutral" @click="updateEmail">Edit</BaseButton>
      </SettingsListItem>

      <SettingsListItem
        :key="`${ref_id}-password`"
        :icon="Lock"
        title="Password"
        description="Used to protect your account."
      >
        <template #value>
          <FlexBox direction="column" :gap="1">
            <BlockText tone="primary" size="sm">••••••••</BlockText>
            <BlockText size="sm" tone="secondary" truncate>
              Last changed: —
              {{ formatLocalizedDateTime(authenticatedUser.metadata.lastChangedPassword, locale) }}
            </BlockText>
          </FlexBox>
        </template>

        <BaseButton :variant="$variant" tone="neutral" @click="updatePassword">Edit</BaseButton>
      </SettingsListItem>
    </SettingsSection>

    <SettingsSection
      title="Two-factor authentication"
      description="Add an extra layer of security to your account."
    >
      <SettingsListItem
        :key="`${ref_id}-two-factor-authentication`"
        :icon="Shield"
        title="Two-factor authentication"
        description="Two-factor authentication is not enabled yet."
      >
        <template #value>
          <BaseBadge variant="soft" tone="neutral" pill> Not enabled </BaseBadge>
        </template>

        <BaseButton :variant="$variant" disabled>Enable</BaseButton>
      </SettingsListItem>
    </SettingsSection>

    <SettingsSection
      title="Delete account"
      description="Permanently remove your account and associated data."
    >
      <SettingsListItem
        :key="`${ref_id}-delete-account`"
        :icon="Trash2"
        icon-tone="danger"
        title="Delete your account"
        description="Once you confirm this action, there is no going back. Please be certain."
      >
        <BaseButton :variant="$variant" tone="danger" @click="deleteAccount">
          Delete account
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
import { useSettingsActions } from '../hooks/useSettingsActions.ts'

import SettingsLayout from '../layouts/SettingsLayout.vue'
import SettingsSection from '../layouts/SettingsSection.vue'
import SettingsListItem from '../widgets/SettingsListItem.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import { useAuthStore } from '@/stores/auth.ts'
import type { UserDto } from '@/library/models/user.ts'
import { formatLocalizedDateTime } from '@/helpers/date.ts'
import BaseBadge from '@/shared/components/badges/BaseBadge.vue'

const { t, locale } = useI18n()
const { updateEmail, updatePassword, deleteAccount } = useSettingsActions(t)

const authStore = useAuthStore()

const authenticatedUser = computed<UserDto>(() => authStore.user!)

const ref_id = useId()
</script>

<style lang="scss" scoped>
.check__success {
  flex: 0 0 auto;
  color: color(theme, success, theme-alpha, 11);
}
</style>
