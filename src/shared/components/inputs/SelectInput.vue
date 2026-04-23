<template>
  <div class="select-field">
    <div ref="triggerWrap" class="select-field__trigger" @keydown="onTriggerKeydown">
      <div
        class="select-field__control"
        :class="[showError && 'has-error', props.disabled && 'is-disabled', isOpen && 'is-open']"
        :aria-expanded="isOpen ? 'true' : 'false'"
        :aria-controls="menuId"
        aria-haspopup="listbox"
        @pointerdown="onTriggerPointerDown"
      >
        <input
          ref="inputRef"
          :name="name"
          class="select-field__input"
          :aria-invalid="showError ? 'true' : 'false'"
          :value="displayValue"
          :placeholder="props.placeholder"
          :disabled="props.disabled"
          readonly
          @blur="handleBlur"
        />

        <span class="select-field__icon" aria-hidden="true">
          <ChevronDown :size="14" :stroke-width="3" />
        </span>
      </div>
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
          @keydown="onMenuKeydown"
        >
          <button
            v-for="(option, index) in props.options"
            :key="getOptionKey(option, index)"
            :ref="(el) => setOptionRef(el as HTMLButtonElement | null, index)"
            type="button"
            role="option"
            class="select-field__option"
            :class="[
              index === activeIndex && 'is-highlighted',
              isSelected(option) && 'is-selected',
            ]"
            :aria-selected="isSelected(option) ? 'true' : 'false'"
            @pointermove="onOptionPointerMove(index)"
            @pointerleave="onOptionPointerLeave"
            @pointerdown.prevent="selectOption(option)"
          >
            <slot name="option" :option="option">
              {{ getOptionLabel(option) }}
            </slot>
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

type Props<T> = {
  name: string
  value?: T
  options: T[]
  placeholder?: string
  disabled?: boolean
  getLabel?: (option: T) => string
  getKey?: (option: T, index: number) => string | number
}

const props = withDefaults(defineProps<Props<T>>(), {
  placeholder: 'Select option…',
  disabled: false,
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
      apply({ rects, elements, availableHeight }) {
        Object.assign(elements.floating.style, {
          minWidth: `${Math.round(rects.reference.width)}px`,
          maxHeight: `${Math.max(0, Math.floor(availableHeight))}px`,
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
  const options = optionRefs.value.filter(Boolean)

  if (!options.length) return

  const wrappedIndex = index < 0 ? options.length - 1 : index >= options.length ? 0 : index

  activeIndex.value = wrappedIndex
  optionRefs.value[wrappedIndex]?.focus()
}

function onOptionPointerMove(index: number): void {
  if (props.disabled) return

  activeIndex.value = index
  optionRefs.value[index]?.focus()
}

function onOptionPointerLeave(): void {
  const activeEl = document.activeElement

  if (!menuEl.value || !activeEl) return
  if (!menuEl.value.contains(activeEl)) return

  focusMenu()
}

function activateFocusTrap(): void {
  if (!menuEl.value) return

  focusTrap = createFocusTrap(menuEl.value, {
    escapeDeactivates: false,
    clickOutsideDeactivates: false,
    allowOutsideClick: true,
    returnFocusOnDeactivate: true,
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

function isSelected(option: T): boolean {
  return deepEqual(value.value, option)
}

function getSelectedIndex(): number {
  return props.options.findIndex((option) => deepEqual(option, value.value))
}

async function openMenu(): Promise<void> {
  if (props.disabled || isOpen.value) return

  activeIndex.value = Math.max(getSelectedIndex(), 0)
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
  inputRef.value?.focus()
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

function selectOption(option: T): void {
  value.value = option
  closeMenu({ restoreFocus: true })
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

  if (triggerWrap.value?.contains(target) || menuEl.value?.contains(target)) {
    return
  }

  closeMenu()
}

watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('pointerdown', onDocumentPointerDown, true)
    document.addEventListener('focusin', onDocumentFocusIn)

    return
  }

  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  document.removeEventListener('focusin', onDocumentFocusIn)

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

  deactivateFocusTrap()
})
</script>

<style scoped lang="scss">
.select-field {
  width: 100%;
}

.select-field__trigger {
  width: 100%;
}

.select-field__control {
  --input-text: #{color(text, primary)};
  --input-bg: #{palette(black, 5)};

  --input-border: #{color(theme, neutral, dark-alpha, 7)};
  --input-border-hover: #{color(theme, neutral, dark-alpha, 8)};
  --input-border-focus: #{color(theme, primary, dark-alpha, 8)};
  --input-ring: #{color(theme, primary, dark-alpha, 4)};
  --input-icon: #{color(text, secondary)};

  display: flex;
  align-items: center;
  gap: space(2);

  width: 100%;
  height: space(8);
  padding-inline: space(3);

  color: var(--input-text);
  background-color: var(--input-bg);

  border: 0.1rem solid var(--input-border);
  border-radius: border-radius(sm);

  cursor: pointer;

  &.has-error {
    --input-border: #{color(theme, danger, dark-alpha, 7)};
    --input-border-hover: #{color(theme, danger, dark-alpha, 8)};
    --input-border-focus: #{color(theme, danger, dark-alpha, 8)};
    --input-ring: #{color(theme, danger, dark-alpha, 4)};
  }

  @media (hover: hover) {
    &:hover {
      border-color: var(--input-border-hover);
    }
  }

  &.is-open {
    border-color: var(--input-border-focus);
    box-shadow: 0 0 0 0.4rem var(--input-ring);
  }

  &.is-disabled {
    pointer-events: none;
    opacity: 0.75;
  }
}

.select-field__input {
  flex: 1 1 auto;
  min-width: 0;

  color: inherit;
  background: transparent;
  border: none;
  outline: none;
  font: inherit;
  cursor: pointer;

  &::placeholder {
    color: color(text, tertiary);
  }
}

.select-field__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  color: var(--input-icon);
}

.select-field__menu {
  outline: none;

  background: color(bg, surface);
  border-radius: border-radius(md);
  box-shadow: box-shadow(8);

  overflow: auto;
  max-height: space(100);

  scrollbar-width: thin;
  scrollbar-color: #{color(theme, neutral, dark-alpha, 8)} transparent;

  z-index: z-index(popper);
}

.select-field__option {
  cursor: pointer;

  display: flex;
  align-items: center;

  width: 100%;
  min-width: 0;

  padding: space(2) space(3);

  background: transparent;
  border: 0;
  color: color(text, primary);
  text-align: left;
  font: inherit;

  outline: none;

  &.is-highlighted {
    background-color: color(theme, neutral, dark-alpha, 4);
  }

  &.is-selected {
    background-color: color(theme, primary, dark-alpha, 4);
    color: color(theme, primary, dark-alpha, 11);
  }
}
</style>
