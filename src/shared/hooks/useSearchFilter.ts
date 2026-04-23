import { ref, toRef, watch } from 'vue'
import { deepEqual } from '@/helpers/object'

import { useDebounceFn } from './useDebounce'

export type UseSearchFilterProps = {
  value?: string
  disabled?: boolean
  debounceMs?: number
}

export type UseSearchFilterEmit = {
  (evt: 'update', value: string | undefined): void
  (evt: 'submit', value: string | undefined): void
}

export type UseSearchFilterReturn = {
  value: ReturnType<typeof ref<string | undefined>>
  inputRef: ReturnType<typeof ref<HTMLInputElement | undefined>>
  focusInput: () => void
  clear: () => void
  submit: () => void
}

export function useSearchFilter(
  props: UseSearchFilterProps,
  emit: UseSearchFilterEmit,
): UseSearchFilterReturn {
  const externalValue = toRef(props, 'value')
  const value = ref<string | undefined>(externalValue.value)
  const inputRef = ref<HTMLInputElement>()

  const isSyncing = ref(false)

  const emitUpdate = useDebounceFn((val: string | undefined) => {
    emit('update', val || undefined)
  }, props.debounceMs ?? 500)

  function focusInput(): void {
    if (props.disabled) return
    inputRef.value?.focus()
  }

  function clear(): void {
    value.value = undefined
    emitUpdate.cancel()
    emit('update', undefined)
    focusInput()
  }

  function submit(): void {
    emitUpdate.cancel()
    emit('submit', value.value || undefined)
  }

  watch(externalValue, (val) => {
    if (!deepEqual(val, value.value)) {
      isSyncing.value = true
      value.value = val
    }
  })

  watch(value, (val) => {
    if (isSyncing.value) {
      isSyncing.value = false
      return
    }

    emitUpdate(val)
  })

  return {
    value,
    inputRef,
    focusInput,
    clear,
    submit,
  }
}
