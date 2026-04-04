<template>
  <div class="base-toast" :class="`base-toast--${toast.tone}`" role="alert">
    <div class="base-toast__highlight"></div>

    <div class="base-toast__body">
      <div class="base-toast__content">
        <BlockText v-if="toast.title" element="h5">
          {{ toast.title }}
        </BlockText>

        <BlockText>
          {{ toast.message }}
        </BlockText>
      </div>

      <div v-if="toast.closable" class="base-toast__actions">
        <IconButton
          :icon="X"
          variant="ghost"
          tone="neutral"
          class="modal__close"
          @click="emit('close')"
        />
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
.base-toast {
  display: flex;
  align-items: stretch;
  width: 100%;

  overflow: hidden;

  background: color(bg, surface);
  box-shadow: box-shadow(8);
  border-radius: border-radius(md);
}

.base-toast__highlight {
  width: 0.4rem;
  flex-shrink: 0;
}

.base-toast__body {
  display: flex;
  align-items: stretch;
  flex: 1 1 auto;
  gap: space(2);
}

.base-toast__content {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;

  gap: space(1);

  padding: space(4);
  min-width: 0;
}

.base-toast__actions {
  display: flex;
  align-items: center;
  padding: space(3);
}

.base-toast__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: space(8);
  min-height: space(8);

  border: 0;
  background: transparent;
  color: color(text, tertiary);
  cursor: pointer;
}

.base-toast__close:hover {
  color: color(text, primary);
}

.base-toast--primary .base-toast__highlight {
  background: color(theme, primary, dark-alpha, 9);
}

.base-toast--success .base-toast__highlight {
  background: color(theme, success, dark-alpha, 9);
}

.base-toast--warning .base-toast__highlight {
  background: color(theme, warning, dark-alpha, 9);
}

.base-toast--danger .base-toast__highlight {
  background: color(theme, danger, dark-alpha, 9);
}

.base-toast--info .base-toast__highlight {
  background: color(theme, info, dark-alpha, 9);
}
</style>
