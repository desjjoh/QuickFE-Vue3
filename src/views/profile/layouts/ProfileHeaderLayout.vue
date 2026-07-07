<template>
  <li
    class="card-action-list-item"
    :class="{
      'is-mobile': isMobile,
      'is-tablet': isTablet,
      'has-start': showStart,
      'has-end': hasEnd,
    }"
  >
    <div class="card-action-list-item__main">
      <div v-if="showStart" class="card-action-list-item__start">
        <slot name="start"></slot>
      </div>

      <div class="card-action-list-item__content">
        <slot></slot>
      </div>
    </div>

    <div v-if="hasEnd" class="card-action-list-item__end">
      <slot name="end"></slot>
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed, useSlots, type ComputedRef } from 'vue'

import { useViewport } from '@/shared/hooks/useViewport'

const slots = useSlots()
const { isMobile, isTabletUp, isDesktop } = useViewport()

const isTablet: ComputedRef<boolean> = computed<boolean>(() => {
  return isTabletUp.value && !isDesktop.value
})

const hasStart: ComputedRef<boolean> = computed<boolean>(() => !!slots.start)
const hasEnd: ComputedRef<boolean> = computed<boolean>(() => !!slots.end)

const showStart: ComputedRef<boolean> = computed<boolean>(() => {
  return hasStart.value && !isMobile.value
})
</script>

<style scoped lang="scss">
.card-action-list-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: center;
  gap: space(4);

  width: 100%;
  min-width: 0;
}

.card-action-list-item.has-end {
  grid-template-columns: minmax(0, 1fr) max-content;
}

.card-action-list-item__main {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: space(4);

  min-width: 0;
}

.card-action-list-item:not(.has-start) .card-action-list-item__main {
  grid-template-columns: minmax(0, 1fr);
}

.card-action-list-item__start {
  display: flex;
  align-items: center;
  justify-content: center;

  min-width: 0;
}

.card-action-list-item__content {
  display: grid;
  gap: space(1);

  min-width: 0;
}

.card-action-list-item__end {
  align-self: start;

  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: space(3);

  width: max-content;
  min-width: 0;
  max-width: 100%;
}

.card-action-list-item__end :deep(button),
.card-action-list-item__end :deep(a) {
  white-space: nowrap;
}

/* Tablet layout:
   Row 1: start + content
   Row 2: actions aligned start
*/
.card-action-list-item.is-tablet.has-end {
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  row-gap: space(4);
}

.card-action-list-item.is-tablet .card-action-list-item__main {
  width: 100%;
}

.card-action-list-item.is-tablet .card-action-list-item__end {
  width: 100%;
  justify-content: flex-start;
}

/* Mobile layout:
   Row 1: start + content
   Row 2: stacked actions
*/
.card-action-list-item.is-mobile,
.card-action-list-item.is-mobile.has-end {
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  column-gap: space(4);
  row-gap: space(4);
}

.card-action-list-item.is-mobile .card-action-list-item__main {
  display: contents;
}

.card-action-list-item.is-mobile .card-action-list-item__start {
  grid-column: 1;
  grid-row: 1;

  align-self: center;
}

.card-action-list-item.is-mobile .card-action-list-item__content {
  grid-column: 2;
  grid-row: 1;

  align-self: center;
}

.card-action-list-item.is-mobile:not(.has-start) .card-action-list-item__content {
  grid-column: 1 / -1;
}

.card-action-list-item.is-mobile .card-action-list-item__end {
  grid-column: 1 / -1;
  grid-row: 2;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  gap: space(3);

  width: 100%;
}

.card-action-list-item.is-mobile .card-action-list-item__end :deep(button),
.card-action-list-item.is-mobile .card-action-list-item__end :deep(a) {
  width: 100%;
  justify-content: center;
  white-space: normal;
}
</style>
