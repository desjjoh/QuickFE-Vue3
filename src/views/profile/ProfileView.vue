<template>
  <CenteredLayout>
    <BaseCard size="lg">
      <CardBody>
        <ProfileHeaderLayout>
          <template #start>
            <AvatarItem
              v-if="isTabletUp"
              size="xxl"
              variant="soft"
              radius="full"
              :src="authenticatedUser.profile.media.avatar?.url"
              :alt="
                authenticatedUser.profile.media.avatar?.alt_text ?? $t('accessibility.userAvatar')
              "
              :fallback="authenticatedUser.getInitials()"
            />
          </template>

          <FlexBox direction="column" align-items="flex-start" :gap="2">
            <FlexBox direction="column" align-items="flex-start">
              <BlockText element="h3">
                {{ authenticatedUser.getFullName() }}
              </BlockText>
              <BlockText>
                {{ authenticatedUser.identity.email }}
              </BlockText>
            </FlexBox>

            <FlexBox :gap="2" wrap="wrap">
              <BaseBadge
                v-for="role in authenticatedUser.roles"
                :key="role.key"
                :tone="getBadgeTone(role.key)"
                variant="soft"
              >
                {{ role.label }}
              </BaseBadge>
            </FlexBox>
          </FlexBox>

          <template #end>
            <ButtonLink :to="{ name: 'settings-profile' }" variant="surface" tone="neutral">
              Edit profile
            </ButtonLink>
          </template>
        </ProfileHeaderLayout>
      </CardBody>
    </BaseCard>
  </CenteredLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useViewport } from '@/shared/hooks/useViewport'
import type { UserDto } from '@/library/models/user'
import { useAuthStore, type AuthStore } from '@/stores/auth'

import BaseCard from '@/shared/components/card/BaseCard.vue'
import CardBody from '@/shared/components/card/CardBody.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import CenteredLayout from '@/shared/layouts/CenteredLayout.vue'
import AvatarItem from '@/shared/components/avatars/AvatarItem.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import BaseBadge from '@/shared/components/badges/BaseBadge.vue'
// import { formatLocalizedDateTime } from '@/helpers/date'
// import { useI18n } from 'vue-i18n'
import type { Tone } from '@/library/types/components/badges'
import ProfileHeaderLayout from './layouts/ProfileHeaderLayout.vue'
import ButtonLink from '@/shared/components/links/ButtonLink.vue'

const {
  isTabletUp,
  // isDesktop
} = useViewport()
// const { locale } = useI18n()

const authStore: AuthStore = useAuthStore()
const authenticatedUser = computed<UserDto>(() => authStore.user!)

// const rowDirection = computed<'row' | 'column'>(() => {
//   return isDesktop.value ? 'row' : 'column'
// })

function getBadgeTone(value: string): Tone {
  if (value === 'user') return 'neutral'

  return 'primary'
}

// function getLastChangedLabel(value: Date | null): string {
//   return formatLocalizedDateTime(value, String(locale.value))
// }
</script>
