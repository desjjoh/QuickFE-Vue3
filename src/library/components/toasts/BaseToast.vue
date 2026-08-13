<template>
  <div class="base-toast" :class="`base-toast--${toast.tone}`" role="alert">
    <div class="base-toast__highlight"></div>

    <div class="base-toast__body">
      <div class="base-toast__content">
        <BlockText>
          {{ toast.message }}
        </BlockText>
      </div>

      <div v-if="toast.closable" class="base-toast__actions">
        <IconButton :icon="X" variant="ghost" tone="neutral" @click="emit('close')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'

import type { ToastItem } from '@/stores/toasts'
import BlockText from '../text/BlockText.vue'
import IconButton from '../buttons/IconButton.vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  toast: ToastItem
}>()

const emit = defineEmits<{
  close: []
}>()

let timeoutId: ReturnType<typeof window.setTimeout> | null = null

onMounted(() => {
  if (props.toast.duration <= 0) return

  timeoutId = window.setTimeout(() => {
    emit('close')
  }, props.toast.duration)
})

onBeforeUnmount(() => {
  if (timeoutId !== null) {
    window.clearTimeout(timeoutId)
  }
})
</script>

<style scoped lang="scss">
$toast-tones: (
  primary: primary,
  success: success,
  warning: warning,
  danger: danger,
  info: info,
);

.base-toast {
  --toast-bg: #{color(bg, surface)};
  --toast-shadow: #{box-shadow(3)};
  --toast-radius: #{border-radius(md)};
  --toast-highlight-width: #{space(1)};
  --toast-highlight-bg: #{color(theme, primary, theme-alpha, 9)};

  display: flex;
  align-items: stretch;
  width: 100%;

  overflow: hidden;

  color: color(text, primary);

  background-color: var(--toast-bg);
  box-shadow: var(--toast-shadow);
  border-radius: var(--toast-radius);

  & .base-toast__highlight {
    width: var(--toast-highlight-width);
    flex-shrink: 0;
    background-color: var(--toast-highlight-bg);
  }

  & .base-toast__body {
    display: flex;
    align-items: stretch;
    flex: 1 1 auto;
    gap: space(2);
  }

  & .base-toast__content {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;

    justify-content: center;

    min-width: 0;
    gap: space(1);
    padding: space(4);
  }

  & .base-toast__actions {
    display: flex;
    align-items: center;
    padding: space(3);
  }

  @each $tone, $palette in $toast-tones {
    &.base-toast--#{$tone} {
      --toast-highlight-bg: #{color(theme, #{$palette}, theme-alpha, 9)};
    }
  }
}
</style>
