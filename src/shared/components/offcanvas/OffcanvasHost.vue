<template>
  <Teleport to="body">
    <Transition name="offcanvas" @after-leave="handleAfterLeave">
      <div v-if="isOpen" class="offcanvas" role="dialog" aria-modal="true">
        <div class="offcanvas__viewport">
          <div class="offcanvas__backdrop" @click="handleBackdropClick"></div>

          <div
            ref="panelRef"
            class="offcanvas__panel"
            :class="[`offcanvas__panel--${resolvedSide}`, `offcanvas__panel--${resolvedSize}`]"
            tabindex="-1"
            @click.stop
          >
            <Suspense v-if="options.view">
              <component :is="options.view" :key="options.key" v-bind="options.props" />

              <template #fallback>
                <div class="offcanvas__loading">Loading...</div>
              </template>
            </Suspense>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { createFocusTrap, type FocusTrap } from 'focus-trap'

import { useOffcanvas } from '@/stores/offcanvas'

type OffcanvasSide = 'left' | 'right' | 'top' | 'bottom'
type OffcanvasSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

const offcanvasStore = useOffcanvas()

const panelRef = ref<HTMLElement | null>(null)

const isOpen = computed<boolean>(() => offcanvasStore.$isOpen)
const options = computed(() => offcanvasStore.$options)

const resolvedSide = computed<OffcanvasSide>(() => options.value.side ?? 'right')
const resolvedSize = computed<OffcanvasSize>(() => options.value.size ?? 'md')

let focusTrap: FocusTrap | null = null

function closeOffcanvas(): void {
  offcanvasStore.close()
}

function handleBackdropClick(): void {
  if (options.value.persistent) return
  closeOffcanvas()
}

function handleEscape(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return
  if (!isOpen.value) return
  if (options.value.persistent) return

  closeOffcanvas()
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    handleEscape(event)
  }
}

function activateFocusTrap(): void {
  if (!panelRef.value) return

  focusTrap = createFocusTrap(panelRef.value, {
    escapeDeactivates: false,
    clickOutsideDeactivates: false,
    allowOutsideClick: true,
    returnFocusOnDeactivate: true,
    fallbackFocus: panelRef.value,
    initialFocus: panelRef.value.querySelector('[data-autofocus]') ?? panelRef.value,
  })

  focusTrap.activate()
}

function deactivateFocusTrap(): void {
  focusTrap?.deactivate()
  focusTrap = null
}

function handleAfterLeave(): void {
  offcanvasStore.purge()
  deactivateFocusTrap()
  document.removeEventListener('keydown', handleKeydown)
}

watch(
  isOpen,
  async (open) => {
    if (!open) return

    document.addEventListener('keydown', handleKeydown)

    await nextTick()

    activateFocusTrap()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  deactivateFocusTrap()
})
</script>

<style scoped lang="scss">
.offcanvas {
  position: fixed;
  inset: 0;
  z-index: z-index(modal);
}

.offcanvas__viewport {
  position: relative;
  width: 100%;
  height: 100%;
}

.offcanvas__backdrop {
  position: absolute;
  inset: 0;
  background-color: palette(black, 8);
}

.offcanvas__panel {
  position: absolute;
  outline: none;

  overflow: hidden;

  background-color: color(bg, surface);
  box-shadow: box-shadow(8);
  will-change: transform;
  backface-visibility: hidden;

  flex: 1 1 auto;
  padding: space(4);
}

.offcanvas__loading {
  min-height: 10rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.offcanvas__panel--left,
.offcanvas__panel--right {
  top: 0;
  bottom: 0;
}

.offcanvas__panel--top,
.offcanvas__panel--bottom {
  left: 0;
  right: 0;
}

.offcanvas__panel--left {
  left: 0;
}

.offcanvas__panel--right {
  right: 0;
}

.offcanvas__panel--top {
  top: 0;
}

.offcanvas__panel--bottom {
  bottom: 0;
}

.offcanvas__panel--left.offcanvas__panel--sm,
.offcanvas__panel--right.offcanvas__panel--sm {
  width: space(95);
}

.offcanvas__panel--left.offcanvas__panel--md,
.offcanvas__panel--right.offcanvas__panel--md {
  width: space(135);
}

.offcanvas__panel--left.offcanvas__panel--lg,
.offcanvas__panel--right.offcanvas__panel--lg {
  width: space(200);
}

.offcanvas__panel--left.offcanvas__panel--xl,
.offcanvas__panel--right.offcanvas__panel--xl {
  width: space(285);
}

.offcanvas__panel--left.offcanvas__panel--full,
.offcanvas__panel--right.offcanvas__panel--full {
  width: 100%;
}

.offcanvas__panel--top.offcanvas__panel--sm,
.offcanvas__panel--bottom.offcanvas__panel--sm {
  height: space(95);
}

.offcanvas__panel--top.offcanvas__panel--md,
.offcanvas__panel--bottom.offcanvas__panel--md {
  height: space(135);
}

.offcanvas__panel--top.offcanvas__panel--lg,
.offcanvas__panel--bottom.offcanvas__panel--lg {
  height: space(200);
}

.offcanvas__panel--top.offcanvas__panel--xl,
.offcanvas__panel--bottom.offcanvas__panel--xl {
  height: space(285);
}

.offcanvas__panel--top.offcanvas__panel--full,
.offcanvas__panel--bottom.offcanvas__panel--full {
  height: 100%;
}
</style>
