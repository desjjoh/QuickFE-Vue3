import { deepEqual } from '@/helpers/object'
import { useField } from 'vee-validate'
import { computed, ref, toRef, watch, type Ref } from 'vue'

export type UseTextFieldProps = {
  name: string
  value?: string
}

export type UseTextFieldReturn = {
  name: Ref<string>
  value: Ref<string | undefined>
  showError: Ref<boolean>
  handleBlur: (e?: Event, shouldValidate?: boolean) => void
  handleChange: (e: Event | unknown, shouldValidate?: boolean) => void
}

export function useTextField(
  props: UseTextFieldProps,
  emit: (evt: 'update', value: string | undefined) => void,
): UseTextFieldReturn {
  const name = toRef(props, 'name')

  const { value, errorMessage, handleBlur, handleChange } = useField<string | undefined>(
    name.value,
    undefined,
    {
      initialValue: props.value,
    },
  )

  const isSyncing = ref<boolean>(false)
  const showError = computed(() => !!errorMessage.value)

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

  return {
    name,
    value,
    showError,
    handleBlur,
    handleChange,
  }
}
