<template>
  <Teleport to="body">
    <Transition name="modal" :duration="{ enter: 300, leave: 300 }" @after-leave="handleAfterLeave">
      <div v-if="isOpen" class="modal" role="dialog" aria-modal="true">
        <div class="modal__viewport">
          <div class="modal__backdrop" @click="handleBackdropClick"></div>

          <div
            ref="panelRef"
            class="modal__panel"
            :class="`modal__panel--${options.size}`"
            tabindex="-1"
          >
            <BaseCard class="modal__card">
              <IconButton
                v-if="!options.persistent"
                :icon="X"
                variant="ghost"
                tone="neutral"
                class="modal__close"
                @click="closeModal"
              />

              <CardBody>
                <div class="modal__content">
                  <Suspense v-if="options.view">
                    <component :is="options.view" :key="options.key" v-bind="options.props" />
                    <template #fallback>
                      <div class="modal__loading">{{ $t('common.loading') }}</div>
                    </template>
                  </Suspense>
                </div>
              </CardBody>
            </BaseCard>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { createFocusTrap, type FocusTrap } from 'focus-trap'
import { X } from 'lucide-vue-next'

import { useModalStore } from '@/stores/modal'

import BaseCard from '../card/BaseCard.vue'
import CardBody from '../card/CardBody.vue'
import IconButton from '../buttons/IconButton.vue'

const modalStore = useModalStore()

const panelRef = ref<HTMLElement | null>(null)

const isOpen = computed(() => modalStore.isOpen)
const options = computed(() => modalStore.getOptions)

let focusTrap: FocusTrap | null = null

function closeModal(): void {
  modalStore.close()
}

function handleBackdropClick(): void {
  if (options.value.persistent) return

  closeModal()
}

function handleEscape(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return
  if (!isOpen.value) return
  if (options.value.persistent) return

  closeModal()
}

function handleAfterLeave(): void {
  modalStore.completeClose()

  deactivateFocusTrap()
  document.removeEventListener('keydown', handleKeydown)
}

function handleKeydown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'Escape':
      handleEscape(event)
      break
  }
}

function activateFocusTrap(): void {
  if (!panelRef.value) return

  let shouldFocusInitialElement = true

  focusTrap = createFocusTrap(panelRef.value, {
    escapeDeactivates: false,
    clickOutsideDeactivates: false,
    allowOutsideClick: true,
    returnFocusOnDeactivate: true,
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

<style lang="scss" scoped>
.modal {
  --modal-z-index: #{z-index(modal)};
  --modal-padding: #{space(5)};
  --modal-backdrop-bg: #{color(control, backdrop)};
  --modal-panel-max-width: 100%;
  --modal-card-shadow: #{box-shadow(3)};
  --modal-close-offset: #{space(2)};
  --modal-floating-control-space: calc(var(--modal-close-offset) + #{space(6)});

  position: fixed;
  inset: 0;
  z-index: var(--modal-z-index);
  overflow: auto;

  & .modal__viewport {
    position: relative;
    display: grid;
    place-items: center;

    min-height: 100%;
    padding: var(--modal-padding);
  }

  & .modal__backdrop {
    position: absolute;
    inset: 0;
    background-color: var(--modal-backdrop-bg);

    backdrop-filter: blur($backdrop-blur);
  }

  & .modal__panel {
    position: relative;

    width: 100%;
    max-width: var(--modal-panel-max-width);
    min-width: 0;

    outline: none;
    will-change: transform;
    backface-visibility: hidden;
  }

  & .modal__content {
    --form-layout-header-end-offset: var(--modal-floating-control-space);
  }

  & .modal__card,
  & .modal__body,
  & .modal__content {
    width: 100%;
    min-width: 0;
  }

  & .modal__card {
    background-color: color(bg, surface);
    box-shadow: var(--modal-card-shadow);
  }

  & .modal__close {
    position: absolute;
    top: var(--modal-close-offset);
    right: var(--modal-close-offset);
  }

  @each $size, $value in $modal-sizes {
    & .modal__panel--#{$size} {
      --modal-panel-max-width: #{$value};
    }
  }
}

.modal__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: space(25);
}
</style>
