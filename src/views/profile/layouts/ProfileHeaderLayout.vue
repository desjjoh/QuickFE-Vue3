<template>
  <div
    class="profile-header-layout"
    :class="{
      'is-mobile': isMobile,
      'has-avatar': showStart,
      'has-details': hasValue,
      'has-actions': hasEnd,
    }"
  >
    <div class="profile-header-layout__summary">
      <div v-if="showStart" class="profile-header-layout__avatar">
        <slot name="start"></slot>
      </div>

      <div class="profile-header-layout__content">
        <slot></slot>
      </div>
    </div>

    <div v-if="hasEnd" class="profile-header-layout__actions">
      <slot name="end"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots, type ComputedRef } from 'vue'

import { useViewport } from '@/shared/hooks/useViewport'

const slots = useSlots()
const { isMobile } = useViewport()

const hasStart: ComputedRef<boolean> = computed<boolean>(() => !!slots.start)
const hasValue: ComputedRef<boolean> = computed<boolean>(() => !!slots.value)
const hasEnd: ComputedRef<boolean> = computed<boolean>(() => !!slots.end)

const showStart: ComputedRef<boolean> = computed<boolean>(() => {
  return hasStart.value && !isMobile.value
})
</script>

<style scoped lang="scss">
.profile-header-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: stretch;
  gap: space(4);

  width: 100%;
  min-width: 0;
  padding: var(--card-padding);
}

.profile-header-layout.has-details,
.profile-header-layout.has-actions {
  grid-template-columns: minmax(0, 1fr) minmax(0, auto);
}

.profile-header-layout__summary {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: space(4);

  min-width: 0;
}

.profile-header-layout:not(.has-avatar) .profile-header-layout__summary {
  grid-template-columns: minmax(0, 1fr);
}

.profile-header-layout.has-actions {
  grid-template-columns: minmax(0, 1fr) max-content;
}

.profile-header-layout__avatar {
  display: flex;
  align-items: center;
  justify-content: center;

  min-width: 0;
}

.profile-header-layout__content {
  display: grid;
  gap: space(1);

  max-width: space(115);
  min-width: 0;
}

.profile-header-layout__details {
  grid-column: 1;

  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: space(3);

  width: 100%;
  min-width: 0;
  max-width: 100%;

  overflow-wrap: anywhere;
}

.profile-header-layout__details :deep(*) {
  min-width: 0;
}

.profile-header-layout__actions {
  grid-column: 2;
  align-self: start;

  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: space(3);

  width: max-content;
  min-width: 0;
  max-width: 100%;
}

.profile-header-layout:not(.has-details) .profile-header-layout__actions {
  grid-column: 2;
}

.profile-header-layout.has-actions:not(.has-details) {
  grid-template-columns: minmax(0, 1fr) max-content;
}

.profile-header-layout__actions :deep(button),
.profile-header-layout__actions :deep(a) {
  white-space: nowrap;
}

.profile-header-layout.is-mobile,
.profile-header-layout.is-mobile.has-details,
.profile-header-layout.is-mobile.has-actions {
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  column-gap: space(4);
  row-gap: space(6);
}

.profile-header-layout.is-mobile .profile-header-layout__summary {
  display: contents;
}

.profile-header-layout.is-mobile .profile-header-layout__avatar {
  grid-column: 1;
  grid-row: 1;

  align-self: center;
}

.profile-header-layout.is-mobile .profile-header-layout__content {
  grid-column: 2;
  grid-row: 1;

  align-self: center;
}

.profile-header-layout.is-mobile .profile-header-layout__details {
  grid-column: 1 / -1;
  grid-row: 2;

  width: 100%;
  justify-content: flex-start;
}

.profile-header-layout.is-mobile .profile-header-layout__actions {
  grid-column: 1 / -1;
  grid-row: 3;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  gap: space(3);

  width: 100%;
}

.profile-header-layout.is-mobile:not(.has-details) .profile-header-layout__actions {
  grid-row: 2;
}

.profile-header-layout.is-mobile:not(.has-avatar) .profile-header-layout__content {
  grid-column: 1 / -1;
}

.profile-header-layout.is-mobile .profile-header-layout__actions :deep(button),
.profile-header-layout.is-mobile .profile-header-layout__actions :deep(a) {
  width: 100%;
  justify-content: center;
  white-space: normal;
}
</style>
