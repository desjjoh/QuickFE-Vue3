<template>
  <RouterLink :to="href" class="content-card">
    <div class="content-card__media">
      <img :src="image" :alt="imageAlt" class="content-card__image" />

      <div class="content-card__indicator">
        <Library :size="24" stroke-width="2.5" />
      </div>
    </div>

    <BlockText element="h4" tone="primary" :clamp="2">
      <span class="content-card__title">
        {{ title }}
      </span>
    </BlockText>
  </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

import BlockText from '@/library/components/text/BlockText.vue'
import { Library } from 'lucide-vue-next'

defineProps<{
  title: string
  image: string
  imageAlt: string
  href: string
}>()
</script>

<style scoped lang="scss">
.content-card {
  display: flex;
  flex-direction: column;

  gap: space(2);

  min-width: 0;

  color: inherit;
  text-decoration: none;

  &:hover {
    .content-card__title {
      text-decoration: underline;
      text-underline-offset: 0.15em;
    }
  }
}

.content-card__title {
  min-block-size: 2lh;
}

.content-card__media {
  position: relative;

  width: 100%;
  aspect-ratio: 16 / 9;

  border-radius: border-radius(md);
  box-shadow: box-shadow(1);

  overflow: hidden;
}

.content-card__image {
  width: 100%;
  height: 100%;

  object-fit: cover;
}

.content-card__indicator {
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
</style>
