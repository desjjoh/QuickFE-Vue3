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
import { computed, ref, toRef, watch } from 'vue'
import { useField } from 'vee-validate'
import { ChevronDown } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { deepEqual } from '@/shared/helpers/object'
import { useSelectMenu } from './hooks/useSelectMenu'

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
const props = withDefaults(defineProps<Props<T>>(), { disabled: false })
const emit = defineEmits<{ update: [value: T | undefined] }>()
const { t, locale } = useI18n()
const placeholder = computed(() => props.placeholder ?? t('common.select-option'))
const name = toRef(props, 'name')
const { value, errorMessage, handleBlur } = useField<T | undefined>(name.value, undefined, {
  initialValue: props.value,
})
const showError = computed(() => !!errorMessage.value)
const isSyncing = ref(false)
const selectedIndex = computed(() =>
  props.options.findIndex((option) => deepEqual(option, value.value)),
)
const {
  isOpen,
  activeIndex,
  activeOptionId,
  inputRef,
  triggerWrap,
  menuEl,
  menuId,
  floatingStyles,
  setOptionRef,
  getOptionId,
  onOptionPointerMove,
  onTriggerPointerDown,
  onTriggerKeydown,
  onMenuKeydown,
  selectOption,
} = useSelectMenu({
  options: () => props.options,
  disabled: () => props.disabled,
  selectedIndex,
  select: (option) => {
    value.value = option
  },
})
const displayValue = computed(() => (value.value == null ? '' : getOptionLabel(value.value)))
function getOptionLabel(option: T): string {
  return props.getLabel ? props.getLabel(option) : String(option)
}
function getOptionKey(option: T, index: number): string | number {
  return props.getKey ? props.getKey(option, index) : index
}
watch(
  () => props.value,
  (nextValue) => {
    if (!deepEqual(nextValue, value.value)) {
      isSyncing.value = true
      value.value = nextValue
    }
  },
)
watch(value, (nextValue) => {
  if (isSyncing.value) {
    isSyncing.value = false
    return
  }
  emit('update', nextValue)
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
