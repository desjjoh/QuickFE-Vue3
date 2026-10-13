import { defineComponent, type Component } from 'vue'
import { mount, type ComponentMountingOptions } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter, type RouteRecordRaw } from 'vue-router'
import en from '@/shared/i18n/locales/en'
import fr from '@/shared/i18n/locales/fr'
import es from '@/shared/i18n/locales/es'

export function createTestPlugins(locale: 'en' | 'fr' | 'es' = 'en') {
  return [
    createPinia(),
    createI18n({
      legacy: false,
      locale,
      fallbackLocale: 'en',
      messages: { en, fr, es },
    }),
  ]
}

export function mountLibrary<C extends Component>(
  component: C,
  options: ComponentMountingOptions<C> = {},
) {
  return mount(component, {
    ...options,
    global: {
      ...options.global,
      plugins: [...createTestPlugins(), ...(options.global?.plugins ?? [])],
    },
  })
}

export function mountHook<T>(hook: () => T) {
  let result!: T
  const wrapper = mountLibrary(
    defineComponent({
      setup() {
        result = hook()
        return () => null
      },
    }),
  )
  return { result, wrapper }
}

export async function createTestRouter(routes: RouteRecordRaw[], initialPath = '/') {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(initialPath)
  await router.isReady()
  return router
}
