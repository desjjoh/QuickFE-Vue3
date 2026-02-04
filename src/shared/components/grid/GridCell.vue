<template>
  <div
    class="grid__cell"
    :style="{
      gridColumn: `span ${columnSpan}`,
      alignSelf,
      justifySelf,
    }"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Align = 'auto' | 'start' | 'center' | 'end' | 'stretch'

const props = withDefaults(
  defineProps<{ span?: number; alignSelf?: Align; justifySelf?: Align }>(),
  { span: 1, alignSelf: 'auto', justifySelf: 'auto' },
)

const columnSpan = computed(() => Math.max(1, Math.floor(props.span)))
</script>

<style scoped lang="scss">
.grid__cell {
  display: grid;
}
</style>
