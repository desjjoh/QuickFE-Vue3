<template>
  <SettingsLayout>
    <SettingsSection title="Sign in methods">
      <SettingsListItem
        :key="`${ref_id}-email`"
        :icon="Mail"
        title="Email"
        description="Used to sign in and receive account messages."
      >
        <BaseButton :variant="$variant" tone="primary">Manage</BaseButton>
      </SettingsListItem>

      <SettingsListItem
        :key="`${ref_id}-password`"
        :icon="Lock"
        title="Password"
        description="Used to protect your account."
      >
        <BaseButton :variant="$variant" tone="primary">Change password</BaseButton>
      </SettingsListItem>
    </SettingsSection>

    <SettingsSection title="Two-factor authentication">
      <SettingsListItem
        :key="`${ref_id}-two-factor-authentication`"
        :icon="KeyRound"
        title="Two-factor authentication"
        description="Two-factor authentication is not enabled yet."
      >
        <BaseButton :variant="$variant" tone="primary">
          Enable two-factor authentication
        </BaseButton>
      </SettingsListItem>
    </SettingsSection>

    <SettingsSection title="Delete account">
      <SettingsListItem
        :key="`${ref_id}-delete-account`"
        :icon="Trash2"
        title="Delete your account"
        description="Once you delete your account, there is no going back. Please be certain."
      >
        <BaseButton :variant="$variant" tone="danger">Delete account</BaseButton>
      </SettingsListItem>
    </SettingsSection>
  </SettingsLayout>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import { KeyRound, Lock, Mail, Trash2 } from 'lucide-vue-next'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'

import { $variant } from '../config/settings.ts'

import SettingsLayout from '../layouts/SettingsLayout.vue'
import SettingsSection from '../layouts/SettingsSection.vue'
import SettingsListItem from '../widgets/SettingsListItem.vue'

const ref_id = useId()
</script>
