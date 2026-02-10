<template>
  <div
    class="grid__cell"
    :style="{
      gridColumn: `span ${columnSpan}`,
      gridRow: `span ${rowSpan}`,
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
type Props = { span?: number; rowSpan?: number; alignSelf?: Align; justifySelf?: Align }

const props = withDefaults(defineProps<Props>(), {
  span: 1,
  rowSpan: 1,
  alignSelf: 'auto',
  justifySelf: 'auto',
})

const columnSpan = computed(() => Math.max(1, Math.floor(props.span)))
const rowSpan = computed(() => Math.max(1, Math.floor(props.rowSpan)))
</script>

<style scoped lang="scss">
.grid__cell {
  display: grid;
}
</style>
