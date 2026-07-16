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
import { provide, computed, ref, useSlots, onMounted } from 'vue'
import { TabsKey, type TabId, type TabsContext, type Tone } from '@/library/types/components/tabs'
import FlexBox from '../flex/FlexBox.vue'
import TabHeader from './TabHeader.vue'

type Props = { modelValue?: TabId; tone?: Tone }

const props = withDefaults(defineProps<Props>(), { tone: 'primary' })

const emit = defineEmits<{
  (e: 'update:modelValue', value: TabId): void
}>()

const internalValue = ref<TabId | null>(null)

const activeTab = computed<TabId>({
  get: () => props.modelValue ?? internalValue.value!,
  set: (value) => {
    internalValue.value = value
    emit('update:modelValue', value)
  },
})

const slots = useSlots()

onMounted(() => {
  if (internalValue.value) return

  const tabs = slots.tabs?.()
  const firstTabId = tabs?.[0]?.props?.id

  if (!firstTabId) return

  internalValue.value = firstTabId
})

const context: TabsContext = {
  activeTab,
  tone: props.tone,
}

provide(TabsKey, context)
</script>
