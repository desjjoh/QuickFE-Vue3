<template>
  <FlexBox direction="column" align-self="stretch" :gap="4">
    <TabHeader>
      <slot name="tabs"></slot>
    </TabHeader>

    <Transition name="router-view-fade" mode="out-in" appear>
      <div v-if="$slots[activeTab]" :key="activeTab" class="tabs__body">
        <slot :name="activeTab"></slot>
      </div>
    </Transition>
  </FlexBox>
</template>

<script setup lang="ts">
import { provide, computed, ref, useSlots, Fragment, type VNode } from 'vue'
import { TabsKey, type TabId, type TabsContext, type Tone } from './tabs'
import FlexBox from '../flex/FlexBox.vue'
import TabHeader from './TabHeader.vue'

type Props = { modelValue?: TabId; tone?: Tone }

const props = withDefaults(defineProps<Props>(), { tone: 'primary' })

const emit = defineEmits<{
  (e: 'update:modelValue', value: TabId): void
}>()

const internalValue = ref<TabId | null>(null)
const slots = useSlots()

function firstTabId(nodes: VNode[]): TabId | undefined {
  for (const node of nodes) {
    if (node.type === Fragment && Array.isArray(node.children)) {
      const id = firstTabId(node.children as VNode[])
      if (id !== undefined) return id
    }
    if (typeof node.props?.id === 'string') return node.props.id
  }
}

const activeTab = computed<TabId>({
  get: () => props.modelValue ?? internalValue.value ?? firstTabId(slots.tabs?.() ?? []) ?? '',
  set: (value) => {
    internalValue.value = value
    emit('update:modelValue', value)
  },
})

const context: TabsContext = {
  activeTab,
  tone: props.tone,
}

provide(TabsKey, context)
</script>
