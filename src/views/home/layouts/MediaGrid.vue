<template>
  <div
    class="media-grid"
    :class="{
      'is-tablet': isTablet,
      'is-mobile': isMobile,
    }"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { useViewport } from '@/shared/hooks/useViewport'

const { isMobile, isTablet } = useViewport()
</script>

<style scoped lang="scss">
.media-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));

  gap: space(6);
}

.media-grid.is-tablet {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.media-grid.is-mobile {
  grid-template-columns: minmax(0, 1fr);
}
</style>
