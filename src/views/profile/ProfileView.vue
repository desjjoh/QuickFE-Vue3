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
          :icon="History"
        >
          <FlexBox direction="column" :gap="3" grow>
            <FlexBox
              direction="column"
              grow
              class="wip"
              align-items="center"
              justify-content="center"
            >
              <BlockText text-align="center">{{ $t('profile.cards.activity.empty') }}</BlockText>
            </FlexBox>
            <BaseButton variant="surface" tone="neutral">
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
import { useAuthStore, type AuthStore } from '@/stores/auth'

import CenteredLayout from '@/shared/layouts/CenteredLayout.vue'
import ProfileHeader from './widgets/ProfileHeader.vue'

import CardSection from './layouts/CardSection.vue'

import { History } from 'lucide-vue-next'

import AccountHomeLayout from './layouts/AccountHomeLayout.vue'
import CompactCard from './widgets/CompactCard.vue'
import InfoCard from './widgets/InfoCard.vue'
import { useProfileData } from './hooks/useProfileData.ts'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import BlockText from '@/shared/components/text/BlockText.vue'

const authStore: AuthStore = useAuthStore()
const user = computed<UserDto>(() => authStore.user!)

const { timelineData, sessionData, securityData, overviewData } = useProfileData(user)
</script>

<style lang="scss" scoped>
.wip {
  padding: space(10) space(8);

  color: color(text, secondary);
  background: palette(white, 1);
  border-radius: border-radius(md);
  border: 0.2rem dashed color(theme, neutral, theme-alpha, 7);
}
</style>
