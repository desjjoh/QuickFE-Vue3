<template>
  <div class="centered-layout">
    <stacked-layout :class="{ surface__layout: surface }">
      <slot></slot>
    </stacked-layout>
  </div>
</template>

<script setup lang="ts">
import StackedLayout from './StackedLayout.vue'

defineProps<{ surface?: boolean }>()
</script>

<style scoped lang="scss">
.centered-layout {
  width: 100%;
  max-width: 1400px;
  height: 100%;

  flex: 1;
  margin: 0 auto;
}

.surface__layout {
  background-color: color(bg, page);
  box-shadow: box-shadow(3);
}
</style>
