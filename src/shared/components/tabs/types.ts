import type { InjectionKey, WritableComputedRef } from 'vue'

export type TabId = string

export interface TabsContext {
  activeTab: WritableComputedRef<TabId>
}

export const TabsKey: InjectionKey<TabsContext> = Symbol('TabsContext')

export function assertDefined<T>(value: T, message: string): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(message)
  }
}
