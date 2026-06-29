<template>
  <button
    type="button"
    class="tab"
    :class="[isActive && 'active', tone && `tone-${tone}`]"
    @click="activate"
  >
    <span>
      <slot></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { inject, computed, type ComputedRef } from 'vue'
import { TabsKey, type TabId, type TabsContext } from '@/library/types/components/tabs'
import { assertDefined } from '@/helpers/assert'

const props = defineProps<{
  id: TabId
}>()

const context: TabsContext | undefined = inject(TabsKey)!
assertDefined(context, 'Tab must be used inside <TabLayout>')

const isActive: ComputedRef<boolean> = computed(() => context.activeTab.value === props.id)
const { activeTab, tone } = context

const activate = (): void => {
  activeTab.value = props.id
}
</script>
