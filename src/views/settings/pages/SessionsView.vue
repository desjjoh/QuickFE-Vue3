<template>
  <SettingsLayout>
    <SettingsSection
      title="Web sessions"
      description="This is a list of devices that have logged into your account. Revoke any sessions that you do not recognize."
    >
      <SettingsListItem key="active-session" :title="user.session.ipAddress">
        <BaseButton variant="surface" tone="neutral">Details</BaseButton>
      </SettingsListItem>
    </SettingsSection>
  </SettingsLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useAuthStore, type AuthStore } from '@/stores/auth.ts'
import type { UserDto } from '@/library/models/user.ts'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import SettingsLayout from '../layouts/SettingsLayout.vue'
import SettingsSection from '../layouts/SettingsSection.vue'
import SettingsListItem from '../widgets/SettingsListItem.vue'

const authStore: AuthStore = useAuthStore()

const user = computed<UserDto>(() => authStore.user!)
</script>
