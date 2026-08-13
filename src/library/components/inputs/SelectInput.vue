<template>
  <div class="select-field">
    <div
      ref="triggerWrap"
      class="select-field__trigger"
      tabindex="-1"
      @keydown="onTriggerKeydown"
      @pointerdown="onTriggerPointerDown"
    >
      <input
        :id="id"
        ref="inputRef"
        :name="name"
        class="select-field__input"
        :class="[showError && 'has-error', props.disabled && 'is-disabled', isOpen && 'is-open']"
        :aria-invalid="showError ? 'true' : 'false'"
        :aria-expanded="isOpen ? 'true' : 'false'"
        :aria-controls="menuId"
        aria-haspopup="listbox"
        :autocomplete="autocomplete ?? 'off'"
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="props.disabled"
        readonly
        @blur="handleBlur"
      />

      <span class="select-field__icon" aria-hidden="true">
        <ChevronDown :size="14" :stroke-width="3" />
      </span>
    </div>

    <Teleport to="body">
      <Transition name="dropdown">
        <div
          v-if="isOpen"
          :id="menuId"
          ref="menuEl"
          class="select-field__menu"
          :style="floatingStyles"
          role="listbox"
          tabindex="-1"
          :aria-activedescendant="activeOptionId"
          @keydown="onMenuKeydown"
        >
          <button
            v-for="(option, index) in props.options"
            v-memo="[index === activeIndex, index === selectedIndex, option, locale]"
            :id="getOptionId(index)"
            :key="getOptionKey(option, index)"
            :ref="(el) => setOptionRef(el as HTMLButtonElement | null, index)"
            type="button"
            role="option"
            class="select-field__option"
            :class="[
              index === activeIndex && 'is-highlighted',
              index === selectedIndex && 'is-selected',
            ]"
            :aria-selected="index === selectedIndex ? 'true' : 'false'"
            tabindex="-1"
            @pointermove="onOptionPointerMove(index)"
            @pointerdown.prevent="selectOption(option, { restoreFocus: false })"
          >
            <span class="option__wrapper">
              <slot name="option" :option="option">
                {{ getOptionLabel(option) }}
              </slot>
            </span>
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts" generic="T">
import { nextTick, computed, ref, toRef, useId, watch, onBeforeUnmount } from 'vue'
import { createFocusTrap, type FocusTrap } from 'focus-trap'

import { useField } from 'vee-validate'
import { autoUpdate, flip, offset, size, useFloating, type Placement } from '@floating-ui/vue'
import { ChevronDown } from 'lucide-vue-next'

import { deepEqual } from '@/helpers/object'
import { useI18n } from 'vue-i18n'

type Props<T> = {
  id: string
  name: string
  value?: T
  options: T[]
  placeholder?: string
  disabled?: boolean
  getLabel?: (option: T) => string
  getKey?: (option: T, index: number) => string | number
  autocomplete?: string
}

const { t, locale } = useI18n()

const props = withDefaults(defineProps<Props<T>>(), {
  disabled: false,
})

const placeholder = computed(() => {
  return props.placeholder ?? t('common.select-option')
})

const emit = defineEmits<{
  update: [value: T | undefined]
}>()

const name = toRef(props, 'name')

const { value, errorMessage, handleBlur } = useField<T | undefined>(name.value, undefined, {
  initialValue: props.value,
})

const showError = computed(() => !!errorMessage.value)

const isSyncing = ref(false)
const isOpen = ref(false)
const activeIndex = ref(-1)
const selectedIndex = computed(() => getSelectedIndex())
const activeOptionId = computed(() =>
  activeIndex.value >= 0 ? getOptionId(activeIndex.value) : undefined,
)

const optionRefs = ref<Array<HTMLButtonElement | null>>([])
const inputRef = ref<HTMLInputElement | null>(null)
const triggerWrap = ref<HTMLElement | null>(null)
const menuEl = ref<HTMLElement | null>(null)
const menuId = useId()

const placement = computed<Placement>(() => 'bottom-start')

const { floatingStyles } = useFloating(triggerWrap, menuEl, {
  placement,
  strategy: 'fixed',
  transform: false,
  open: isOpen,
  whileElementsMounted: autoUpdate,
  middleware: [
    offset(8),
    flip({ padding: 8 }),
    size({
      padding: 8,
      apply({ rects, elements }) {
        const width = `${Math.round(rects.reference.width)}px`

        Object.assign(elements.floating.style, {
          width,
          maxWidth: width,
        })
      },
    }),
  ],
})

let focusTrap: FocusTrap | null = null

const displayValue = computed(() => {
  if (value.value == null) return ''
  return getOptionLabel(value.value)
})

function setOptionRef(el: HTMLButtonElement | null, index: number): void {
  optionRefs.value[index] = el
}

function focusMenu(): void {
  menuEl.value?.focus()
}

function focusOption(index: number): void {
  const optionsLength = props.options.length

  if (!optionsLength) return

  const wrappedIndex = index < 0 ? optionsLength - 1 : index >= optionsLength ? 0 : index

  activeIndex.value = wrappedIndex
  scrollOptionIntoView(wrappedIndex)
}

let pointerMoveFrame: number | null = null
let pendingPointerIndex: number | null = null

function onOptionPointerMove(index: number): void {
  if (props.disabled || index === activeIndex.value) return

  pendingPointerIndex = index

  if (pointerMoveFrame !== null) return

  pointerMoveFrame = window.requestAnimationFrame(() => {
    pointerMoveFrame = null

    if (pendingPointerIndex == null || pendingPointerIndex === activeIndex.value) return

    activeIndex.value = pendingPointerIndex
    pendingPointerIndex = null
  })
}

function scrollOptionIntoView(index: number): void {
  optionRefs.value[index]?.scrollIntoView({ block: 'nearest' })
}

function activateFocusTrap(): void {
  if (!menuEl.value) return

  focusTrap = createFocusTrap(menuEl.value, {
    escapeDeactivates: false,
    clickOutsideDeactivates: false,
    allowOutsideClick: true,
    returnFocusOnDeactivate: false,
    fallbackFocus: menuEl.value,
    initialFocus: menuEl.value,
  })

  focusTrap.activate()
}

function deactivateFocusTrap(): void {
  focusTrap?.deactivate()
  focusTrap = null
}

function getOptionLabel(option: T): string {
  if (props.getLabel) return props.getLabel(option)

  if (typeof option === 'string' || typeof option === 'number') {
    return String(option)
  }

  return String(option)
}

function getOptionKey(option: T, index: number): string | number {
  return props.getKey ? props.getKey(option, index) : index
}

function getOptionId(index: number): string {
  return `${menuId}-${index}`
}

function getSelectedIndex(): number {
  return props.options.findIndex((option) => deepEqual(option, value.value))
}

async function openMenu(): Promise<void> {
  if (props.disabled || isOpen.value) return

  activeIndex.value = Math.max(selectedIndex.value, 0)
  isOpen.value = true

  await nextTick()

  activateFocusTrap()

  if (props.options.length) {
    focusOption(activeIndex.value)
    return
  }

  focusMenu()
}

function closeMenu(options?: { restoreFocus?: boolean }): void {
  if (!isOpen.value) return

  isOpen.value = false
  deactivateFocusTrap()

  if (options?.restoreFocus) {
    inputRef.value?.focus()
  }
}

function toggleMenu(): void {
  if (isOpen.value) {
    closeMenu()
    return
  }

  void openMenu()
}

function onTriggerPointerDown(event: PointerEvent): void {
  if (props.disabled) return

  const target = event.target as HTMLElement | null
  if (!target) return

  event.preventDefault()
  triggerWrap.value?.focus({ preventScroll: true })
  toggleMenu()
}

async function onTriggerKeydown(event: KeyboardEvent): Promise<void> {
  if (props.disabled) return

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      toggleMenu()
      break

    case 'ArrowDown':
      event.preventDefault()

      if (!isOpen.value) {
        await openMenu()
      } else {
        focusOption(activeIndex.value + 1)
      }
      break

    case 'ArrowUp':
      event.preventDefault()

      if (!isOpen.value) {
        await openMenu()
      } else {
        focusOption(activeIndex.value - 1)
      }
      break

    case 'Escape':
      event.preventDefault()
      closeMenu()
      break
  }
}

function onMenuKeydown(event: KeyboardEvent): void {
  if (event.repeat) {
    event.preventDefault()

    return
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      focusOption(activeIndex.value + 1)
      break

    case 'ArrowUp':
      event.preventDefault()
      focusOption(activeIndex.value - 1)
      break

    case 'Home':
      event.preventDefault()
      focusOption(0)
      break

    case 'End':
      event.preventDefault()
      focusOption(props.options.length - 1)
      break

    case 'Enter':
    case ' ':
      event.preventDefault()

      if (activeIndex.value >= 0 && activeIndex.value < props.options.length) {
        selectOption(props.options[activeIndex.value] as T)
      }
      break

    case 'Escape':
      event.preventDefault()
      closeMenu({ restoreFocus: true })
      break
  }
}

function selectOption(option: T, options: { restoreFocus?: boolean } = {}): void {
  value.value = option
  closeMenu({ restoreFocus: options.restoreFocus ?? true })
}

function onDocumentPointerDown(event: PointerEvent): void {
  if (!isOpen.value) return

  const target = event.target as Node

  if (triggerWrap.value?.contains(target) || menuEl.value?.contains(target)) {
    return
  }

  closeMenu()
}

function onDocumentFocusIn(event: FocusEvent): void {
  if (!isOpen.value) return

  const target = event.target as Node

  if (triggerWrap.value?.contains(target) || menuEl.value?.contains(target)) return

  closeMenu()
}

function onDocumentScrollInteraction(event: WheelEvent | TouchEvent): void {
  if (!isOpen.value) return

  const target = event.target as Node | null

  if (target && menuEl.value?.contains(target)) return

  closeMenu({ restoreFocus: false })
}

watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('pointerdown', onDocumentPointerDown, true)
    document.addEventListener('focusin', onDocumentFocusIn)

    document.addEventListener('wheel', onDocumentScrollInteraction, {
      capture: true,
      passive: false,
    })

    document.addEventListener('touchmove', onDocumentScrollInteraction, {
      capture: true,
      passive: false,
    })

    return
  }

  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  document.removeEventListener('focusin', onDocumentFocusIn)

  document.removeEventListener('wheel', onDocumentScrollInteraction, true)
  document.removeEventListener('touchmove', onDocumentScrollInteraction, true)

  deactivateFocusTrap()
})

watch(
  () => props.value,
  (val) => {
    if (!deepEqual(val, value.value)) {
      isSyncing.value = true
      value.value = val
    }
  },
)

watch(value, (newVal) => {
  if (isSyncing.value) {
    isSyncing.value = false
    return
  }

  emit('update', newVal)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  document.removeEventListener('focusin', onDocumentFocusIn)

  document.removeEventListener('wheel', onDocumentScrollInteraction, true)
  document.removeEventListener('touchmove', onDocumentScrollInteraction, true)

  deactivateFocusTrap()

  if (pointerMoveFrame !== null) window.cancelAnimationFrame(pointerMoveFrame)
})
</script>

<style scoped lang="scss">
.select-field {
  width: 100%;
}

.select-field__trigger {
  position: relative;
  width: 100%;
}

.select-field__input {
  --input-text: #{color(text, primary)};
  --input-bg: #{color(control, input-bg)};

  --input-border: #{color(theme, neutral, theme-alpha, 7)};
  --input-border-hover: #{color(theme, neutral, theme-alpha, 8)};
  --input-border-focus: #{color(theme, primary, theme-alpha, 8)};
  --input-ring: #{color(theme, primary, theme-alpha, 4)};

  display: block;

  width: 100%;
  min-width: 0;
  max-width: 100%;

  height: space(8);
  padding-block: space(2);
  padding-inline: space(3) space(8);

  color: var(--input-text);
  background-color: var(--input-bg);

  border: 0.1rem solid var(--input-border);
  border-radius: border-radius(sm);

  box-sizing: border-box;
  overflow: hidden;
  font: inherit;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  outline: none;

  cursor: pointer;

  @media (hover: hover) {
    &:hover {
      border-color: var(--input-border-hover);
    }
  }

  &:focus,
  &.is-open {
    border-color: var(--input-border-focus) !important;
    box-shadow: 0 0 0 0.4rem var(--input-ring);
  }

  &.has-error {
    --input-border: #{color(theme, danger, theme-alpha, 7)};
    --input-border-hover: #{color(theme, danger, theme-alpha, 8)};
    --input-border-focus: #{color(theme, danger, theme-alpha, 8)};
    --input-ring: #{color(theme, danger, theme-alpha, 4)};
  }

  &.is-disabled {
    pointer-events: none;
    opacity: 0.75;
  }
}

.select-field__icon {
  position: absolute;
  inset-block: 0;
  inset-inline-end: 0;

  pointer-events: none;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: space(8);
  height: 100%;

  color: color(text, secondary);
}

.select-field__menu {
  outline: none;

  background: color(bg, surface);
  border-radius: border-radius(md);
  box-shadow: box-shadow(3);

  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;

  max-height: space(100);

  scrollbar-width: thin;
  scrollbar-color: #{color(theme, neutral, theme-alpha, 8)} transparent;

  z-index: z-index(popper);
}

.select-field__option {
  cursor: pointer;

  display: flex;
  align-items: center;

  width: 100%;
  min-width: 0;
  overflow: hidden;

  padding: space(2) space(3);

  background: transparent;
  border: 0;
  color: color(text, primary);
  text-align: left;
  font: inherit;

  outline: none;

  & .option__wrapper {
    min-width: 0;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &.is-highlighted {
    background-color: color(theme, neutral, theme-alpha, 4);
  }

  &.is-selected {
    background-color: color(theme, primary, theme-alpha, 9);
    color: color(theme, primary, solid-fg);

    &.is-highlighted {
      background-color: color(theme, primary, theme-alpha, 10);
    }
  }
}
</style>
