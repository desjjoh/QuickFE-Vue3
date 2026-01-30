<template>
  <div class="stacked__layout">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.stacked__layout {
  display: block;
  flex-grow: 1;

  padding: space(10);
}
</style>
