<template>
  <Teleport to="body">
    <Transition name="offcanvas" @before-leave="handleBeforeLeave" @after-leave="handleAfterLeave">
      <div
        v-if="isOpen"
        class="offcanvas"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <div class="offcanvas__viewport">
          <div class="offcanvas__backdrop" @click="handleBackdropClick"></div>

          <div
            ref="panelRef"
            class="offcanvas__panel"
            :class="[`offcanvas__panel--${resolvedSide}`, `offcanvas__panel--${resolvedSize}`]"
            tabindex="-1"
            @click.stop
          >
            <IconButton
              v-if="!options.persistent"
              :icon="X"
              variant="ghost"
              tone="neutral"
              class="offcanvas__close"
              :label="$t('accessibility.close')"
              @click="closeOffcanvas"
            />

            <div class="offcanvas__panel-body">
              <Suspense v-if="options.view" :timeout="0">
                <component
                  :is="options.view"
                  :key="offcanvasStore.$instanceKey"
                  v-bind="options.props"
                />

                <template #fallback>
                  <div :id="titleId" class="offcanvas__loading" role="status">
                    {{ $t('common.loading') }}
                  </div>
                </template>
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch, provide, useId } from 'vue'
import { DialogTitleId } from '../dialog'
import { createFocusTrap, type FocusTrap } from 'focus-trap'
import { X } from '@lucide/vue'

import { useOffcanvas } from '@/shared/stores/offcanvas'

import IconButton from '../buttons/IconButton.vue'

type OffcanvasSide = 'left' | 'right' | 'top' | 'bottom'
type OffcanvasSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

const offcanvasStore = useOffcanvas()
const titleId = useId()

provide(DialogTitleId, titleId)

const panelRef = ref<HTMLElement | null>(null)

const isOpen = computed<boolean>(() => offcanvasStore.$isOpen)
const options = computed(() => offcanvasStore.$options)

const resolvedSide = computed<OffcanvasSide>(() => options.value.side ?? 'right')
const resolvedSize = computed<OffcanvasSize>(() => options.value.size ?? 'md')

let focusTrap: FocusTrap | null = null
let returnFocus: HTMLElement | null = null

function restoreFocus(): void {
  if (returnFocus?.isConnected) returnFocus.focus()
  returnFocus = null
}

function closeOffcanvas(): void {
  offcanvasStore.close()
}

function handleBackdropClick(): void {
  if (options.value.persistent) return
  closeOffcanvas()
}

function handleEscape(event: KeyboardEvent): void {
  if (event.defaultPrevented) return
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

  let shouldFocusInitialElement = true

  focusTrap = createFocusTrap(panelRef.value, {
    escapeDeactivates: false,
    clickOutsideDeactivates: false,
    allowOutsideClick: true,
    returnFocusOnDeactivate: false,
    delayInitialFocus: false,
    fallbackFocus: panelRef.value,
    initialFocus: () => {
      if (!shouldFocusInitialElement) return false

      shouldFocusInitialElement = false

      return (
        (panelRef.value?.querySelector('[data-autofocus]') as HTMLElement | null) ?? panelRef.value
      )
    },
  })

  focusTrap.activate()
}

function deactivateFocusTrap(): void {
  focusTrap?.deactivate()
  focusTrap = null
}

let closingInstance: string | null = null

function handleBeforeLeave(): void {
  closingInstance = offcanvasStore.$instanceKey
}

function handleAfterLeave(): void {
  if (offcanvasStore.$instanceKey !== closingInstance || isOpen.value) return
  deactivateFocusTrap()
  restoreFocus()
  document.removeEventListener('keydown', handleKeydown)
  offcanvasStore.completeClose()
}

watch(
  isOpen,
  async (open) => {
    if (!open) return
    returnFocus = document.activeElement as HTMLElement | null

    document.addEventListener('keydown', handleKeydown)

    await nextTick()

    activateFocusTrap()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  deactivateFocusTrap()
  restoreFocus()
})
</script>

<style scoped lang="scss">
$offcanvas-directions-inline: left, right;
$offcanvas-directions-block: top, bottom;

.offcanvas {
  --offcanvas-z-index: #{z-index(offcanvas)};
  --offcanvas-backdrop-bg: #{color(control, backdrop)};
  --offcanvas-panel-bg: #{color(bg, surface)};
  --offcanvas-panel-shadow: #{box-shadow(3)};
  --offcanvas-panel-padding: #{space(4)};
  --offcanvas-close-offset: #{space(2)};
  --offcanvas-floating-control-space: calc(var(--offcanvas-close-offset) + #{space(6)});

  position: fixed;
  inset: 0;
  z-index: var(--offcanvas-z-index);

  & .offcanvas__close {
    position: absolute;
    top: var(--offcanvas-close-offset);
    right: var(--offcanvas-close-offset);
    z-index: 1;
  }

  & .offcanvas__viewport {
    position: relative;
    width: 100%;
    height: 100%;
  }

  & .offcanvas__backdrop {
    position: absolute;
    inset: 0;
    background-color: var(--offcanvas-backdrop-bg);

    backdrop-filter: blur($backdrop-blur);
  }

  & .offcanvas__panel {
    position: absolute;
    outline: none;
    overflow: auto;

    flex: 1 1 auto;

    max-width: 100%;
    max-height: 100%;
    box-sizing: border-box;

    scrollbar-width: thin;
    scrollbar-color: #{color(theme, neutral, theme-alpha, 8)} transparent;

    background-color: var(--offcanvas-panel-bg);
    box-shadow: var(--offcanvas-panel-shadow);

    will-change: transform;
    backface-visibility: hidden;

    & .offcanvas__panel-body {
      position: relative;
      min-height: 100%;

      display: grid;
      grid-template-columns: 1fr;

      --form-layout-header-end-offset: var(--offcanvas-floating-control-space);

      padding: space(5);
    }
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
