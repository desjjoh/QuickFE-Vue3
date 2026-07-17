<template>
  <dl class="data-list" :class="[`density-${density}`]">
    <slot></slot>
  </dl>
</template>

<script setup lang="ts">
type DataListDensity = 'comfortable' | 'compact'

withDefaults(
  defineProps<{
    density?: DataListDensity
  }>(),
  {
    density: 'comfortable',
  },
)
</script>

<style scoped lang="scss">
.data-list {
  display: grid;
  margin: 0;
  padding: 0;

  border-top: 0.2rem solid color(theme, primary, theme-alpha, 10);
}

.data-list.density-comfortable {
  --data-list-row-padding: #{space(3)} 0;
}

.data-list.density-compact {
  --data-list-row-padding: #{space(2)} 0;
}
</style>
