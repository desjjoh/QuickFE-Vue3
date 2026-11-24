<template>
  <CenteredLayout>
    <FlexBox direction="column" :gap="6" grow>
      <FlexBox direction="column" :gap="4">
        <BlockText element="h2">{{ $t('profile.layout.title') }}</BlockText>
        <ProfileHeader :user="user" />

        <TabLayout>
          <template #tabs>
            <Tab to="profile-account">{{ $t('profile.layout.tabs.account') }}</Tab>
            <Tab to="profile-activity">{{ $t('profile.layout.tabs.activity') }}</Tab>
          </template>
        </TabLayout>
      </FlexBox>

      <RouterComponent />
    </FlexBox>
  </CenteredLayout>
</template>

<script setup lang="ts">
import RouterComponent from '@/library/components/routers/RouterComponent.vue'
import Tab from '@/library/components/tabs/TabRouter.vue'
import TabLayout from '@/library/components/tabs/TabLayout.vue'

import FlexBox from '@/library/components/flex/FlexBox.vue'
import BlockText from '@/library/components/text/BlockText.vue'
import CenteredLayout from '@/shared/layouts/CenteredLayout.vue'
import type { UserDto } from '@/library/models/user'
import { computed } from 'vue'
import { useAuthStore, type AuthStore } from '@/shared/stores/auth'
import ProfileHeader from './widgets/ProfileHeader.vue'

const authStore: AuthStore = useAuthStore()
const user = computed<UserDto>(() => authStore.user!)
</script>
