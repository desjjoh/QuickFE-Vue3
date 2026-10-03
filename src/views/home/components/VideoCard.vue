<template>
  <RouterLink :to="href" class="video-card">
    <div class="video-card__media">
      <img :src="image" :alt="imageAlt" class="video-card__image" />

      <div class="video-card__indicator">
        <Clapperboard :size="24" stroke-width="2.5" />
      </div>

      <BaseBadge class="video-card__duration" variant="soft">
        {{ formattedDuration }}
      </BaseBadge>
    </div>

    <FlexBox direction="column" justify-content="space-between" :gap="1" grow>
      <BlockText element="h4" tone="primary" :clamp="2" class="video-card__title">
        {{ title }}
      </BlockText>

      <BlockText element="h6" tone="tertiary">{{ formattedDate }}</BlockText>
    </FlexBox>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Clapperboard } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

import { formatIsoDate } from '@/shared/helpers/date.ts'

import BlockText from '@/library/components/text/BlockText.vue'
import BaseBadge from '@/library/components/badges/BaseBadge.vue'
import FlexBox from '@/library/components/flex/FlexBox.vue'

const { locale } = useI18n()

const props = defineProps<{
  title: string
  image: string
  imageAlt: string
  href: string
  durationSeconds: number
  published: string
}>()

const formattedDate = computed<string>(() => {
  return formatIsoDate(props.published, String(locale.value))
})

const formattedDuration = computed<string>(() => {
  const hours = Math.floor(props.durationSeconds / 3600)
  const minutes = Math.floor((props.durationSeconds % 3600) / 60)
  const seconds = props.durationSeconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})
</script>

<style scoped lang="scss">
.video-card {
  display: flex;
  flex-direction: column;

  gap: space(2);

  min-width: 0;

  color: inherit;
  text-decoration: none;

  &:hover {
    .video-card__title {
      text-decoration: underline;
      text-underline-offset: 0.15em;
    }
  }
}

.video-card__title {
  min-block-size: 2lh;
}

.video-card__media {
  position: relative;

  width: 100%;
  aspect-ratio: 16 / 9;

  border-radius: border-radius(md);
  box-shadow: box-shadow(1);

  overflow: hidden;
}

.video-card__image {
  width: 100%;
  height: 100%;

  object-fit: cover;
}

.video-card__indicator {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;

  display: flex;
  align-items: flex-end;

  padding: space(3);
  padding-left: calc(space(3) + space(12));

  color: palette(white, 12);

  background: linear-gradient(
    to right,
    transparent 0%,
    rgb(0 0 0 / 60%) 40%,
    rgb(0 0 0 / 80%) 100%
  );
}

.video-card__duration {
  position: absolute;
  top: space(3);
  right: space(3);
}
</style>
