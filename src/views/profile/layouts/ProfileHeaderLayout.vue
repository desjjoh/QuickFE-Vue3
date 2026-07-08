<template>
  <div
    class="profile-header-layout"
    :class="{
      'is-mobile': isMobile,
      'is-tablet': isTablet,
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

    <div v-if="hasValue || hasEnd" class="profile-header-layout__meta">
      <div v-if="hasValue" class="profile-header-layout__details">
        <slot name="value"></slot>
      </div>

      <div v-if="hasEnd" class="profile-header-layout__actions">
        <slot name="end"></slot>
      </div>
    </div>
  </div>
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
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
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

.profile-header-layout__meta {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: center;
  gap: space(4);

  min-width: 0;
}

.profile-header-layout.has-actions .profile-header-layout__meta {
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

.profile-header-layout.has-actions:not(.has-details) .profile-header-layout__meta {
  grid-template-columns: minmax(0, 1fr) max-content;
}

.profile-header-layout__actions :deep(button),
.profile-header-layout__actions :deep(a) {
  white-space: nowrap;
}

/* Tablet layout:
   Row 1: avatar + content
   Row 2: details left, actions top-right
*/
.profile-header-layout.is-tablet.has-details,
.profile-header-layout.is-tablet.has-actions {
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  row-gap: space(6);
}

.profile-header-layout.is-tablet .profile-header-layout__summary {
  width: 100%;
}

.profile-header-layout.is-tablet .profile-header-layout__meta {
  width: 100%;
  min-width: 0;
}

.profile-header-layout.is-tablet.has-details .profile-header-layout__meta {
  grid-template-columns: minmax(0, 1fr);
}

.profile-header-layout.is-tablet.has-actions .profile-header-layout__meta {
  grid-template-columns: minmax(0, 1fr) max-content;
  align-items: start;
  column-gap: space(4);
}

.profile-header-layout.is-tablet .profile-header-layout__details {
  grid-column: 1;
  grid-row: 1;

  align-self: center;
  justify-content: flex-start;
}

.profile-header-layout.is-tablet .profile-header-layout__actions {
  grid-column: 2;
  grid-row: 1;

  align-self: end;
  align-items: flex-start;
  justify-content: flex-end;
}

.profile-header-layout.is-tablet.has-details:not(.has-actions) .profile-header-layout__details {
  grid-column: 1 / -1;
}

.profile-header-layout.is-tablet.has-actions:not(.has-details) .profile-header-layout__actions {
  grid-column: 2;
}

/* Mobile layout:
   Row 1: avatar + content
   Row 2: details
   Row 3: stacked actions
*/
.profile-header-layout.is-mobile,
.profile-header-layout.is-mobile.has-details,
.profile-header-layout.is-mobile.has-actions {
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  column-gap: space(4);
  row-gap: space(6);
}

.profile-header-layout.is-mobile .profile-header-layout__summary,
.profile-header-layout.is-mobile .profile-header-layout__meta {
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
