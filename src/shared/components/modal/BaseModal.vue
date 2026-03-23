<template>
  <Teleport to="body">
    <Transition name="modal" @after-leave="handleAfterLeave">
      <div v-if="isOpen" class="modal" role="dialog" aria-modal="true">
        <div class="modal__viewport">
          <ModalBackdrop @click="handleBackdropClick" />

          <div
            ref="panelRef"
            class="modal__panel"
            :class="`modal__panel--${options.size}`"
            tabindex="-1"
          >
            <BaseCard>
              <IconButton
                :icon="X"
                variant="ghost"
                tone="neutral"
                class="modal__close"
                @click="closeModal"
              />

              <CardBody>
                <Suspense v-if="options.view">
                  <component :is="options.view" :key="options.key" v-bind="options.props" />
                  <template #fallback>
                    <div class="modal__loading">Loading...</div>
                  </template>
                </Suspense>
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
import ModalBackdrop from './ModalBackdrop.vue'

const modalStore = useModalStore()

const panelRef = ref<HTMLElement | null>(null)

const isOpen = computed(() => modalStore.isOpen)
const options = computed(() => modalStore.options)

let previousBodyOverflow = ''
let previousBodyPaddingRight = ''
let focusTrap: FocusTrap | null = null

function closeModal(): void {
  modalStore.closeModal()
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
  modalStore.purgeModal()

  unlockScroll()
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

function lockScroll(): void {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

  previousBodyOverflow = document.body.style.overflow
  previousBodyPaddingRight = document.body.style.paddingRight

  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`
  }

  document.body.style.overflow = 'hidden'
}

function unlockScroll(): void {
  document.body.style.overflow = previousBodyOverflow
  document.body.style.paddingRight = previousBodyPaddingRight
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

watch(
  isOpen,
  async (open) => {
    if (!open) return

    lockScroll()
    document.addEventListener('keydown', handleKeydown)

    await nextTick()

    activateFocusTrap()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  unlockScroll()
  deactivateFocusTrap()
})
</script>

<style lang="scss" scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 2000;

  & .modal__viewport {
    position: relative;
    z-index: 1;
    min-height: 100%;
    display: grid;
    place-items: center;
    padding: 1.5rem;

    & .modal__backdrop {
      position: absolute;
      inset: 0;
      background-color: palette(black, 9);
    }

    & .modal__panel {
      outline: none;
      position: relative;
      width: 100%;
      max-height: calc(100vh - 3rem);
    }
  }
}

.modal__panel--sm {
  max-width: space(95);
}

.modal__panel--md {
  max-width: space(125);
}

.modal__panel--lg {
  max-width: space(200);
}

.modal__panel--xl {
  max-width: space(285);
}

.modal__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 2;
}

.modal__loading {
  min-height: 10rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
