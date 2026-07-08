<template>
  <div class="search-field">
    <span class="search-field__icon" aria-hidden="true">
      <Search :size="14" :stroke-width="3" />
    </span>

    <input
      ref="inputRef"
      v-model="value"
      :name="name"
      class="search-field__input"
      :class="[
        showError && 'has-error',
        props.disabled && 'is-disabled',
        props.readonly && 'is-readonly',
      ]"
      :aria-invalid="showError ? 'true' : 'false'"
      type="text"
      role="searchbox"
      :placeholder="placeholder"
      :autocomplete="props.autocomplete"
      :disabled="props.disabled"
      :readonly="props.readonly"
      @input="handleChange"
      @blur="handleBlur"
    />

    <button
      v-if="showClearButton"
      type="button"
      class="search-field__clear"
      :disabled="props.disabled || props.readonly"
      :aria-label="$t('accessibility.search.clear')"
      @pointerdown.prevent
      @click="clearSearch"
    >
      <X :size="14" :stroke-width="3" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Search, X } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useTextField } from '@/shared/hooks/useTextField'

type Props = {
  name: string
  value?: string
  placeholder?: string
  autocomplete?: string
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  debounceMs?: number
}

const { t } = useI18n()

const props = withDefaults(defineProps<Props>(), {
  autocomplete: 'off',
  clearable: true,
  debounceMs: 500,
})

const placeholder = computed(() => {
  return props.placeholder ?? t('common.search')
})

const emit = defineEmits<{
  update: [value: string | undefined]
  search: [value: string | undefined]
  submit: [value: string | undefined]
  clear: []
}>()

const { name, value, showError, handleBlur, handleChange } = useTextField(props, emit)

const inputRef = ref<HTMLInputElement | null>(null)

const showClearButton = computed<boolean>(() => {
  return props.clearable && !props.disabled && !props.readonly && !!value.value
})

function clearSearch(): void {
  if (props.disabled || props.readonly) return

  value.value = undefined

  emit('update', undefined)
  emit('search', undefined)
  emit('clear')

  inputRef.value?.focus()
}
</script>

<style scoped lang="scss">
.search-field {
  position: relative;
  width: 100%;
}

.search-field__input {
  --input-text: #{color(text, primary)};
  --input-bg: #{color(control, input-bg)};

  --input-border: #{color(theme, neutral, theme-alpha, 7)};
  --input-border-hover: #{color(theme, neutral, theme-alpha, 8)};
  --input-border-focus: #{color(theme, primary, theme-alpha, 8)};
  --input-ring: #{color(theme, primary, theme-alpha, 4)};

  display: block;

  width: 100%;
  height: space(8);
  padding-block: space(2);
  padding-inline: space(8) space(8);

  color: var(--input-text);
  background-color: var(--input-bg);

  border: 0.1rem solid var(--input-border);
  border-radius: border-radius(sm);

  font: inherit;
  line-height: 1;
  outline: none;

  @media (hover: hover) {
    &:hover {
      border-color: var(--input-border-hover);
    }
  }

  &:focus {
    border-color: var(--input-border-focus);
    box-shadow: 0 0 0 0.4rem var(--input-ring);
  }

  &.has-error {
    --input-border: #{color(theme, danger, theme-alpha, 7)};
    --input-border-hover: #{color(theme, danger, theme-alpha, 8)};
    --input-border-focus: #{color(theme, danger, theme-alpha, 8)};
    --input-ring: #{color(theme, danger, theme-alpha, 4)};
  }

  &.is-readonly {
    --input-text: #{color(text, secondary)};
    --input-border-focus: #{color(theme, neutral, theme-alpha, 8)};
    --input-ring: #{color(theme, neutral, theme-alpha, 4)};
  }

  &.is-disabled {
    pointer-events: none;
    opacity: 0.75;
  }

  &::placeholder {
    color: color(text, tertiary);
  }
}

.search-field__icon {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;

  pointer-events: none;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: space(8);
  height: 100%;

  color: color(text, secondary);
}

.search-field__clear {
  --input-icon: #{color(text, secondary)};
  --input-icon-hover: #{color(text, primary)};

  position: absolute;
  inset-block: 0;
  inset-inline-end: 0;

  cursor: pointer;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: space(8);
  height: 100%;
  padding: 0;

  color: var(--input-icon);
  background: transparent;
  border: 0;
  outline: none;

  @media (hover: hover) {
    &:hover {
      color: var(--input-icon-hover);
    }
  }

  &:focus-visible {
    color: var(--input-icon-hover);
  }

  &:disabled {
    cursor: default;
    opacity: 0.75;
  }
}
</style>
