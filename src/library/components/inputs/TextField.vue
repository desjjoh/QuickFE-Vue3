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
    :inputmode="props.inputmode"
    :maxlength="props.maxlength"
    :data-autofocus="props.autofocus ?? undefined"
    @input="handleChange"
    @blur="handleBlur"
    v-model="value"
  />
</template>

<script setup lang="ts">
import { useTextField } from '@/shared/hooks/useTextField'
import type { InputTypeHTMLAttribute } from 'vue'

type Props = {
  name: string
  value?: string
  placeholder?: string
  type?: Extract<InputTypeHTMLAttribute, 'text' | 'email' | 'password'>
  autocomplete?: string
  disabled?: boolean
  readonly?: boolean
  autofocus?: boolean
  inputmode?: 'numeric' | 'text' | 'email' | 'tel' | 'url' | 'decimal' | 'search' | 'none'
  maxlength?: number
}

const props = withDefaults(defineProps<Props>(), { type: 'text', autofocus: false })
const emit = defineEmits<{ update: [value: string | undefined] }>()

const { name, value, showError, handleBlur, handleChange } = useTextField(props, emit)
</script>

<style scoped lang="scss">
input {
  --input-text: #{color(text, primary)};
  --input-bg: #{color(control, input-bg)};

  --input-border: #{color(theme, neutral, theme-alpha, 7)};
  --input-border-hover: #{color(theme, neutral, theme-alpha, 8)};
  --input-border-focus: #{color(theme, primary, theme-alpha, 8)};
  --input-ring: #{color(theme, primary, theme-alpha, 4)};

  // BASE
  color: var(--input-text);
  background-color: var(--input-bg);

  border: 0.1rem solid var(--input-border);
  border-radius: border-radius(sm);

  font: inherit;

  padding: space(2) space(3);
  outline: none;

  height: space(8);
  width: 100%;

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
    --input-border: #{color(theme, danger, theme-alpha, 7)};
    --input-border-hover: #{color(theme, danger, theme-alpha, 8)};
    --input-border-focus: #{color(theme, danger, theme-alpha, 8)};
    --input-ring: #{color(theme, danger, theme-alpha, 4)};
  }

  // READ-ONLY
  &:read-only {
    --input-text: #{color(text, secondary)};
    --input-border-focus: #{color(theme, neutral, theme-alpha, 8)};
    --input-ring: #{color(theme, neutral, theme-alpha, 4)};
  }

  // DISABLED
  &:disabled {
    pointer-events: none;
    opacity: 0.75;
  }
}
</style>
