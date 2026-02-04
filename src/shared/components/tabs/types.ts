import type { InjectionKey, WritableComputedRef } from 'vue'

export type TabId = string

export interface TabsContext {
  activeTab: WritableComputedRef<TabId>
}

export const TabsKey: InjectionKey<TabsContext> = Symbol('TabsContext')
