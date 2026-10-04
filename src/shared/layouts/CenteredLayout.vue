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
  display: flex;
  flex-direction: column;

  width: 100%;
  max-width: 1400px;
  min-height: 100%;

  margin-inline: auto;
}

.surface__layout {
  background-color: color(bg, page);
  box-shadow: box-shadow(2);
}
</style>
