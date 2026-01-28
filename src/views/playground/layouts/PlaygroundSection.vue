<template>
  <div class="playground__section">
    <div class="section__header">
      <slot name="header"> </slot>
    </div>
    <div class="section__body">
      <slot name="body"></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.playground__section {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  row-gap: space(4);

  & .section__header {
    display: block;
    color: color(text, primary);
  }

  & .section__body {
    display: flex;
    flex-direction: column;
    align-items: start;

    gap: space(6);
  }
}
</style>
