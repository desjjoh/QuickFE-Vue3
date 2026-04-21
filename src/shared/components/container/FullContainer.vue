<template>
  <div class="container">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.container {
  position: relative;
  height: 100%;
  display: grid;
  place-items: center;
  padding: space(5);
  flex-grow: 1;
}
</style>
