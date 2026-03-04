<template>
  <label
    :for="inputId"
    class="checkox__input"
    :class="[
      props.disabled && 'is-disabled',
      showError && 'has-error',
      props.readonly && 'is-readonly',
    ]"
  >
    <input
      ref="inputRef"
      class="checkbox__input"
      type="checkbox"
      :id="inputId"
      :name="name"
      :checked="checked"
      :disabled="props.disabled"
      :aria-invalid="showError ? 'true' : 'false'"
      @change="onChange"
      @blur="handleBlur"
    />

    <span class="cb__box" aria-hidden="true"> </span>
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

.checkox__input {
  cursor: pointer;

  &.is-disabled {
    pointer-events: none;
    opacity: 0.6;
  }

  input[type='checkbox'] {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }
}

.cb__box {
  --check: #{color(text, primary)};
  --border-color: #{color(theme, primary, dark-alpha, 8)};
  --ring: #{color(theme, primary, dark-alpha, 3)};

  width: $cb-size;
  height: $cb-size;

  display: inline-grid;
  place-items: center;

  background-color: palette(black, 5);
  border: $cb-bw solid color(theme, neutral, dark-alpha, 7);
  border-radius: border-radius(sm);

  transition:
    border-color 150ms ease,
    box-shadow 150ms ease,
    background-color 150ms ease;

  &::after {
    content: '';
    width: 55%;
    height: 55%;
    transform: scale(0);
    transition: transform 120ms ease;

    background-color: var(--check);
    clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0, 43% 62%);
  }

  @media (hover: hover) {
    .checkox__input:hover & {
      border-color: color(theme, neutral, dark-alpha, 8);
    }
  }

  .checkbox__input:focus-visible + & {
    border-color: var(--border-color);
    box-shadow: 0 0 0 0.4rem var(--ring);
  }

  .checkbox__input:checked + &::after {
    transform: scale(1);
  }

  .is-readonly & {
    --check: #{color(text, secondary)};
    --border-color: #{color(theme, neutral, dark-alpha, 8)};
    --ring: #{color(theme, neutral, dark-alpha, 3)};
  }
}
</style>
