<template>
  <button type="button" class="tab" :class="{ active: isActive }" @click="activate">
    <span><slot></slot></span>
  </button>
</template>

<script setup lang="ts">
import { inject, computed, type ComputedRef } from 'vue'
import { TabsKey, type TabId, type TabsContext, assertDefined } from './types'

const props = defineProps<{
  id: TabId
}>()

const context: TabsContext | undefined = inject(TabsKey)!

assertDefined(context, 'Tab must be used inside <TabLayout>')

const isActive: ComputedRef<boolean> = computed(() => context.activeTab.value === props.id)

const activate = (): void => {
  context.activeTab.value = props.id
}
</script>

<style scoped lang="scss">
.tab {
  position: relative;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  appearance: none;
  background: transparent;
  border: none;

  color: inherit;
  line-height: ui-line-height(tight);

  height: space(10);
  padding: 0 space(2);

  cursor: pointer;

  & span {
    border-radius: border-radius(sm);
    padding: space(1) space(2);
  }

  &.active {
    font-weight: font-weight(medium);
    color: color(text, primary);
  }

  &:focus-visible {
    outline: none;

    span {
      background-color: color(theme, neutral, dark-alpha, 3);
    }
  }

  @media (hover: hover) {
    &:hover {
      & span {
        background-color: color(theme, neutral, dark-alpha, 3);
      }
    }
  }
}

.tab::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;

  height: 2px;
  background: transparent;
}

.tab.active::after {
  background: color(theme, primary, dark, 9);
}
</style>
