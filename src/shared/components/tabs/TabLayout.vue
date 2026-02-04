<template>
  <div class="tabs__layout">
    <div class="tabs__header">
      <slot name="tabs"></slot>
    </div>

    <div class="tabs__body">
      <slot :name="activeTab"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { provide, computed, ref, useSlots, onMounted } from 'vue'
import { TabsKey, type TabId, type TabsContext } from './types'

type Props = { modelValue?: TabId }

const props = defineProps<Props>()

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
}

provide(TabsKey, context)
</script>

<style scoped lang="scss">
.tabs__layout {
  display: flex;
  flex-direction: column;
  align-self: stretch;

  gap: space(4);

  & .tabs__header {
    display: flex;
    gap: space(2);

    box-shadow: inset 0 calc(-1 * 0.1rem) 0 color(border, soft);
  }
}
</style>
