<template>
  <FlexBox class="dropdown__menu__viewport" direction="column" :padding="2" @mousedown.prevent>
    <slot></slot>
  </FlexBox>
</template>

<script setup lang="ts">
import FlexBox from '../flex/FlexBox.vue'
</script>

<style lang="scss" scoped>
$dropdown-menu-tones: (
  primary: primary,
  neutral: neutral,
  success: success,
  warning: warning,
  danger: danger,
  info: info,
);

.dropdown__menu__viewport {
  --menu-item-color: #{color(text, primary)};
  --menu-item-bg-hover: #{color(theme, primary, dark-alpha, 4)};
  --menu-item-bg-focus: #{color(theme, neutral, dark-alpha, 4)};

  width: max-content;
  max-width: space(72);

  &:deep(svg) {
    display: block;
    width: 1em;
    height: 1em;
  }

  &:deep(.menu-item) {
    // BASE
    text-decoration: none;

    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    gap: space(2);

    width: 100%;
    height: space(8);
    padding: space(2) space(3);

    appearance: none;
    border: 0;
    border-radius: border-radius(sm);
    background-color: transparent;

    font: inherit;
    color: var(--menu-item-color);

    cursor: pointer;

    & .button__content {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      flex: 1;
      gap: space(6);
    }

    &:focus,
    &:focus-visible {
      outline: none;
      background-color: var(--menu-item-bg-focus);
    }

    // STATE
    &.is-active {
      background-color: var(--menu-item-bg-hover);
      color: color(theme, primary, dark-alpha, 11);
    }

    &:disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    // TONE
    @each $tone, $palette in $dropdown-menu-tones {
      &.tone-#{$tone} {
        --menu-item-color: #{color(theme, #{$palette}, dark-alpha, 11)};
        --menu-item-bg-focus: #{color(theme, #{$palette}, dark-alpha, 4)};
      }
    }
  }
}
</style>
