<template>
  <RouterLink :to="{ name: to }" class="tab" activeClass="active" role="tab">
    <span>
      <slot></slot>
    </span>
  </RouterLink>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { assertDefined } from '@/helpers/assert'
import { type TabsContext, TabsKey } from './types'

defineProps<{
  to: string
}>()

const context: TabsContext | undefined = inject(TabsKey)!
assertDefined(context, 'Tab must be used inside <TabLayout>')
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

  // BASE
  position: relative;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  height: var(--tab-height);
  padding-inline: var(--tab-padding-x);

  appearance: none;
  background: transparent;
  border: none;

  text-decoration: none;
  color: var(--tab-fg);
  line-height: #{ui-line-height(tight)};

  cursor: pointer;

  & span {
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

  // ACTIVE
  &.active {
    color: var(--tab-fg-active);

    &::after {
      background-color: var(--tab-indicator);
    }
  }

  // FOCUS
  &:focus-visible {
    outline: none;

    span {
      background-color: var(--tab-focus-bg);
    }
  }

  // HOVER
  @media (hover: hover) {
    &:hover {
      span {
        background-color: var(--tab-hover-bg);
      }
    }
  }

  // TONE
  @each $tone, $value in $tab-tones {
    &.tone-#{$tone} {
      --tab-indicator: #{color(theme, $value, dark, 9)};
    }
  }
}
</style>
