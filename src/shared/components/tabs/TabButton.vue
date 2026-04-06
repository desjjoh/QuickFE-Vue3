<template>
  <button
    type="button"
    class="tab"
    :class="[isActive && 'active', tone && `tone-${tone}`]"
    @click="activate"
  >
    <span><slot></slot></span>
  </button>
</template>

<script setup lang="ts">
import { inject, computed, type ComputedRef } from 'vue'
import { TabsKey, type TabId, type TabsContext } from './types'
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

<style scoped lang="scss">
$tab-tones: (
  primary: primary,
  neutral: neutral,
);

.tab {
  --tab-height: #{space(10)};
  --tab-padding-x: #{space(2)};
  --tab-inner-padding-x: #{space(2)};
  --tab-inner-padding-y: #{space(1)};
  --tab-radius: #{border-radius(sm)};

  --tab-fg: inherit;
  --tab-fg-active: #{color(text, primary)};
  --tab-hover-bg: #{color(theme, neutral, dark-alpha, 3)};
  --tab-focus-bg: #{color(theme, neutral, dark-alpha, 3)};
  --tab-indicator: #{color(theme, primary, dark, 9)};
  --tab-indicator-height: 2px;

  position: relative;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  appearance: none;
  background: transparent;
  border: none;
  font: inherit;

  height: var(--tab-height);
  padding-inline: var(--tab-padding-x);

  color: var(--tab-fg);
  line-height: ui-line-height(tight);

  cursor: pointer;

  span {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    padding: var(--tab-inner-padding-y) var(--tab-inner-padding-x);
    border-radius: var(--tab-radius);
  }

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;

    height: var(--tab-indicator-height);
    background-color: transparent;
    border-radius: 999px;
  }

  &.active {
    color: var(--tab-fg-active);

    &::after {
      background-color: var(--tab-indicator);
    }
  }

  &:focus-visible {
    outline: none;

    span {
      background-color: var(--tab-focus-bg);
    }
  }

  @media (hover: hover) {
    &:hover {
      span {
        background-color: var(--tab-hover-bg);
      }
    }
  }

  @each $tone, $value in $tab-tones {
    &.tone-#{$tone} {
      --tab-indicator: #{color(theme, $value, dark, 9)};
    }
  }
}
</style>
