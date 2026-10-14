import type { InjectionKey, WritableComputedRef } from 'vue'

export type TabId = string
export type Tone = 'primary' | 'neutral'

export interface TabsContext {
  id: string
  activeTab: WritableComputedRef<TabId>
  tone: Tone
}

export const TabsKey: InjectionKey<TabsContext> = Symbol('TabsContext')
