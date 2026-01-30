<template>
  <div class="showcase__grid" :style="{ '--columns': columns }">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    columns?: number
  }>(),
  {
    columns: 2,
  },
)
</script>

<style scoped lang="scss">
.showcase__grid {
  display: grid;
  grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
  gap: space(8);

  width: space(228);
}

@media (max-width: 768px) {
  .showcase__grid {
    --columns: 1;
  }
}
</style>
