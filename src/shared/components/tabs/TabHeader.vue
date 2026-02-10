<template>
  <div class="tabs__header">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.tabs__header {
  display: flex;
  gap: space(2);

  box-shadow: inset 0 calc(-1 * 0.1rem) 0 color(border, soft);
}
</style>
