<template>
  <CenteredLayout>
    <BaseCard size="lg">
      <ProfileHeaderLayout>
        <template #start>
          <AvatarItem
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

          <BlockText white-space="pre-line" :clamp="2">
            {{ authenticatedUser.profile.personal.bio }}
          </BlockText>
        </FlexBox>

        <template #value>
          <FlexBox direction="column" :gap="2">
            <FlexBox align-items="center" :gap="4">
              <CalendarDays class="header__icon" stroke-width="3" />

              <FlexBox direction="column">
                <BlockText element="h6" truncate>Member since</BlockText>
                <BlockText size="sm" truncate>
                  {{ getLastChangedLabel(authenticatedUser.createdAt) }}
                </BlockText>
              </FlexBox>
            </FlexBox>

            <FlexBox align-items="center" :gap="4">
              <Clock class="header__icon" stroke-width="3" />

              <FlexBox direction="column">
                <BlockText element="h6" truncate>Last sign-in</BlockText>
                <BlockText size="sm" truncate>
                  {{ getLastChangedLabel(authenticatedUser.metadata.lastSignIn) }}
                </BlockText>
              </FlexBox>
            </FlexBox>
          </FlexBox>
        </template>

        <template #end>
          <ButtonLink :to="{ name: 'settings-profile' }" variant="surface" tone="neutral">
            Edit profile
          </ButtonLink>
        </template>
      </ProfileHeaderLayout>
    </BaseCard>
  </CenteredLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { UserDto } from '@/library/models/user'
import { useAuthStore, type AuthStore } from '@/stores/auth'

import BaseCard from '@/shared/components/card/BaseCard.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import CenteredLayout from '@/shared/layouts/CenteredLayout.vue'
import AvatarItem from '@/shared/components/avatars/AvatarItem.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import BaseBadge from '@/shared/components/badges/BaseBadge.vue'
import type { Tone } from '@/library/types/components/badges'
import ProfileHeaderLayout from './layouts/ProfileHeaderLayout.vue'
import ButtonLink from '@/shared/components/links/ButtonLink.vue'
import { CalendarDays, Clock } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { formatLocalizedDateTime } from '@/helpers/date.ts'

const { locale } = useI18n()

const authStore: AuthStore = useAuthStore()
const authenticatedUser = computed<UserDto>(() => authStore.user!)

function getBadgeTone(value: string): Tone {
  if (value === 'user') return 'neutral'

  return 'primary'
}

function getLastChangedLabel(value: Date | null): string {
  return formatLocalizedDateTime(value, String(locale.value))
}
</script>

<style lang="scss" scoped>
.header__icon {
  flex: 0 0 auto;
  color: color(theme, primary, theme, 9);
  height: 1.5em;
  width: 1.5em;
}
</style>
