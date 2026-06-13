<template>
  <label
    class="checkbox__input"
    :for="inputId"
    :class="[
      props.disabled && 'is-disabled',
      showError && 'has-error',
      props.readonly && 'is-readonly',
    ]"
    @click="inputRef?.focus()"
  >
    <input
      ref="inputRef"
      type="checkbox"
      :id="inputId"
      :name="name"
      :checked="checked"
      :disabled="props.disabled"
      :aria-invalid="showError ? 'true' : 'false'"
      @change="onChange"
      @blur="handleBlur"
    />
    <span class="checkbox__span" aria-hidden="true"></span>
  </label>
</template>

<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import { useId } from 'vue'
import { useField } from 'vee-validate'

const props = withDefaults(
  defineProps<{
    id?: string

    name: string
    value?: boolean

    disabled?: boolean
    readonly?: boolean
  }>(),
  {},
)

const emit = defineEmits<{ update: [value: boolean | undefined] }>()

const autoId = useId()
const inputId = computed(() => props.id ?? `${autoId}-checkbox`)

const name = toRef(props, 'name')

const inputRef = ref<HTMLInputElement | null>(null)
const isSyncing = ref(false)

const { value, errorMessage, handleBlur } = useField<boolean | undefined>(name.value, undefined, {
  initialValue: props.value,
})

const showError = computed(() => !!errorMessage.value)
const checked = computed(() => value.value === true)

function onChange(e: Event) {
  if (props.readonly) {
    if (inputRef.value) inputRef.value.checked = checked.value
    return
  }

  const next = (e.target as HTMLInputElement).checked
  value.value = next ? true : false
}

watch(
  () => props.value,
  (val) => {
    if (val !== value.value) {
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
</script>

<style scoped lang="scss">
$cb-size: space(5);
$cb-bw: 0.1rem;

.checkbox__input {
  display: inline-block;
  position: relative;
  line-height: 0;

  cursor: pointer;

  input[type='checkbox'] {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }

  --cb-border: #{color(theme, neutral, theme-alpha, 7)};
  --cb-border-hover: #{color(theme, neutral, theme-alpha, 8)};
  --cb-border-focus: #{color(theme, primary, theme-alpha, 8)};
  --cb-ring: #{color(theme, primary, theme-alpha, 3)};
  --cb-check: #{color(text, primary)};

  // BASE STYLE
  .checkbox__span {
    --cb-check: #{color(text, primary)};

    pointer-events: none;

    display: inline-grid;
    place-items: center;

    width: $cb-size;
    height: $cb-size;

    background-color: color(control, input-bg);
    border: $cb-bw solid var(--cb-border);
    border-radius: border-radius(sm);

    &::after {
      content: '';
      width: 55%;
      height: 55%;
      background-color: var(--cb-check);
      clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0, 43% 62%);
      transform: scale(0);
      transition: transform 120ms ease;
    }
  }

  input[type='checkbox']:checked + .checkbox__span {
    &::after {
      transform: scale(1);
    }
  }

  // HOVER STATE
  @media (hover: hover) {
    &:hover .checkbox__span,
    & input[type='checkbox']:hover + .checkbox__span {
      border-color: var(--cb-border-hover);
    }
  }

  // FOCUS STATE
  &:focus-within .checkbox__span,
  &:active .checkbox__span {
    border-color: var(--cb-border-focus) !important;
    box-shadow: 0 0 0 0.4rem var(--cb-ring);
  }

  // HAS ERROR
  &.has-error {
    --cb-border: #{color(theme, danger, theme-alpha, 7)};
    --cb-border-hover: #{color(theme, danger, theme-alpha, 8)};
    --cb-border-focus: #{color(theme, danger, theme-alpha, 8)};
    --cb-ring: #{color(theme, danger, theme-alpha, 3)};
  }

  // READ-ONLY
  &.is-readonly {
    --cb-check: #{color(text, secondary)};
    --cb-border-focus: #{color(theme, neutral, theme-alpha, 8)};
    --cb-ring: #{color(theme, neutral, theme-alpha, 3)};
  }

  // DISABLED
  &.is-disabled {
    pointer-events: none;
    opacity: 0.5;
  }
}
</style>
