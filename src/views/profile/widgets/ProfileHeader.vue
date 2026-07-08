<template>
  <BaseCard size="lg">
    <ProfileHeaderLayout>
      <template #start>
        <AvatarItem
          size="xxxl"
          radius="lg"
          variant="soft"
          :src="user.profile.media.avatar?.url"
          :alt="user.profile.media.avatar?.alt_text ?? $t('accessibility.userAvatar')"
          :fallback="user.getInitials()"
        />
      </template>

      <FlexBox direction="column" align-items="flex-start" :gap="2">
        <FlexBox direction="column">
          <BlockText element="h3">
            {{ user.getFullName() }}
          </BlockText>

          <BlockText>
            {{ user.identity.email }}
          </BlockText>
        </FlexBox>

        <FlexBox :gap="2" wrap="wrap">
          <BaseBadge variant="soft" tone="success">
            {{ statusLabel(user.status) }}
          </BaseBadge>

          <BaseBadge
            v-for="role in user.roles"
            :key="role.key"
            :tone="getBadgeTone(role.key)"
            variant="soft"
          >
            {{ roleLabel(role) }}
          </BaseBadge>
        </FlexBox>

        <div class="profile-header__bio">
          <BlockText
            v-if="user.profile.personal.bio"
            class="profile-header__bio"
            white-space="pre-line"
            :clamp="2"
          >
            {{ user.profile.personal.bio }}
          </BlockText>

          <BlockText v-else tone="muted">
            <InlineText size="sm">Add a short bio to personalize your profile.</InlineText>
          </BlockText>
        </div>
      </FlexBox>

      <template #value>
        <FlexBox direction="column" :gap="2">
          <FlexBox align-items="center" :gap="4">
            <CalendarDays :size="size" class="header__icon" :stroke-width="stroke" />

            <FlexBox direction="column" :gap="1">
              <BlockText element="h6" truncate>Member since</BlockText>
              <BlockText size="sm" truncate>
                {{ getLastChangedLabel(user.createdAt) }}
              </BlockText>
            </FlexBox>
          </FlexBox>

          <FlexBox align-items="center" :gap="4">
            <Clock :size="size" class="header__icon" :stroke-width="stroke" />

            <FlexBox direction="column" :gap="1">
              <BlockText element="h6" truncate>Last sign-in</BlockText>
              <BlockText size="sm" truncate>
                {{ getLastChangedLabel(user.metadata.lastSignIn) }}
              </BlockText>
            </FlexBox>
          </FlexBox>

          <FlexBox align-items="center" :gap="4">
            <Pencil :size="size" class="header__icon" :stroke-width="stroke" />

            <FlexBox direction="column" :gap="1">
              <BlockText element="h6" truncate> Last updated </BlockText>
              <BlockText size="sm" truncate>
                {{ getLastChangedLabel(user.metadata.lastUpdatedAt) }}
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
</template>

<script setup lang="ts">
import type { UserDto } from '@/library/models/user'

import BaseCard from '@/shared/components/card/BaseCard.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import AvatarItem from '@/shared/components/avatars/AvatarItem.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import BaseBadge from '@/shared/components/badges/BaseBadge.vue'
import type { Tone } from '@/library/types/components/badges'
import ProfileHeaderLayout from '../layouts/ProfileHeaderLayout.vue'
import ButtonLink from '@/shared/components/links/ButtonLink.vue'
import { CalendarDays, Clock, Pencil } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { formatLocalizedDateTime } from '@/helpers/date.ts'
import InlineText from '@/shared/components/text/InlineText.vue'
import { useReferenceTranslations } from '@/shared/hooks/useReferenceTranslations.ts'

const { locale } = useI18n()
const { roleLabel, statusLabel } = useReferenceTranslations()

defineProps<{ user: UserDto }>()

const size = 20
const stroke = 2.25

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
  color: color(theme, neutral, theme, 11);
}

.profile-header__bio {
  max-width: space(140);
}
</style>
