<template>
  <BaseCard>
    <CardMedia :src="imageSrc" :alt="imageAlt" :size="imageSize" />

    <CardBody>
      <FlexBox direction="column" :gap="3">
        <FlexBox direction="column" :gap="2">
          <FlexBox :gap="2" wrap="wrap">
            <BaseBadge
              v-for="tag in tags"
              :key="tag.label"
              :tone="tag.tone ?? 'primary'"
              variant="soft"
            >
              {{ $t(tag.label) }}
            </BaseBadge>
          </FlexBox>

          <slot name="content"></slot>
        </FlexBox>

        <FlexBox :gap="3" align-items="center">
          <AvatarItem
            :src="authorAvatarSrc"
            :fallback="authorAvatarFallback"
            :variant="authorAvatarVariant"
            :alt="$t('accessibility.userAvatar')"
          />

          <FlexBox direction="column" overflow="hidden" grow>
            <BlockText element="h5">{{ authorName }}</BlockText>

            <BlockText size="sm" tone="tertiary" truncate>
              <InlineText element="i">{{ authorEmail }}</InlineText>
            </BlockText>
          </FlexBox>
        </FlexBox>
      </FlexBox>
    </CardBody>
  </BaseCard>
</template>

<script setup lang="ts">
import BlockText from '@/shared/components/text/BlockText.vue'
import BaseCard from '@/shared/components/card/BaseCard.vue'
import CardBody from '@/shared/components/card/CardBody.vue'
import CardMedia from '@/shared/components/card/CardMedia.vue'
import InlineText from '@/shared/components/text/InlineText.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import AvatarItem from '@/shared/components/avatars/AvatarItem.vue'
import BaseBadge from '@/shared/components/badges/BaseBadge.vue'

type BadgeTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'

type CardTag = {
  label: string
  tone?: BadgeTone
}

withDefaults(
  defineProps<{
    imageSrc: string
    imageAlt?: string
    imageSize?: number

    tags: CardTag[]

    authorName: string
    authorEmail: string
    authorAvatarSrc?: string
    authorAvatarFallback?: string
    authorAvatarVariant?: 'solid' | 'soft'
  }>(),
  {
    imageAlt: 'playground.card.imageAlt',
    imageSize: 50,
    authorAvatarVariant: 'soft',
  },
)
</script>
