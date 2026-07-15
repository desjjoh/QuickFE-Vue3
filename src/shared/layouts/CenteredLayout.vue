<template>
  <div class="centered-layout">
    <stacked-layout>
      <slot></slot>
    </stacked-layout>
  </div>
</template>

<script setup lang="ts">
import StackedLayout from './StackedLayout.vue'
</script>

<style scoped lang="scss">
.centered-layout {
  width: 100%;
  max-width: 1400px;
  height: 100%;

  flex: 1;
  margin: 0 auto;
}
</style>
