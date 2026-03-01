<template>
  <label>
    <input :id="props.id" :name="props.name" type="checkbox" />
  </label>
</template>

<script setup lang="ts">
const props = defineProps<{ id: string; name: string }>()
</script>

<style scoped lang="scss">
input {
  background-color: palette(black, 5);
}
</style>
