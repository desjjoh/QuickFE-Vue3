import { onBeforeUnmount, watch, type Ref } from 'vue'

type DismissableLayerOptions = {
  isOpen: Ref<boolean>
  triggerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
  onDismiss: () => void
  onOutsideKeydown?: (event: KeyboardEvent) => void
}

export function useDismissableLayer({
  isOpen,
  triggerRef,
  contentRef,
  onDismiss,
  onOutsideKeydown,
}: DismissableLayerOptions): void {
  function isInsideLayer(target: Node): boolean {
    return !!(triggerRef.value?.contains(target) || contentRef.value?.contains(target))
  }

  function onDocumentPointerDown(event: PointerEvent): void {
    if (!isOpen.value) return

    const target = event.target as Node

    if (isInsideLayer(target)) return

    onDismiss()
  }

  function onDocumentFocusIn(event: FocusEvent): void {
    if (!isOpen.value) return

    const target = event.target as Node

    if (isInsideLayer(target)) return

    onDismiss()
  }

  function onDocumentKeydown(event: KeyboardEvent): void {
    if (!isOpen.value || !onOutsideKeydown) return

    const target = event.target as Node

    if (isInsideLayer(target)) return

    onOutsideKeydown(event)
  }

  function onDocumentScrollInteraction(event: WheelEvent | TouchEvent): void {
    if (!isOpen.value) return

    const target = event.target as Node | null

    if (target && contentRef.value?.contains(target)) return

    onDismiss()
  }

  function addGlobalListeners(): void {
    document.addEventListener('pointerdown', onDocumentPointerDown, true)
    document.addEventListener('focusin', onDocumentFocusIn)

    if (onOutsideKeydown) document.addEventListener('keydown', onDocumentKeydown, true)

    document.addEventListener('wheel', onDocumentScrollInteraction, {
      capture: true,
      passive: true,
    })
    document.addEventListener('touchmove', onDocumentScrollInteraction, {
      capture: true,
      passive: true,
    })
  }

  function removeGlobalListeners(): void {
    document.removeEventListener('pointerdown', onDocumentPointerDown, true)
    document.removeEventListener('focusin', onDocumentFocusIn)

    if (onOutsideKeydown) document.removeEventListener('keydown', onDocumentKeydown, true)

    document.removeEventListener('wheel', onDocumentScrollInteraction, true)
    document.removeEventListener('touchmove', onDocumentScrollInteraction, true)
  }

  watch(isOpen, (open) => {
    if (open) {
      addGlobalListeners()
      return
    }

    removeGlobalListeners()
  })

  onBeforeUnmount(removeGlobalListeners)
}
