import type { InjectionKey, WritableComputedRef } from 'vue'

export type TabId = string
export type Tone = 'primary' | 'neutral'

export interface TabsContext {
  activeTab: WritableComputedRef<TabId>
  tone: Tone
}

export const TabsKey: InjectionKey<TabsContext> = Symbol('TabsContext')
