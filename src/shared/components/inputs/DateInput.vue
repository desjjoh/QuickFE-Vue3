<template>
  <div class="date-field">
    <input
      :id="id"
      ref="inputRef"
      class="date-field__input"
      :class="[showError && 'has-error']"
      :name="name"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      :placeholder="$t('common.date-format')"
      maxlength="10"
      :value="value ?? ''"
      :disabled="disabled"
      :readonly="readonly"
      :aria-invalid="showError ? 'true' : 'false'"
      @input="onInput"
      @blur="handleBlur"
    />

    <span class="date-field__icon" aria-hidden="true">
      <CalendarDays :size="14" :stroke-width="3" />
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { useField } from 'vee-validate'
import { CalendarDays } from 'lucide-vue-next'

type Props = {
  id?: string
  name: string
  value?: string
  disabled?: boolean
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  readonly: false,
})

const emit = defineEmits<{
  update: [value: string | undefined]
}>()

const name = toRef(props, 'name')
const inputRef = ref<HTMLInputElement | null>(null)

const { value, errorMessage, handleBlur } = useField<string | undefined>(name.value, undefined, {
  initialValue: props.value,
})

const showError = computed(() => !!errorMessage.value)

function formatIsoDateInput(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, '').slice(0, 8)

  if (digits.length <= 4) return digits
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`

  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`
}

function onInput(event: Event): void {
  const target = event.target as HTMLInputElement
  const formatted = formatIsoDateInput(target.value)

  target.value = formatted
  value.value = formatted || undefined

  emit('update', value.value)
}
</script>

<style scoped lang="scss">
.date-field {
  position: relative;
  width: 100%;
}

.date-field__input {
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
  padding-inline: space(3) space(8);

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

  &:read-only {
    --input-text: #{color(text, secondary)};
    --input-border-focus: #{color(theme, neutral, theme-alpha, 8)};
    --input-ring: #{color(theme, neutral, theme-alpha, 4)};
  }

  &:disabled {
    pointer-events: none;
    opacity: 0.75;
  }
}

.date-field__icon {
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
</style>
