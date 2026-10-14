<template>
  <footer
    class="table-pagination"
    :class="{
      'is-tablet': isTablet,
      'is-mobile': isMobile,
    }"
    :aria-label="$t('library.table.pagination.label')"
  >
    <BlockText class="table-pagination__summary" size="sm">
      {{
        $t('library.table.pagination.summary', {
          start: rangeStart,
          end: rangeEnd,
          count: itemCount,
        })
      }}
    </BlockText>

    <div class="table-pagination__controls">
      <div class="table-pagination__take">
        <FormLabel :for="selectId">
          <BlockText no-wrap>{{ $t('library.table.pagination.rowsPerPage') }}</BlockText>
        </FormLabel>

        <SelectInput
          :id="selectId"
          class="table-pagination__select"
          :name="selectId"
          :value="take"
          :options="takeOptions"
          :get-label="String"
          :get-key="(option: number) => option"
          @update="changeTake"
        />
      </div>

      <nav class="table-pagination__pages" :aria-label="$t('library.table.pagination.pages')">
        <IconButton
          class="table-pagination__button"
          variant="surface"
          tone="neutral"
          :icon="ChevronsLeft"
          :disabled="page <= 1"
          :aria-label="$t('library.table.pagination.first')"
          @click="emit('page', 1)"
        />

        <BaseButton
          v-for="item in pageItems"
          :key="item"
          class="table-pagination__button"
          variant="surface"
          tone="neutral"
          :disabled="item === page"
          :aria-label="$t('library.table.pagination.page', { page: item })"
          :aria-current="item === page ? 'page' : undefined"
          @click="emit('page', item)"
        >
          {{ item }}
        </BaseButton>

        <IconButton
          class="table-pagination__button"
          variant="surface"
          tone="neutral"
          :icon="ChevronsRight"
          :disabled="page >= safePageCount"
          :aria-label="$t('library.table.pagination.last')"
          @click="emit('page', safePageCount)"
        />
      </nav>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import { ChevronsLeft, ChevronsRight } from '@lucide/vue'

import BaseButton from '@/library/components/buttons/BaseButton.vue'
import IconButton from '@/library/components/buttons/IconButton.vue'
import SelectInput from '@/library/components/inputs/SelectInput.vue'
import BlockText from '@/library/components/text/BlockText.vue'

import { useViewport } from '@/shared/hooks/useViewport'
import FormLabel from '../text/FormLabel.vue'

const props = withDefaults(
  defineProps<{
    page: number
    take: number
    itemCount: number
    pageCount: number
    hasPreviousPage: boolean
    hasNextPage: boolean
    loading?: boolean
    takeOptions?: number[]
  }>(),
  {
    loading: false,
    takeOptions: () => [10, 25, 50],
  },
)

const { isMobile, isDesktop } = useViewport()

const emit = defineEmits<{
  page: [page: number]
  take: [take: number]
}>()

const selectId = `table-page-size-${useId()}`
const safePageCount = computed(() => Math.max(props.pageCount, 1))
const rangeStart = computed(() => (props.itemCount ? (props.page - 1) * props.take + 1 : 0))
const rangeEnd = computed(() => Math.min(props.page * props.take, props.itemCount))

const isTablet = computed<boolean>(() => {
  return !isMobile.value && !isDesktop.value
})

const pageItems = computed<number[]>(() => {
  const count = safePageCount.value
  const length = Math.min(3, count)
  const start = Math.max(1, Math.min(props.page - 1, count - length + 1))
  return Array.from({ length }, (_, index) => start + index)
})

function changeTake(value: number | undefined): void {
  if (value !== undefined) emit('take', value)
}
</script>

<style scoped lang="scss">
.table-pagination {
  display: grid;
  grid-template-columns: minmax(0, 1fr) max-content;
  align-items: center;
  gap: space(4);

  min-width: 0;
}

.table-pagination__summary {
  min-width: 0;
}

.table-pagination__controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: space(4);

  min-width: 0;
}

.table-pagination__take {
  display: flex;
  align-items: center;
  gap: space(3);

  min-width: 0;
}

.table-pagination__select {
  width: space(24);
  min-width: space(20);
  max-width: space(24);
}

.table-pagination__pages {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: space(2);

  min-width: 0;
  flex-wrap: wrap;
}

.table-pagination__page {
  white-space: nowrap;
}

.table-pagination.is-tablet {
  grid-template-columns: minmax(0, 1fr);
  justify-items: end;
  gap: space(3);
}

.table-pagination.is-tablet .table-pagination__summary {
  text-align: end;
}

.table-pagination.is-tablet .table-pagination__controls {
  width: 100%;
}

.table-pagination.is-mobile {
  grid-template-columns: minmax(0, 1fr);
  justify-items: stretch;
  gap: space(4);
}

.table-pagination.is-mobile .table-pagination__summary {
  text-align: start;
}

.table-pagination.is-mobile .table-pagination__controls {
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  gap: space(3);

  width: 100%;
}

.table-pagination.is-mobile .table-pagination__take {
  flex-direction: column;
  align-items: stretch;
  gap: space(2);

  width: 100%;
}

.table-pagination.is-mobile .table-pagination__select {
  width: 100%;
  max-width: 100%;
}

.table-pagination.is-mobile .table-pagination__pages {
  justify-content: center;
  width: 100%;
}
</style>
