<template>
  <section class="base__card">
    <slot></slot>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    padded?: boolean
  }>(),
  {
    padded: true,
  },
)
</script>

<style scoped lang="scss">
.base__card {
  background-color: color(bg, page);

  border-radius: border-radius(md);

  box-shadow: box-shadow(3);
  padding: space(4);

  display: block;
}
</style>
