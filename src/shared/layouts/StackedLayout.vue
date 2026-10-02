<template>
  <div class="stacked-layout">
    <div class="stacked__content">
      <slot></slot>
    </div>

    <footer v-if="$slots.footer" class="stacked__footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.stacked-layout {
  display: flex;
  flex-direction: column;

  width: 100%;

  flex: 1 0 auto;
}

.stacked__content {
  padding: space(10);
  flex: 1 1 auto;

  display: flex;
  flex-direction: column;
}

.stacked__footer {
  padding: space(10);

  background-color: color(bg, page);
  flex-shrink: 0;
}
</style>
