<template>
  <FlexBox class="dropdown__menu__viewport" direction="column" :padding="2" @mousedown.prevent>
    <slot></slot>
  </FlexBox>
</template>

<script setup lang="ts">
import FlexBox from '../flex/FlexBox.vue'
</script>

<style lang="scss" scoped>
$button-tones: (
  primary: primary,
  neutral: neutral,
  success: success,
  warning: warning,
  danger: danger,
  info: info,
);

.dropdown__menu__viewport {
  width: max-content;

  max-width: space(72);

  &:deep(.menu-item) {
    text-decoration: none;

    display: inline-flex;
    align-items: center;
    justify-content: start;

    appearance: none;
    border: 0;
    background-color: inherit;

    font: inherit;
    color: color(text, primary);

    height: space(8);
    width: 100%;
    padding: space(2) space(3);

    border-radius: border-radius(sm);

    cursor: pointer;

    & .button__content {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      gap: space(6);
    }

    &:deep(svg) {
      width: 1em;
      height: 1em;
    }

    &:focus,
    &:focus-visible {
      outline: none;
      background: color(theme, neutral, dark-alpha, 4);
    }

    @each $tone, $palette in $button-tones {
      &.tone-#{$tone} {
        color: color(theme, #{$palette}, dark-alpha, 11);

        &:focus,
        &:focus-visible {
          background: color(theme, #{$palette}, dark-alpha, 4);
        }
      }
    }

    &:disabled {
      opacity: 0.5;
      pointer-events: none;
    }
  }
}
</style>
