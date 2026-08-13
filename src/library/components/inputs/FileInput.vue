<template>
  <div
    class="file-input"
    :class="[showError && 'has-error', disabled && 'is-disabled', showFocusState && 'is-focused']"
    @click="openFilePicker"
  >
    <input
      :id="id"
      ref="fileInput"
      class="file-input__native"
      :name="name"
      type="file"
      :accept="accept"
      :disabled="disabled"
      @click.stop="onNativeFileClick"
      @change="onChange"
    />

    <input
      ref="displayInput"
      class="file-input__value"
      type="text"
      :value="fileName"
      :data-autofocus="autofocus || undefined"
      :placeholder="$t('common.no-file-chosen')"
      :disabled="disabled"
      readonly
      @focus="onDisplayFocus"
      @blur="onDisplayBlur"
      @keydown.enter.prevent="openFilePicker"
      @keydown.space.prevent="openFilePicker"
    />

    <span class="file-input__icon" aria-hidden="true">
      <Image :size="14" :stroke-width="2.5" />
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, toRef, type ComputedRef, type Ref } from 'vue'
import { useField } from 'vee-validate'
import { Image } from 'lucide-vue-next'

type Props = {
  id?: string
  name: string
  accept?: string
  disabled?: boolean
  autofocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  accept: undefined,
  disabled: false,
  autofocus: false,
})

const emit = defineEmits<{
  update: [value: File | null]
}>()

const name = toRef(props, 'name')

const fileInput: Ref<HTMLInputElement | null> = ref<HTMLInputElement | null>(null)
const displayInput: Ref<HTMLInputElement | null> = ref<HTMLInputElement | null>(null)

const fileName: Ref<string> = ref<string>('')
const isFocused: Ref<boolean> = ref<boolean>(false)
const isPickingFile: Ref<boolean> = ref<boolean>(false)

const { errorMessage, handleBlur, handleChange } = useField<File | null>(name.value, undefined, {
  initialValue: null,
  validateOnValueUpdate: false,
})

const showError: ComputedRef<boolean> = computed<boolean>(() => !!errorMessage.value)

const showFocusState: ComputedRef<boolean> = computed<boolean>(() => {
  return isFocused.value || isPickingFile.value
})

function openFilePicker(): void {
  if (props.disabled) return

  startPickingFile()
  fileInput.value?.click()
}

function onNativeFileClick(): void {
  startPickingFile()
}

function startPickingFile(): void {
  isPickingFile.value = true

  window.removeEventListener('focus', onWindowFocusAfterPicker)
  window.addEventListener('focus', onWindowFocusAfterPicker, { once: true })
}

function onWindowFocusAfterPicker(): void {
  window.setTimeout((): void => {
    restoreFocusAfterPicker()
  }, 0)
}

function restoreFocusAfterPicker(): void {
  isPickingFile.value = false
  displayInput.value?.focus()
}

function onDisplayFocus(): void {
  isFocused.value = true
}

function onDisplayBlur(event: FocusEvent): void {
  isFocused.value = false
  handleBlur(event)
}

function onChange(event: Event): void {
  const input: HTMLInputElement = event.target as HTMLInputElement
  const file: File | null = input.files?.[0] ?? null

  window.removeEventListener('focus', onWindowFocusAfterPicker)

  fileName.value = file?.name ?? ''

  handleChange(file, true)
  emit('update', file)

  restoreFocusAfterPicker()
}

onBeforeUnmount((): void => {
  window.removeEventListener('focus', onWindowFocusAfterPicker)
})
</script>

<style scoped lang="scss">
.file-input {
  --input-bg: #{color(control, input-bg)};

  --input-border: #{color(theme, neutral, theme-alpha, 7)};
  --input-border-hover: #{color(theme, neutral, theme-alpha, 8)};
  --input-border-focus: #{color(theme, primary, theme-alpha, 8)};
  --input-ring: #{color(theme, primary, theme-alpha, 4)};

  position: relative;
  display: flex;
  align-items: center;
  gap: space(2);

  width: 100%;
  height: space(8);
  padding-block: space(2);
  padding-inline: space(3) space(8);

  background-color: var(--input-bg);
  border: 0.1rem solid var(--input-border);
  border-radius: border-radius(sm);

  cursor: pointer;
  outline: none;

  @media (hover: hover) {
    &:hover {
      border-color: var(--input-border-hover);
    }
  }

  &.is-focused {
    border-color: var(--input-border-focus);
    box-shadow: 0 0 0 0.4rem var(--input-ring);
  }

  &.has-error {
    --input-border: #{color(theme, danger, theme-alpha, 7)};
    --input-border-hover: #{color(theme, danger, theme-alpha, 8)};
    --input-border-focus: #{color(theme, danger, theme-alpha, 8)};
    --input-ring: #{color(theme, danger, theme-alpha, 4)};
  }

  &.is-disabled {
    pointer-events: none;
    opacity: 0.75;
  }
}

.file-input__native {
  position: absolute;
  width: 0.1rem;
  height: 0.1rem;
  overflow: hidden;
  opacity: 0;
}

.file-input__value {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  padding: 0;

  color: color(text, primary);
  background: transparent;
  border: 0;
  outline: 0;

  font: inherit;
  text-overflow: ellipsis;
  white-space: nowrap;

  cursor: pointer;
}

.file-input__icon {
  position: absolute;
  inset-block: 0;
  inset-inline-end: 0;

  pointer-events: none;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: space(8);
  height: 100%;

  color: color(text, primary);
}
</style>
