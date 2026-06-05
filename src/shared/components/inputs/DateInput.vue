<template>
  <div class="date-field">
    <div
      class="date-field__control"
      :class="[showError && 'has-error', disabled && 'is-disabled']"
      @pointerdown="focusInput"
    >
      <input
        :id="id"
        ref="inputRef"
        class="date-field__input"
        :name="name"
        type="text"
        inputmode="numeric"
        autocomplete="off"
        placeholder="YYYY-MM-DD"
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

function focusInput(event: PointerEvent): void {
  if (props.disabled) return

  const target = event.target as HTMLElement | null
  if (!target) return

  event.preventDefault()
  inputRef.value?.focus()
}
</script>

<style scoped lang="scss">
.date-field {
  width: 100%;
}

.date-field__control {
  --input-text: #{color(text, primary)};
  --input-bg: #{palette(black, 5)};

  --input-border: #{color(theme, neutral, dark-alpha, 7)};
  --input-border-hover: #{color(theme, neutral, dark-alpha, 8)};
  --input-border-focus: #{color(theme, primary, dark-alpha, 8)};
  --input-ring: #{color(theme, primary, dark-alpha, 4)};
  --input-icon: #{color(text, secondary)};

  display: flex;
  align-items: center;
  gap: space(2);

  width: 100%;
  height: space(8);
  padding-inline: space(3);

  color: var(--input-text);
  background-color: var(--input-bg);

  border: 0.1rem solid var(--input-border);
  border-radius: border-radius(sm);

  cursor: text;

  @media (hover: hover) {
    &:hover,
    &:has(.date-field__input:hover) {
      border-color: var(--input-border-hover);
    }
  }

  &:focus-within {
    border-color: var(--input-border-focus) !important;
    box-shadow: 0 0 0 0.4rem var(--input-ring);
  }

  &.has-error {
    --input-border: #{color(theme, danger, dark-alpha, 7)};
    --input-border-hover: #{color(theme, danger, dark-alpha, 8)};
    --input-border-focus: #{color(theme, danger, dark-alpha, 8)};
    --input-ring: #{color(theme, danger, dark-alpha, 4)};
  }

  &.is-disabled {
    pointer-events: none;
    opacity: 0.75;
  }
}

.date-field__input {
  flex: 1 1 auto;
  min-width: 0;

  color: inherit;
  background: transparent;
  border: none;
  outline: none;
  font: inherit;
  line-height: 1;

  cursor: text;

  &:read-only {
    --input-text: #{color(text, secondary)};
  }
}

.date-field__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;

  color: var(--input-icon);
  pointer-events: none;
}
</style>
