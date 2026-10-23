<template>
  <section
    class="data-table"
    :class="{ 'has-selection': selectable, 'is-mobile': isMobile }"
    :aria-busy="loading ? 'true' : 'false'"
  >
    <FlexBox
      v-if="selectable && $slots.selected"
      align-items="center"
      :gap="4"
      class="data-table__selected"
    >
      <BlockText>{{ $t('library.table.selected', { count: selectedRows.length }) }}</BlockText>

      <slot name="selected" :selected="selectedRows" />
    </FlexBox>

    <div ref="scrollViewport" class="data-table__viewport">
      <div ref="scrollContainer" class="data-table__scroll" @scroll.passive="updateScrollShadows">
        <div class="data-table__edges" aria-hidden="true"></div>
        <table ref="tableContent">
          <thead>
            <tr>
              <th v-if="selectable" class="data-table__selection-cell" scope="col">
                <CheckBox
                  name="select-all-table-rows"
                  :label="t('library.table.selectAll')"
                  :value="allRowsSelected"
                  :disabled="loading || !rows.length"
                  @update="toggleAll"
                />
              </th>
              <th
                v-for="(header, key, index) in headers"
                :key="key"
                scope="col"
                class="data-table__content-column"
                :class="index === 0 && 'data-table__primary-column'"
                :aria-sort="getAriaSort(header)"
              >
                <div class="data-table__header">
                  <button
                    v-if="header.sort"
                    type="button"
                    class="data-table__sort"
                    @click="emit('sort', header.sort)"
                  >
                    {{ header.label }}
                  </button>

                  <BlockText v-else-if="header.label" no-wrap>{{ header.label }}</BlockText>

                  <template v-if="header.sort">
                    <ArrowDown
                      v-if="isActiveSort(header) && sortOrder === 'DESC'"
                      class="data-table__sort-icon is-descending"
                      :stroke-width="2.5"
                      aria-hidden="true"
                    />

                    <ArrowUp
                      v-else-if="isActiveSort(header)"
                      class="data-table__sort-icon is-ascending"
                      :stroke-width="2.5"
                      aria-hidden="true"
                    />

                    <ChevronsUpDown
                      v-else
                      class="data-table__sort-icon"
                      :stroke-width="2.5"
                      aria-hidden="true"
                    />
                  </template>
                </div>
              </th>
            </tr>
          </thead>

          <tbody v-if="rows.length">
            <tr v-for="(row, rowIndex) in rows" :key="String(getRowKey(row))">
              <td v-if="selectable" class="data-table__selection-cell">
                <CheckBox
                  :name="`table-row-${String(getRowKey(row))}`"
                  :label="t('library.table.selectRow', { row: rowIndex + 1 })"
                  :value="isSelected(row)"
                  :disabled="loading"
                  @update="toggleRow(row)"
                />
              </td>
              <td
                v-for="(_, key, index) in headers"
                :key="key"
                class="data-table__content-column"
                :class="index === 0 && 'data-table__primary-column'"
              >
                <slot :name="key" :row="row" :selected="isSelected(row)" />
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr>
              <td :colspan="headerCount + Number(selectable)" class="data-table__empty">
                <slot name="empty">{{ resolvedEmptyLabel }}</slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts" generic="T extends object">
import { ArrowDown, ArrowUp, ChevronsUpDown } from '@lucide/vue'
import { computed, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useViewport } from '@/shared/hooks/useViewport'

import CheckBox from '@/library/components/inputs/CheckBox.vue'
import FlexBox from '../flex/FlexBox.vue'
import BlockText from '../text/BlockText.vue'

export type DataTableHeader = {
  label?: string
  sort?: string
}

export type DataTableHeaders = Record<string, DataTableHeader>

const props = withDefaults(
  defineProps<{
    headers: DataTableHeaders
    rows: T[]
    rowKey?: keyof T
    selectable?: boolean
    loading?: boolean
    emptyLabel?: string
    loadingLabel?: string
    activeSort?: string
    sortOrder?: 'ASC' | 'DESC'
  }>(),
  {
    rowKey: 'id' as keyof T,
    selectable: false,
    loading: false,
    emptyLabel: 'No results found.',
    loadingLabel: 'Loading…',
  },
)

const { t } = useI18n()
const { isMobile } = useViewport()
const selectedRows = shallowRef<T[]>([])
const scrollContainer = useTemplateRef<HTMLDivElement>('scrollContainer')
const scrollViewport = useTemplateRef<HTMLDivElement>('scrollViewport')
const tableContent = useTemplateRef<HTMLTableElement>('tableContent')
let resizeObserver: ResizeObserver | null = null
let maximumScroll = 0
let shadowFrame: number | null = null
let previousLeft = -1
let previousRight = -1
let previousHeight = -1
let primaryWidth = 0
let selectionWidth = 0
let previousShadowStart = -1

function updateScrollShadows(): void {
  if (shadowFrame !== null) return
  shadowFrame = requestAnimationFrame(renderScrollShadows)
}

function measureScrollRange(): void {
  const container = scrollContainer.value

  if (!container) return
  maximumScroll = Math.max(0, container.scrollWidth - container.clientWidth)
  primaryWidth =
    tableContent.value?.querySelector<HTMLElement>('.data-table__primary-column')?.offsetWidth ?? 0
  selectionWidth =
    tableContent.value?.querySelector<HTMLElement>('.data-table__selection-cell')?.offsetWidth ?? 0
  const height = tableContent.value?.offsetHeight ?? 0

  if (height !== previousHeight) {
    scrollViewport.value?.style.setProperty('--scroll-shadow-height', `${height}px`)
    previousHeight = height
  }

  updateScrollShadows()
}

function renderScrollShadows(): void {
  shadowFrame = null
  const container = scrollContainer.value
  const viewport = scrollViewport.value

  if (!container || !viewport) return
  const position = Math.min(maximumScroll, Math.max(0, container.scrollLeft))
  const shadowStart = primaryWidth + Math.max(0, selectionWidth - position)

  if (shadowStart !== previousShadowStart) {
    viewport.style.setProperty('--scroll-shadow-start', `${shadowStart}px`)
    previousShadowStart = shadowStart
  }

  // Fade near each edge, reaching full strength with 160px still hidden.
  const left = Math.min(1, position / 160)
  const right = Math.min(1, (maximumScroll - position) / 160)

  if (left !== previousLeft) {
    viewport.style.setProperty('--scroll-shadow-left', String(left))
    previousLeft = left
  }

  if (right !== previousRight) {
    viewport.style.setProperty('--scroll-shadow-right', String(right))
    previousRight = right
  }
}

onMounted(() => {
  measureScrollRange()
  resizeObserver = new ResizeObserver(measureScrollRange)
  if (scrollContainer.value) resizeObserver.observe(scrollContainer.value)
  if (tableContent.value) resizeObserver.observe(tableContent.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  if (shadowFrame !== null) cancelAnimationFrame(shadowFrame)
})
const headerCount = computed(() => Object.keys(props.headers).length)
const resolvedEmptyLabel = computed(() => {
  if (props.loading) return props.loadingLabel ?? t('library.table.loading')

  return props.emptyLabel ?? t('library.table.empty')
})

function isActiveSort(header: DataTableHeader): boolean {
  if (!header.sort || !props.activeSort) return false

  return header.sort === props.activeSort
}

function getAriaSort(header: DataTableHeader): 'ascending' | 'descending' | 'none' | undefined {
  if (!header.sort) return undefined
  if (!isActiveSort(header)) return 'none'

  return props.sortOrder === 'DESC' ? 'descending' : 'ascending'
}

const emit = defineEmits<{
  sort: [sort: string]
}>()

function getRowKey(row: T): unknown {
  return row[props.rowKey as keyof T]
}

function isSelected(row: T): boolean {
  return selectedRows.value.some((selected) => getRowKey(selected) === getRowKey(row))
}

const allRowsSelected = computed(
  () => props.rows.length > 0 && props.rows.every((row) => isSelected(row)),
)

function toggleRow(row: T): void {
  selectedRows.value = isSelected(row)
    ? selectedRows.value.filter((selected) => getRowKey(selected) !== getRowKey(row))
    : [...selectedRows.value, row]
}

function toggleAll(checked: boolean | undefined): void {
  selectedRows.value = checked ? [...props.rows] : []
}

watch(
  () => props.rows,
  (rows) => {
    const visibleKeys = new Set(rows.map((row) => getRowKey(row)))

    selectedRows.value = selectedRows.value.filter((row) => visibleKeys.has(getRowKey(row)))
  },
)

watch(
  () => props.selectable,
  (selectable) => {
    if (!selectable) selectedRows.value = []
  },
)
</script>

<style scoped lang="scss">
.data-table {
  overflow: hidden;
}

.data-table__selected {
  padding: space(3);
  border-bottom: 0.1rem solid color(theme, neutral, theme-alpha, 6);
}

.data-table__scroll {
  overflow-x: auto;
}

.data-table__viewport {
  position: relative;
}

.data-table__edges {
  position: sticky;
  left: 0;
  width: 100%;
  height: 0;
  z-index: 3;
  pointer-events: none;

  &::before,
  &::after {
    content: '';
    position: absolute;
    inset-block-start: 0;
    height: var(--scroll-shadow-height, 0px);
    width: space(4);
    z-index: 1;
    pointer-events: none;
  }

  &::before {
    left: var(--scroll-shadow-start, 0px);
    background: linear-gradient(to right, color(shadow, soft), transparent);

    opacity: var(--scroll-shadow-left, 0);
  }

  &::after {
    right: 0;
    background: linear-gradient(to left, color(shadow, soft), transparent);

    opacity: var(--scroll-shadow-right, 0);
  }
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

thead {
  background-color: color(bg, surface);
}

.data-table__loading-row th {
  height: space(1);
  padding: 0;
  border: 0;
}

.data-table__loading-row :deep(.progress-loader__track) {
  border-radius: 0;
}

:deep(th),
:deep(td) {
  padding: space(3) space(5);
  border-bottom: 0.1rem solid color(theme, neutral, theme-alpha, 6);
  text-align: start;
  white-space: nowrap;
}

:deep(tbody tr:last-child td) {
  border-bottom: 0;
}

:deep(th) {
  color: color(text, secondary);
  font-weight: font-weight(medium);
}

.data-table__content-column {
  width: 1%;
  text-align: end;
}

.data-table__primary-column {
  position: sticky;
  inset-inline-start: 0;
  z-index: 2;
  width: 100%;
  text-align: start;
  background-color: var(--card-bg, #{color(bg, page)});
}

thead .data-table__primary-column {
  background-color: color(bg, surface);
}

.data-table.is-mobile {
  .data-table__primary-column {
    position: static;
    z-index: auto;
  }

  .data-table__edges::before {
    left: 0;
  }
}

.data-table__selection-cell {
  width: space(10);
  text-align: center;
}

.data-table__empty {
  padding-block: space(8);
  color: color(text, secondary);
  text-align: center;
}

.data-table__header {
  display: inline-flex;
  align-items: center;
  gap: space(2);

  :deep(svg) {
    color: color(text, primary);
    width: 1em;
    height: 1em;
  }
}

.data-table__content-column:not(.data-table__primary-column) .data-table__header {
  justify-content: flex-end;
}

.data-table__sort {
  padding: 0;
  color: color(text, primary);
  background: none;
  border: 0;
  font: inherit;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 0.2em;
}

.data-table__sort:hover,
.data-table__sort:focus-visible {
  color: color(text, primary);
  text-decoration-color: currentColor;
}

.data-table__sort:focus-visible {
  outline: none;
}

.data-table__sort-icon {
  flex: 0 0 auto;
  color: color(text, tertiary);
}

.data-table__sort-icon.is-ascending {
  color: color(theme, success, theme, 10);
}

.data-table__sort-icon.is-descending {
  color: color(theme, danger, theme, 10);
}
</style>
