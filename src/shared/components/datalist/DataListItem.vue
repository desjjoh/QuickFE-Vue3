<template>
  <div
    class="data-list-item"
    :class="{
      'is-empty': isEmpty,
      'is-mobile': isMobile,
    }"
  >
    <dt class="data-list-item__label">
      <BlockText element="h6" :size="type">
        <slot name="label">
          {{ label }}
        </slot>
      </BlockText>
    </dt>

    <dd class="data-list-item__value">
      <slot>
        <BlockText v-if="isEmpty" size="sm" tone="muted">
          {{ emptyLabel }}
        </BlockText>

        <BlockText v-else :size="type" truncate> {{ value }} </BlockText>
      </slot>
    </dd>
  </div>
</template>

<script setup lang="ts">
import BlockText from '@/shared/components/text/BlockText.vue'
import { useViewport } from '@/shared/hooks/useViewport'
import { computed, type ComputedRef } from 'vue'
import type { Size } from '@/library/types/components/text.ts'

type DataListValue = string | number | null | undefined

const { isMobile } = useViewport()

const props = withDefaults(
  defineProps<{
    label?: string
    value?: DataListValue
    emptyLabel?: string
    small?: boolean
  }>(),
  {
    label: '',
    value: undefined,
    emptyLabel: '—',
    small: false,
  },
)

const type: ComputedRef<Size | undefined> = computed<Size | undefined>(() => {
  return props.small ? 'sm' : undefined
})

const isEmpty: ComputedRef<boolean> = computed<boolean>(() => {
  return props.value === null || props.value === undefined || props.value === ''
})
</script>

<style scoped lang="scss">
.data-list-item {
  display: grid;
  grid-template-columns: minmax(12rem, auto) minmax(0, 1fr);
  align-items: center;
  gap: space(4);

  min-width: 0;
  padding: var(--data-list-row-padding);

  &:not(:first-child) {
    border-top: 0.1rem solid color(border, subtle);
  }
}

.data-list-item.is-mobile {
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  gap: space(1);
}

.data-list-item__label {
  min-width: 0;
  color: color(text, secondary);
  font-weight: 500;
}

.data-list-item__value {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: space(2);

  min-width: 0;
  margin: 0;

  text-align: end;
}

.data-list-item.is-mobile .data-list-item__value {
  justify-content: flex-start;
  text-align: start;
}

.data-list-item__value :deep(*) {
  min-width: 0;
}
</style>
