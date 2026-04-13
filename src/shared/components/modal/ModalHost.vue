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
  modalStore.purge()

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
  position: fixed;
  inset: 0;
  z-index: z-index(modal);
  overflow: auto;

  & .modal__viewport {
    position: relative;
    min-height: 100%;
    display: grid;
    place-items: center;
    padding: space(5);

    & .modal__backdrop {
      position: absolute;
      inset: 0;
      background-color: palette(black, 8);
    }

    & .modal__card {
      box-shadow: box-shadow(8);

      & .modal__close {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
      }
    }

    & .modal__panel {
      outline: none;
      position: relative;
      width: 100%;
      will-change: transform;
      backface-visibility: hidden;
    }
  }
}

.modal__loading {
  min-height: 10rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal__panel--sm {
  max-width: space(95);
}

.modal__panel--md {
  max-width: space(135);
}

.modal__panel--lg {
  max-width: space(200);
}

.modal__panel--xl {
  max-width: space(285);
}
</style>
