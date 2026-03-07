<template>
  <input
    :name="name"
    :class="[showError && 'has-error']"
    :aria-invalid="showError ? 'true' : 'false'"
    :type="props.type"
    :placeholder="props.placeholder"
    :autocomplete="props.autocomplete"
    :disabled="props.disabled"
    :readonly="props.readonly"
    @input="handleChange"
    @blur="handleBlur"
    v-model="value"
  />
</template>

<script setup lang="ts">
import { useTextField } from '@/shared/hooks/TextField'
import type { InputTypeHTMLAttribute, InputHTMLAttributes } from 'vue'

type Props = {
  name: string
  value?: string
  placeholder?: string
  type?: InputTypeHTMLAttribute
  autocomplete?: InputHTMLAttributes['autocomplete']
  disabled?: boolean
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), { type: 'text' })
const emit = defineEmits<{ update: [value: string | undefined] }>()

const { name, value, showError, handleBlur, handleChange } = useTextField(props, emit)
</script>

<style scoped lang="scss">
input {
  --input-text: #{color(text, primary)};
  --input-bg: #{palette(black, 5)};

  --input-border: #{color(theme, neutral, dark-alpha, 7)};
  --input-border-hover: #{color(theme, neutral, dark-alpha, 8)};
  --input-border-focus: #{color(theme, primary, dark-alpha, 8)};
  --input-ring: #{color(theme, primary, dark-alpha, 4)};

  // BASE
  color: var(--input-text);
  background-color: var(--input-bg);

  border: 0.1rem solid var(--input-border);
  border-radius: border-radius(sm);

  font-size: font-size(base);

  padding: space(2) space(3);
  outline: none;

  height: space(8);

  transition:
    border 150ms ease,
    box-shadow 150ms ease,
    background-color 150ms ease,
    color 150ms ease;

  // HOVER
  @media (hover: hover) {
    &:hover {
      border-color: var(--input-border-hover);
    }
  }

  // FOCUS
  &:focus {
    border-color: var(--input-border-focus);
    box-shadow: 0 0 0 0.4rem var(--input-ring);
  }

  // HAS ERROR
  &.has-error {
    --input-border: #{color(theme, danger, dark-alpha, 7)};
    --input-border-hover: #{color(theme, danger, dark-alpha, 8)};
    --input-border-focus: #{color(theme, danger, dark-alpha, 8)};
    --input-ring: #{color(theme, danger, dark-alpha, 4)};
  }

  // READ-ONLY
  &:read-only {
    --input-text: #{color(text, secondary)};
    --input-border-focus: #{color(theme, neutral, dark-alpha, 8)};
    --input-ring: #{color(theme, neutral, dark-alpha, 4)};
  }

  // DISABLED
  &:disabled {
    pointer-events: none;
    opacity: 0.75;
  }
}
</style>
