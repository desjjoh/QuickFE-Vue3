<template>
  <textarea
    class="form-field"
    :class="[showError && 'has-error']"
    :name="name"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :readonly="props.readonly"
    :rows="props.rows"
    :aria-invalid="showError ? 'true' : 'false'"
    @input="handleChange"
    @blur="handleBlur"
    v-model="value"
  >
  </textarea>
</template>

<script setup lang="ts">
import { useTextField } from '@/shared/hooks/useTextField'

type Props = {
  name: string
  value?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  rows: 4,
})

const emit = defineEmits<{ update: [value: string | undefined] }>()

const { name, value, showError, handleBlur, handleChange } = useTextField(props, emit)
</script>

<style scoped lang="scss">
.form-field {
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
  font: inherit;
  padding: space(2) space(3);
  outline: none;

  resize: none;

  scrollbar-width: thin;
  scrollbar-color: #{color(theme, neutral, dark-alpha, 7)} transparent;

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
