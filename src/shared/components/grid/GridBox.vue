<template>
  <div class="grid__box" :style="{ '--columns': columns, alignItems, justifyItems }">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
type GridAlignItems = 'start' | 'end' | 'center' | 'stretch'
type GridJustifyItems = 'start' | 'end' | 'center' | 'stretch'

type Props = { columns?: number; alignItems?: GridAlignItems; justifyItems?: GridJustifyItems }

withDefaults(defineProps<Props>(), {
  columns: 1,
  alignItems: 'stretch',
  justifyItems: 'stretch',
})
</script>

<style scoped lang="scss">
.grid__box {
  display: grid;
  grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
  gap: space(8);
}
</style>
