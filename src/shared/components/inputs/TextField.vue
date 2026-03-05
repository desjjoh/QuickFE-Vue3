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
$input-tones: (
  primary: primary,
  neutral: neutral,
  success: success,
  warning: warning,
  danger: danger,
  info: info,
);

input {
  color: color(text, primary);
  background-color: palette(black, 5);

  border: 0.1rem solid color(theme, neutral, dark-alpha, 7);
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

  @media (hover: hover) {
    &:hover {
      border: 0.1rem solid color(theme, neutral, dark-alpha, 8);
    }
  }

  &:focus {
    border: 0.1rem solid color(theme, primary, dark-alpha, 8);
    box-shadow: 0 0 0 0.4rem color(theme, primary, dark-alpha, 4);
  }

  &.has-error {
    border: 0.1rem solid color(theme, danger, dark-alpha, 7);

    @media (hover: hover) {
      &:hover {
        border: 0.1rem solid color(theme, danger, dark-alpha, 8);
      }
    }

    &:focus {
      border: 0.1rem solid color(theme, danger, dark-alpha, 8);
      box-shadow: 0 0 0 0.4rem color(theme, danger, dark-alpha, 4);
    }
  }

  &:read-only {
    color: color(text, secondary);

    &:focus {
      border: 0.1rem solid color(theme, neutral, dark-alpha, 8);
      box-shadow: 0 0 0 0.4rem color(theme, neutral, dark-alpha, 4);
    }
  }

  &:disabled {
    pointer-events: none;
    opacity: 0.6;
  }
}
</style>
