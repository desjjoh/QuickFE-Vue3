import type { Directive } from 'vue'

export const vShrink: Directive<HTMLElement, boolean | undefined> = {
  mounted(el, binding) {
    el.style.flexShrink = binding.value === false ? '' : '1'
  },
  updated(el, binding) {
    el.style.flexShrink = binding.value === false ? '' : '1'
  },
}
