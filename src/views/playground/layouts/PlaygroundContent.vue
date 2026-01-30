<template>
  <div class="playground__content">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.playground__content {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  row-gap: space(16);
}
</style>
