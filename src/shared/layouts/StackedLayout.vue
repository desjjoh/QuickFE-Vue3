<template>
  <div class="stacked__layout">
    <div class="stacked__content">
      <slot></slot>
    </div>

    <footer v-if="$slots.footer" class="stacked__footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.stacked__layout {
  display: flex;
  flex-direction: column;

  flex-grow: 1;
  height: 100%;

  width: fit-content;
  min-width: 100%;
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
