<template>
  <div class="password-field">
    <input
      :id="id"
      ref="inputRef"
      class="password-field__input"
      :class="[showError && 'has-error']"
      :name="name"
      :type="inputType"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      :value="value ?? ''"
      :disabled="disabled"
      :readonly="readonly"
      :aria-invalid="showError ? 'true' : 'false'"
      :data-autofocus="autofocus ?? undefined"
      @input="onInput"
      @blur="handleBlur"
    />

    <button
      type="button"
      class="password-field__toggle"
      :disabled="disabled"
      :aria-label="
        isVisible ? $t('accessibility.password.hide') : $t('accessibility.password.show')
      "
      :aria-pressed="isVisible ? 'true' : 'false'"
      @pointerdown.prevent
      @click="toggleVisibility"
    >
      <EyeOff v-if="isVisible" :size="14" :stroke-width="3" />
      <Eye v-else :size="14" :stroke-width="3" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { useField } from 'vee-validate'
import { Eye, EyeOff } from 'lucide-vue-next'

type Props = {
  id?: string
  name: string
  value?: string
  placeholder?: string
  autocomplete?: string
  disabled?: boolean
  readonly?: boolean
  autofocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autocomplete: 'current-password',
  disabled: false,
  readonly: false,
  autofocus: false,
})

const emit = defineEmits<{
  update: [value: string | undefined]
}>()

const name = toRef(props, 'name')
const inputRef = ref<HTMLInputElement | null>(null)
const isVisible = ref<boolean>(false)

const { value, errorMessage, handleBlur } = useField<string | undefined>(name.value, undefined, {
  initialValue: props.value,
})

const showError = computed(() => !!errorMessage.value)

const inputType = computed<'password' | 'text'>(() => {
  return isVisible.value ? 'text' : 'password'
})

function onInput(event: Event): void {
  const target = event.target as HTMLInputElement

  value.value = target.value || undefined
  emit('update', value.value)
}

function toggleVisibility(): void {
  if (props.disabled) return

  isVisible.value = !isVisible.value
  inputRef.value?.focus()
}
</script>

<style scoped lang="scss">
.password-field {
  position: relative;
  width: 100%;
}

.password-field__input {
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

.password-field__toggle {
  --input-icon: #{color(text, secondary)};
  --input-icon-hover: #{color(text, primary)};

  position: absolute;
  inset-block: 0;
  inset-inline-end: 0;

  cursor: pointer;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: space(8);
  height: 100%;
  padding: 0;

  color: var(--input-icon);
  background: transparent;
  border: 0;
  outline: none;

  @media (hover: hover) {
    &:hover {
      color: var(--input-icon-hover);
    }
  }

  &:focus-visible {
    color: var(--input-icon-hover);
  }

  &:disabled {
    cursor: default;
    opacity: 0.75;
  }
}
</style>
