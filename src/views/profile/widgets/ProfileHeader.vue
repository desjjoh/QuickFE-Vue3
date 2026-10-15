<template>
  <BaseCard size="lg">
    <ProfileHeaderLayout>
      <template #start>
        <AvatarItem
          size="xxl"
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

          <BlockText size="sm">
            {{ user.identity.email }}
          </BlockText>
        </FlexBox>

        <FlexBox :gap="2" wrap="wrap">
          <BaseBadge variant="soft" :tone="statusTone(user.status.key)">
            {{ statusLabel(user.status) }}
          </BaseBadge>

          <BaseBadge
            v-for="role in sortedRoles(user.roles)"
            :key="role.key"
            :tone="roleTone(role.key)"
            variant="soft"
          >
            {{ roleLabel(role) }}
          </BaseBadge>
        </FlexBox>

        <div>
          <BlockText v-if="user.profile.personal.bio" white-space="pre-line" :clamp="2">
            {{ user.profile.personal.bio }}
          </BlockText>

          <BlockText v-else tone="tertiary">
            <InlineText size="sm">{{ $t('profile.header.emptyBio') }}</InlineText>
          </BlockText>
        </div>
      </FlexBox>

      <template #end>
        <ButtonLink :to="{ name: 'settings-profile' }" variant="surface" tone="primary">
          {{ $t('profile.header.editProfile') }}
        </ButtonLink>

        <IconButtonLink
          :to="{ name: 'settings-security' }"
          :icon="Settings"
          variant="surface"
          tone="neutral"
        />
      </template>
    </ProfileHeaderLayout>
  </BaseCard>
</template>

<script setup lang="ts">
import type { UserDto } from '@/library/models/user'

import BaseCard from '@/library/components/card/BaseCard.vue'
import FlexBox from '@/library/components/flex/FlexBox.vue'
import AvatarItem from '@/library/components/avatars/AvatarItem.vue'
import BlockText from '@/library/components/text/BlockText.vue'
import BaseBadge from '@/library/components/badges/BaseBadge.vue'
import { useUserPresentation } from '@/shared/hooks/useUserPresentation'
import ProfileHeaderLayout from '../layouts/ProfileHeaderLayout.vue'
import InlineText from '@/library/components/text/InlineText.vue'
import { useReferenceTranslations } from '@/shared/hooks/useReferenceTranslations.ts'
import ButtonLink from '@/library/components/links/ButtonLink.vue'
import { Settings } from '@lucide/vue'
import IconButtonLink from '@/library/components/links/IconButtonLink.vue'

const { sortedRoles, roleTone, statusTone } = useUserPresentation()
const { roleLabel, statusLabel } = useReferenceTranslations()

defineProps<{ user: UserDto }>()
</script>

<style lang="scss" scoped>
.header__icon {
  flex: 0 0 auto;
  color: color(theme, neutral, theme, 11);
}
</style>
