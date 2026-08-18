<template>
  <section class="data-table" :class="[loading && 'is-loading', selectable && 'has-selection']">
    <FlexBox
      v-if="selectable && $slots.selected"
      align-items="center"
      :gap="4"
      class="data-table__selected"
    >
      <span>{{ selectedRows.length }} selected</span>

      <slot name="selected" :selected="selectedRows" />
    </FlexBox>

    <div class="data-table__scroll">
      <table>
        <thead>
          <tr>
            <th v-if="selectable" class="data-table__selection-cell" scope="col">
              <CheckBox
                name="select-all-table-rows"
                :value="allRowsSelected"
                :disabled="loading || !rows.length"
                @update="toggleAll"
              />
            </th>
            <th
              v-for="(header, key, index) in headers"
              :key="key"
              scope="col"
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

                <span v-else>{{ header.label }}</span>

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
          <tr v-for="row in rows" :key="String(getRowKey(row))">
            <td v-if="selectable" class="data-table__selection-cell">
              <CheckBox
                :name="`table-row-${String(getRowKey(row))}`"
                :value="isSelected(row)"
                :disabled="loading"
                @update="toggleRow(row)"
              />
            </td>
            <td v-for="(_, key) in headers" :key="key">
              <slot :name="key" :row="row" :selected="isSelected(row)" />
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td :colspan="headerCount + Number(selectable)" class="data-table__empty">
              <slot name="empty">{{ loading ? loadingLabel : emptyLabel }}</slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts" generic="T extends object">
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-vue-next'
import { computed, shallowRef, watch } from 'vue'

import CheckBox from '@/library/components/inputs/CheckBox.vue'
import FlexBox from '../flex/FlexBox.vue'

export type DataTableHeader = {
  label: string
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

const selectedRows = shallowRef<T[]>([])
const headerCount = computed(() => Object.keys(props.headers).length)

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

.data-table.is-loading {
  opacity: 0.7;
}

.data-table__selected {
  padding: space(3);
  border-bottom: 0.1rem solid color(theme, neutral, theme-alpha, 6);
}

.data-table__scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: color(bg, surface);
}

:deep(th),
:deep(td) {
  padding: space(3);
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

:deep(td) {
  color: color(text, primary);
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

thead th:last-child .data-table__header {
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
