<template>
  <div
    class="search-field"
    :class="[
      showError && 'has-error',
      props.disabled && 'is-disabled',
      props.readonly && 'is-readonly',
    ]"
    @pointerdown="handleShellPointerDown"
  >
    <Search
      class="search-field__icon"
      tabindex="-1"
      :size="14"
      :stroke-width="3"
      aria-hidden="true"
    />

    <input
      ref="inputRef"
      v-model="value"
      :name="name"
      class="search-field__input"
      :aria-invalid="showError ? 'true' : 'false'"
      type="search"
      :placeholder="props.placeholder"
      :autocomplete="props.autocomplete"
      :disabled="props.disabled"
      :readonly="props.readonly"
      @input="handleChange"
      @blur="handleBlur"
    />
  </div>
</template>

<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import { ref, type InputHTMLAttributes } from 'vue'

import { useTextField } from '@/shared/hooks/useTextField'

type Props = {
  name: string
  value?: string
  placeholder?: string
  autocomplete?: InputHTMLAttributes['autocomplete']
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  debounceMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  autocomplete: 'off',
  placeholder: 'Search…',
  clearable: true,
  debounceMs: 500,
})

const emit = defineEmits<{
  update: [value: string | undefined]
  search: [value: string | undefined]
  submit: [value: string | undefined]
  clear: []
}>()

const { name, value, showError, handleBlur, handleChange } = useTextField(props, emit)

const inputRef = ref<HTMLInputElement>()

function handleShellPointerDown(event: PointerEvent): void {
  if (props.disabled) return

  const target = event.target as HTMLElement | null

  if (!target) return

  if (target === inputRef.value) return

  event.preventDefault()
  inputRef.value?.focus()
}
</script>

<style scoped lang="scss">
.search-field {
  --input-text: #{color(text, primary)};
  --input-bg: #{palette(black, 5)};

  --input-border: #{color(theme, neutral, dark-alpha, 7)};
  --input-border-hover: #{color(theme, neutral, dark-alpha, 8)};
  --input-border-focus: #{color(theme, primary, dark-alpha, 8)};
  --input-ring: #{color(theme, primary, dark-alpha, 4)};
  --input-icon: #{color(text, secondary)};

  cursor: text;

  display: flex;
  align-items: center;
  gap: space(2);

  color: var(--input-text);
  background-color: var(--input-bg);

  border: 0.1rem solid var(--input-border);
  border-radius: border-radius(sm);

  padding-inline: space(3);
  padding-block: space(2);
  height: space(8);
  width: 100%;

  @media (hover: hover) {
    &:hover {
      border-color: var(--input-border-hover);
    }
  }

  &:focus-within {
    border-color: var(--input-border-focus);
    box-shadow: 0 0 0 0.4rem var(--input-ring);
  }

  &.has-error {
    --input-border: #{color(theme, danger, dark-alpha, 7)};
    --input-border-hover: #{color(theme, danger, dark-alpha, 8)};
    --input-border-focus: #{color(theme, danger, dark-alpha, 8)};
    --input-ring: #{color(theme, danger, dark-alpha, 4)};
  }

  &.is-readonly {
    --input-text: #{color(text, secondary)};
    --input-border-focus: #{color(theme, neutral, dark-alpha, 8)};
    --input-ring: #{color(theme, neutral, dark-alpha, 4)};
  }

  &.is-disabled {
    pointer-events: none;
    opacity: 0.75;
  }
}

.search-field__input {
  flex: 1 1 auto;
  min-width: 0;

  color: inherit;
  background: transparent;
  border: none;
  outline: none;
  font: inherit;

  &::placeholder {
    color: color(text, tertiary);
  }
}

.search-field__icon {
  color: var(--input-icon);
  flex: 0 0 auto;
}
</style>
