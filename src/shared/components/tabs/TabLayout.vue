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
import { provide, computed } from 'vue'
import { TabsKey, type TabId, type TabsContext } from './types'

const props = defineProps<{
  modelValue: TabId
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: TabId): void
}>()

const activeTab = computed<TabId>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
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
