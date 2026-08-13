<template>
  <div class="tabs__header" role="tablist">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
$tab-tones: (
  primary: primary,
  neutral: neutral,
);

.tabs__header {
  display: flex;
  gap: space(2);

  flex-wrap: wrap;
  box-shadow: inset 0 calc(-1 * 0.1rem) 0 color(border, soft);
}

/* shared tab styles */
.tabs__header :deep(.tab) {
  --tab-height: #{space(10)};
  --tab-padding-x: #{space(2)};
  --tab-inner-padding-x: #{space(2)};
  --tab-inner-padding-y: #{space(1)};
  --tab-radius: #{border-radius(sm)};

  --tab-fg: inherit;
  --tab-fg-active: #{color(text, primary)};
  --tab-hover-bg: #{color(theme, neutral, theme-alpha, 3)};
  --tab-focus-bg: #{color(theme, neutral, theme-alpha, 3)};
  --tab-indicator: #{color(theme, primary, theme, 9)};
  --tab-indicator-height: 2px;

  position: relative;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  height: var(--tab-height);
  padding-inline: var(--tab-padding-x);

  appearance: none;
  background: transparent;
  border: none;
  font: inherit;
  text-decoration: none;
  color: var(--tab-fg);
  line-height: #{ui-line-height(tight)};
  cursor: pointer;
}

.tabs__header :deep(.tab > span) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;

  padding: var(--tab-inner-padding-y) var(--tab-inner-padding-x);
  border-radius: var(--tab-radius);
}

.tabs__header :deep(.tab::after) {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;

  height: var(--tab-indicator-height);
  background-color: transparent;
  border-radius: 999px;
}

.tabs__header :deep(.tab.active) {
  color: var(--tab-fg-active);
}

.tabs__header :deep(.tab.active::after) {
  background-color: var(--tab-indicator);
}

.tabs__header :deep(.tab:focus-visible) {
  outline: none;
}

.tabs__header :deep(.tab:focus-visible > span) {
  background-color: var(--tab-focus-bg);
}

@media (hover: hover) {
  .tabs__header :deep(.tab:hover > span) {
    background-color: var(--tab-hover-bg);
  }
}

@each $tone, $value in $tab-tones {
  .tabs__header :deep(.tab.tone-#{$tone}) {
    --tab-indicator: #{color(theme, $value, theme, 9)};
  }
}
</style>
