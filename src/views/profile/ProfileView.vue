<template>
  <CenteredLayout>
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
        <CardSection
          :title="$t('profile.cards.activity.title')"
          :subtitle="$t('profile.cards.activity.subtitle')"
        >
          <FlexBox direction="column" :gap="3" grow>
            <FlexBox direction="column" grow>
              <ActivityTimeline :items="activityItems" />
            </FlexBox>
            <BaseButton variant="surface" tone="primary">
              {{ $t('profile.cards.activity.action') }}
            </BaseButton>
          </FlexBox>
        </CardSection>
      </template>
    </AccountHomeLayout>
  </CenteredLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { UserDto } from '@/library/models/user'
import { useAuthStore, type AuthStore } from '@/shared/stores/auth'

import CenteredLayout from '@/shared/layouts/CenteredLayout.vue'
import ProfileHeader from './widgets/ProfileHeader.vue'

import CardSection from './layouts/CardSection.vue'

import AccountHomeLayout from './layouts/AccountHomeLayout.vue'
import CompactCard from './widgets/CompactCard.vue'
import InfoCard from './widgets/InfoCard.vue'
import { useProfileData } from './hooks/useProfileData.ts'
import FlexBox from '@/library/components/flex/FlexBox.vue'
import BaseButton from '@/library/components/buttons/BaseButton.vue'

import { useProfileActivity } from './hooks/useProfileActivity'

import ActivityTimeline from '@/library/components/timeline/ActivityTimeline.vue'

const authStore: AuthStore = useAuthStore()
const user = computed<UserDto>(() => authStore.user!)

const { timelineData, sessionData, securityData, overviewData } = useProfileData(user)

const { activityItems } = useProfileActivity()
</script>
