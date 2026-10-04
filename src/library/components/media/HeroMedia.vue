<template>
  <RouterLink :to="href" class="hero-media">
    <img :src="image" :alt="imageAlt" class="hero-media__image" />

    <FlexBox direction="column" :gap="1" class="hero-media__content">
      <BlockText element="h3" tone="inherit" truncate>
        <span class="hero-media__title">
          {{ title }}
        </span>
      </BlockText>

      <BlockText v-if="description && !isMobile" element="h6" tone="inherit" truncate>
        {{ description }}
      </BlockText>
    </FlexBox>
  </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

import FlexBox from '@/library/components/flex/FlexBox.vue'
import BlockText from '@/library/components/text/BlockText.vue'
import { useViewport } from '@/shared/hooks/useViewport'

defineProps<{
  title: string
  description?: string
  image: string
  imageAlt: string
  href: string
}>()

const { isMobile } = useViewport()
</script>
<style scoped lang="scss">
.hero-media {
  position: relative;
  isolation: isolate;

  display: block;

  width: 100%;
  aspect-ratio: 16 / 9;

  overflow: hidden;
  border-radius: border-radius(md);
  box-shadow: box-shadow(1);

  color: white;
  text-decoration: none;

  &:hover {
    .hero-media__title {
      text-decoration: underline;
      text-underline-offset: 0.15em;
    }
  }
}

.hero-media__image {
  position: absolute;
  inset: 0;
  z-index: 0;

  width: 100%;
  height: 100%;

  object-fit: cover;
}

.hero-media__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;

  background: linear-gradient(to bottom, transparent 45%, rgb(0 0 0 / 75%) 100%);
}

.hero-media__content {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;

  padding: calc(space(6) + space(12)) space(6) space(6);

  color: palette(white, 12);

  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgb(0 0 0 / 70%) 45%,
    rgb(0 0 0 / 90%) 100%
  );
}
</style>
