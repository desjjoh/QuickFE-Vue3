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
$offcanvas-directions-inline: left, right;
$offcanvas-directions-block: top, bottom;

.offcanvas {
  --offcanvas-z-index: #{z-index(modal)};
  --offcanvas-backdrop-bg: #{palette(black, 8)};
  --offcanvas-panel-bg: #{color(bg, surface)};
  --offcanvas-panel-shadow: #{box-shadow(8)};
  --offcanvas-panel-padding: #{space(4)};

  position: fixed;
  inset: 0;
  z-index: var(--offcanvas-z-index);

  & .offcanvas__viewport {
    position: relative;
    width: 100%;
    height: 100%;
  }

  & .offcanvas__backdrop {
    position: absolute;
    inset: 0;
    background-color: var(--offcanvas-backdrop-bg);
  }

  & .offcanvas__panel {
    position: absolute;
    outline: none;
    overflow: hidden;
    flex: 1 1 auto;
    padding: var(--offcanvas-panel-padding);

    background-color: var(--offcanvas-panel-bg);
    box-shadow: var(--offcanvas-panel-shadow);

    will-change: transform;
    backface-visibility: hidden;
  }

  @each $direction in $offcanvas-directions-inline {
    & .offcanvas__panel--#{$direction} {
      top: 0;
      bottom: 0;
      #{$direction}: 0;
    }
  }

  @each $direction in $offcanvas-directions-block {
    & .offcanvas__panel--#{$direction} {
      left: 0;
      right: 0;
      #{$direction}: 0;
    }
  }

  @each $size, $value in $offcanvas-sizes {
    @each $direction in $offcanvas-directions-inline {
      & .offcanvas__panel--#{$direction}.offcanvas__panel--#{$size} {
        width: #{$value};
      }
    }

    @each $direction in $offcanvas-directions-block {
      & .offcanvas__panel--#{$direction}.offcanvas__panel--#{$size} {
        height: #{$value};
      }
    }
  }
}

.offcanvas__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: space(25);
}
</style>
