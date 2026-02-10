<template>
  <RouterLink :to="{ name: to }" class="tab" activeClass="active" role="tab">
    <span>
      <slot></slot>
    </span>
  </RouterLink>
</template>

<script setup lang="ts">
defineProps<{
  to: string
}>()
</script>

<style scoped lang="scss">
$tab-tones: (
  primary: primary,
  neutral: neutral,
);

.tab {
  position: relative;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  appearance: none;
  background: transparent;
  border: none;

  text-decoration: none;
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

@each $tone, $value in $tab-tones {
  .tone-#{$tone} {
    --tab-accent: #{color(theme, $value, dark, 9)};
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
