<template>
  <div class="stacked__layout">
    <div class="stacked__content">
      <slot></slot>
    </div>

    <footer v-if="$slots.footer" class="stacked__footer">
      <slot name="footer"></slot>
    </footer>

    <ScrollToTopButton v-if="props.scrollToTop" :scroll-ref="contentRef" />
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'

import { APP_SHELL_SCROLL_REF_KEY } from '@/helpers/window'
import { assertDefined } from '@/helpers/assert'

import ScrollToTopButton from '../views/app/widgets/buttons/ScrollToTopButton.vue'

const contentRef = inject(APP_SHELL_SCROLL_REF_KEY)
assertDefined(contentRef, '[StackedLayout] must be used inside <AppFrame>.')

const props = defineProps<{ scrollToTop?: boolean }>()
</script>

<style scoped lang="scss">
.stacked__layout {
  display: flex;
  flex-direction: column;

  flex-grow: 1;
  min-height: 100%;

  width: fit-content;
  min-width: 100%;
}

.stacked__content {
  padding: space(10);
  flex: 1 1 auto;
}

.stacked__footer {
  padding: space(10);

  background-color: color(bg, page);
  flex-shrink: 0;
}
</style>
