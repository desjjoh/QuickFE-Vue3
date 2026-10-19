<template>
  <div class="content-layout">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.content-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}

.content-layout > :deep(*) {
  padding: space(6) 0;
  border-bottom: 1px solid color(border, subtle);

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }
}
</style>
