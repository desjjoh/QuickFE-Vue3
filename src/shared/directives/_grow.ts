import type { Directive } from 'vue'

export const vGrow: Directive<HTMLElement, boolean | undefined> = {
  mounted(el, binding) {
    el.style.flexGrow = binding.value === false ? '' : '1'
  },
  updated(el, binding) {
    el.style.flexGrow = binding.value === false ? '' : '1'
  },
}
