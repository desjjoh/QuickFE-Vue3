<template>
  <div
    class="content-layout"
    :class="{
      'is-tablet': isTablet,
      'is-mobile': isMobile,
    }"
  >
    <section class="content-layout__primary">
      <div class="content-layout__featured">
        <slot name="featured"></slot>
      </div>

      <div class="content-layout__secondary">
        <slot name="secondary"></slot>
      </div>
    </section>

    <aside class="content-layout__stories">
      <slot name="stories"></slot>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { useViewport } from '@/shared/hooks/useViewport'

const { isMobile, isTablet } = useViewport()
</script>

<style lang="scss" scoped>
.content-layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  align-items: start;
  gap: space(6);

  width: 100%;
}

.content-layout__primary {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: space(4);

  min-width: 0;
}

.content-layout__featured {
  min-width: 0;
}

.content-layout__secondary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: space(4);
}

.content-layout__stories {
  min-width: 0;
}

.content-layout.is-tablet {
  grid-template-columns: minmax(0, 1fr);
}

.content-layout.is-mobile {
  grid-template-columns: minmax(0, 1fr);

  .content-layout__secondary {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
