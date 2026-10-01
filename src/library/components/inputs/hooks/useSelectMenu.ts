import { autoUpdate, flip, offset, size, useFloating } from '@floating-ui/vue'
import { createFocusTrap, type FocusTrap } from 'focus-trap'
import { computed, nextTick, onBeforeUnmount, ref, useId, watch, type Ref } from 'vue'

type Options<T> = {
  options: () => T[]
  disabled: () => boolean
  selectedIndex: Ref<number>
  select: (option: T) => void
}

export function useSelectMenu<T>(options: Options<T>) {
  const isOpen = ref(false)
  const activeIndex = ref(-1)
  const optionRefs = ref<Array<HTMLButtonElement | null>>([])
  const inputRef = ref<HTMLInputElement | null>(null)
  const triggerWrap = ref<HTMLElement | null>(null)
  const menuEl = ref<HTMLElement | null>(null)
  const menuId = useId()
  const activeOptionId = computed(() =>
    activeIndex.value >= 0 ? getOptionId(activeIndex.value) : undefined,
  )
  const { floatingStyles } = useFloating(triggerWrap, menuEl, {
    placement: 'bottom-start',
    strategy: 'fixed',
    transform: false,
    open: isOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({ padding: 8 }),
      size({
        padding: 8,
        apply({ rects, elements }) {
          const width = `${Math.round(rects.reference.width)}px`
          Object.assign(elements.floating.style, { width, maxWidth: width })
        },
      }),
    ],
  })

  let focusTrap: FocusTrap | null = null
  let pointerMoveFrame: number | null = null
  let pendingPointerIndex: number | null = null

  function setOptionRef(el: HTMLButtonElement | null, index: number): void {
    optionRefs.value[index] = el
  }
  function getOptionId(index: number): string {
    return `${menuId}-${index}`
  }
  function focusOption(index: number): void {
    const length = options.options().length
    if (!length) return
    const wrapped = index < 0 ? length - 1 : index >= length ? 0 : index
    activeIndex.value = wrapped
    optionRefs.value[wrapped]?.scrollIntoView({ block: 'nearest' })
  }
  function onOptionPointerMove(index: number): void {
    if (options.disabled() || index === activeIndex.value) return
    pendingPointerIndex = index
    if (pointerMoveFrame !== null) return
    pointerMoveFrame = window.requestAnimationFrame(() => {
      pointerMoveFrame = null
      if (pendingPointerIndex != null && pendingPointerIndex !== activeIndex.value)
        activeIndex.value = pendingPointerIndex
      pendingPointerIndex = null
    })
  }
  function activateFocusTrap(): void {
    if (!menuEl.value) return
    focusTrap = createFocusTrap(menuEl.value, {
      escapeDeactivates: false,
      clickOutsideDeactivates: false,
      allowOutsideClick: true,
      returnFocusOnDeactivate: false,
      fallbackFocus: menuEl.value,
      initialFocus: menuEl.value,
    })
    focusTrap.activate()
  }
  function deactivateFocusTrap(): void {
    focusTrap?.deactivate()
    focusTrap = null
  }
  async function openMenu(): Promise<void> {
    if (options.disabled() || isOpen.value) return
    activeIndex.value = Math.max(options.selectedIndex.value, 0)
    isOpen.value = true
    await nextTick()
    activateFocusTrap()
    if (options.options().length) focusOption(activeIndex.value)
    else menuEl.value?.focus()
  }
  function closeMenu(closeOptions?: { restoreFocus?: boolean }): void {
    if (!isOpen.value) return
    isOpen.value = false
    deactivateFocusTrap()
    if (closeOptions?.restoreFocus) inputRef.value?.focus()
  }
  function toggleMenu(): void {
    if (isOpen.value) closeMenu()
    else void openMenu()
  }
  function onTriggerPointerDown(event: PointerEvent): void {
    if (options.disabled()) return
    event.preventDefault()
    triggerWrap.value?.focus({ preventScroll: true })
    toggleMenu()
  }
  async function onTriggerKeydown(event: KeyboardEvent): Promise<void> {
    if (options.disabled()) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleMenu()
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!isOpen.value) await openMenu()
      else focusOption(activeIndex.value + (event.key === 'ArrowDown' ? 1 : -1))
    } else if (event.key === 'Escape') {
      event.preventDefault()
      closeMenu()
    }
  }
  function onMenuKeydown(event: KeyboardEvent): void {
    if (event.repeat) {
      event.preventDefault()
      return
    }
    const items = options.options()
    const actions: Record<string, () => void> = {
      ArrowDown: () => focusOption(activeIndex.value + 1),
      ArrowUp: () => focusOption(activeIndex.value - 1),
      Home: () => focusOption(0),
      End: () => focusOption(items.length - 1),
      Escape: () => closeMenu({ restoreFocus: true }),
      Enter: () => {
        const option = items[activeIndex.value]
        if (option !== undefined) selectOption(option)
      },
      ' ': () => {
        const option = items[activeIndex.value]
        if (option !== undefined) selectOption(option)
      },
    }
    const action = actions[event.key]
    if (action) {
      event.preventDefault()
      action()
    }
  }
  function selectOption(option: T, selectOptions: { restoreFocus?: boolean } = {}): void {
    options.select(option)
    closeMenu({ restoreFocus: selectOptions.restoreFocus ?? true })
  }
  function isInside(event: Event): boolean {
    const target = event.target as Node
    return !!(triggerWrap.value?.contains(target) || menuEl.value?.contains(target))
  }
  function onDocumentPointerDown(event: PointerEvent): void {
    if (isOpen.value && !isInside(event)) closeMenu()
  }
  function onDocumentFocusIn(event: FocusEvent): void {
    if (isOpen.value && !isInside(event)) closeMenu()
  }
  function onDocumentScrollInteraction(event: WheelEvent | TouchEvent): void {
    if (isOpen.value && !(event.target && menuEl.value?.contains(event.target as Node)))
      closeMenu({ restoreFocus: false })
  }
  function removeDocumentListeners(): void {
    document.removeEventListener('pointerdown', onDocumentPointerDown, true)
    document.removeEventListener('focusin', onDocumentFocusIn)
    document.removeEventListener('wheel', onDocumentScrollInteraction, true)
    document.removeEventListener('touchmove', onDocumentScrollInteraction, true)
  }
  function cancelPointerFrame(): void {
    pendingPointerIndex = null
    if (pointerMoveFrame !== null) window.cancelAnimationFrame(pointerMoveFrame)
    pointerMoveFrame = null
  }
  watch(isOpen, (open) => {
    removeDocumentListeners()
    if (open) {
      document.addEventListener('pointerdown', onDocumentPointerDown, true)
      document.addEventListener('focusin', onDocumentFocusIn)
      document.addEventListener('wheel', onDocumentScrollInteraction, {
        capture: true,
        passive: false,
      })
      document.addEventListener('touchmove', onDocumentScrollInteraction, {
        capture: true,
        passive: false,
      })
    } else {
      deactivateFocusTrap()
      cancelPointerFrame()
    }
  })
  onBeforeUnmount(() => {
    removeDocumentListeners()
    deactivateFocusTrap()
    cancelPointerFrame()
  })

  return {
    isOpen,
    activeIndex,
    activeOptionId,
    inputRef,
    triggerWrap,
    menuEl,
    menuId,
    floatingStyles,
    setOptionRef,
    getOptionId,
    onOptionPointerMove,
    onTriggerPointerDown,
    onTriggerKeydown,
    onMenuKeydown,
    selectOption,
  }
}
