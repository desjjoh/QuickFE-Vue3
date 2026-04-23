import { onBeforeUnmount } from 'vue'

type DebouncedFunction<Args extends unknown[]> = ((...args: Args) => void) & {
  cancel: () => void
}

export function useDebounceFn<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay = 300,
): DebouncedFunction<Args> {
  let timer: ReturnType<typeof setTimeout> | undefined

  const debounced = ((...args: Args) => {
    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      timer = undefined
      fn(...args)
    }, delay)
  }) as DebouncedFunction<Args>

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = undefined
    }
  }

  onBeforeUnmount(() => {
    debounced.cancel()
  })

  return debounced
}
