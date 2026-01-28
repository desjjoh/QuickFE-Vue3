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

  height: 100%;

  padding-top: space(20);
  padding-inline: space(16);
  padding-bottom: space(16);

  width: 100%;
  min-width: fit-content;
}
</style>
