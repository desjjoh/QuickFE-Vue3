<template>
  <AccountHomeLayout
    :title="$t('profile.page.title')"
    :subtitle="
      $t('profile.page.subtitle', {
        name: user.profile.name.preferred ?? user.profile.name.first,
      })
    "
  >
    <template #header>
      <ProfileHeader :user="user" />
    </template>

    <template #timeline>
      <CompactCard
        :title="$t('profile.cards.timeline.title')"
        :subtitle="$t('profile.cards.timeline.subtitle')"
        :data_list="timelineData"
      />
    </template>

    <template #session>
      <CompactCard
        :title="$t('profile.cards.session.title')"
        :subtitle="$t('profile.cards.session.subtitle')"
        :data_list="sessionData"
      />
    </template>

    <template #security>
      <CompactCard
        :title="$t('profile.cards.security.title')"
        :subtitle="$t('profile.cards.security.subtitle')"
        :data_list="securityData"
      />
    </template>

    <template #overview>
      <InfoCard
        :title="$t('profile.cards.overview.title')"
        :subtitle="$t('profile.cards.overview.subtitle')"
        :data_list="overviewData"
      />
    </template>

    <template #activity>
      <ActivityFeed :activity-items="activityItems" />
    </template>
  </AccountHomeLayout>
</template>

<script setup lang="ts">
import { computed, onUnmounted } from 'vue'

import type { UserDto } from '@/library/models/user'

import { useAuthStore, type AuthStore } from '@/shared/stores/auth'

import { useProfileStore } from '../stores/profile'
import ProfileHeader from '../widgets/ProfileHeader.vue'
import AccountHomeLayout from '../layouts/AccountHomeLayout.vue'
import CompactCard from '../components/CompactCard.vue'
import InfoCard from '../components/InfoCard.vue'
import { useProfileData } from '../hooks/useProfileData.ts'
import { useProfileActivity } from '../hooks/useProfileActivity'
import ActivityFeed from '../widgets/ActivityFeed.vue'

const profileStore = useProfileStore()
const authStore: AuthStore = useAuthStore()

const user = computed<UserDto>(() => authStore.user!)

const { timelineData, sessionData, securityData, overviewData } = useProfileData(user)
const { activityItems } = useProfileActivity()

onUnmounted(() => profileStore.clearActivity())
</script>
