<template>
  <input
    v-model="value"
    :class="[showError && 'has-error']"
    :type="props.type"
    :name="name"
    :value="value ?? ''"
    :placeholder="props.placeholder"
    :autocomplete="props.autocomplete"
    :disabled="props.disabled"
    :readonly="props.readonly"
    :aria-invalid="showError ? 'true' : 'false'"
    @input="handleChange"
    @blur="handleBlur"
  />
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  toRef,
  watch,
  type InputHTMLAttributes,
  type InputTypeHTMLAttribute,
} from 'vue'

import { useField } from 'vee-validate'
import { deepEqual } from '@/helpers/object'

type proptype = {
  name: string
  value?: string

  placeholder?: string

  type?: InputTypeHTMLAttribute
  autocomplete?: InputHTMLAttributes['autocomplete']

  disabled?: boolean
  readonly?: boolean
}

const props = withDefaults(defineProps<proptype>(), { variant: 'classic', type: 'text' })
const emit = defineEmits<{ update: [value: string | undefined] }>()

const name = toRef(props, 'name')
const isSyncing = ref<boolean>(false)
const showError = computed(() => !!errorMessage.value)

const { value, errorMessage, handleBlur, handleChange } = useField<string | undefined>(
  name.value,
  undefined,
  {
    initialValue: props.value,
  },
)

watch(
  () => props.value,
  (val: string | undefined) => {
    if (!deepEqual(val, value.value)) {
      isSyncing.value = true
      value.value = val
    }
  },
)

watch(value, (newVal: string | undefined) => {
  if (isSyncing.value) {
    isSyncing.value = false
    return
  }

  emit('update', newVal)
})
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
    opacity: 0.6;
  }
}
</style>
