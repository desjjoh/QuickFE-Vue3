<template>
  <Teleport to="body">
    <Transition name="modal" @after-leave="handleAfterLeave">
      <div v-if="isOpen" class="app-modal" role="dialog" aria-modal="true">
        <div class="app-modal__viewport">
          <div class="app-modal__backdrop" @click="handleBackdropClick"></div>

          <div
            ref="panelRef"
            class="app-modal__panel"
            :class="`app-modal__panel--${options.size}`"
            tabindex="-1"
          >
            <button
              type="button"
              class="app-modal__close"
              aria-label="Close modal"
              @click="closeModal"
            >
              ×
            </button>

            <Suspense v-if="options.view">
              <component :is="options.view" :key="options.key" v-bind="options.props" />

              <template #fallback>
                <div class="app-modal__loading">Loading...</div>
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
import { useModalStore } from '@/stores/modal'

const modalStore = useModalStore()

const panelRef = ref<HTMLElement | null>(null)

const isOpen = computed(() => modalStore.isOpen)
const options = computed(() => modalStore.options)

let previousBodyOverflow = ''
let previousBodyPaddingRight = ''

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
  unlockScroll()
  modalStore.purgeModal()
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

watch(
  isOpen,
  async (open) => {
    if (open) {
      lockScroll()
      document.addEventListener('keydown', handleEscape)

      await nextTick()
      panelRef.value?.focus()

      return
    }

    document.removeEventListener('keydown', handleEscape)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape)
  unlockScroll()
})
</script>

<style lang="scss" scoped>
.app-modal {
  position: fixed;
  inset: 0;
  z-index: 2000;

  & .app-modal__viewport {
    position: relative;
    z-index: 1;
    min-height: 100%;
    display: grid;
    place-items: center;
    padding: 1.5rem;

    & .app-modal__backdrop {
      position: absolute;
      inset: 0;
      background-color: palette(black, 9);
    }

    & .app-modal__panel {
      position: relative;
      width: 100%;
      max-height: calc(100vh - 3rem);
      overflow: auto;
      outline: none;

      background-color: color(bg, page);
      border-radius: border-radius(md);
      box-shadow: box-shadow(4);

      padding: space(4);
    }
  }
}

.app-modal__panel--sm {
  max-width: space(75);
}

.app-modal__panel--md {
  max-width: space(125);
}

.app-modal__panel--lg {
  max-width: space(200);
}

.app-modal__panel--xl {
  max-width: space(285);
}

.app-modal__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 2;
  border: 0;
  background: transparent;
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
}

.app-modal__loading {
  min-height: 10rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
