<template>
  <footer
    class="table-pagination"
    :class="{
      'is-tablet': isTablet,
      'is-mobile': isMobile,
    }"
    aria-label="Table pagination"
  >
    <BlockText class="table-pagination__summary">
      Showing {{ rangeStart }} to {{ rangeEnd }} of {{ itemCount }} users
    </BlockText>

    <div class="table-pagination__controls">
      <div class="table-pagination__take">
        <FormLabel :for="selectId">
          <BlockText no-wrap>Rows per page</BlockText>
        </FormLabel>

        <SelectInput
          :id="selectId"
          class="table-pagination__select"
          :name="selectId"
          :value="take"
          :options="takeOptions"
          :disabled="loading"
          :get-label="String"
          :get-key="(option: number) => option"
          @update="changeTake"
        />
      </div>

      <nav class="table-pagination__pages" aria-label="Pagination pages">
        <IconButton
          class="table-pagination__button"
          variant="surface"
          tone="neutral"
          :icon="ChevronLeft"
          :disabled="loading || !hasPreviousPage"
          aria-label="Previous page"
          @click="emit('page', page - 1)"
        />

        <template v-for="item in pageItems" :key="item.key">
          <span v-if="item.page === null" class="table-pagination__ellipsis" aria-hidden="true">
            …
          </span>

          <BaseButton
            v-else
            class="table-pagination__button"
            :variant="item.page === page ? 'outline' : 'surface'"
            :tone="item.page === page ? 'primary' : 'neutral'"
            :disabled="loading"
            :aria-label="`Page ${item.page}`"
            :aria-current="item.page === page ? 'page' : undefined"
            @click="emit('page', item.page)"
          >
            {{ item.page }}
          </BaseButton>
        </template>

        <IconButton
          class="table-pagination__button"
          variant="surface"
          tone="neutral"
          :icon="ChevronRight"
          :disabled="loading || !hasNextPage"
          aria-label="Next page"
          @click="emit('page', page + 1)"
        />
      </nav>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

import BaseButton from '@/library/components/buttons/BaseButton.vue'
import IconButton from '@/library/components/buttons/IconButton.vue'
import SelectInput from '@/library/components/inputs/SelectInput.vue'
import BlockText from '@/library/components/text/BlockText.vue'

import { useViewport } from '@/shared/hooks/useViewport'
import FormLabel from '../text/FormLabel.vue'

type PageItem = { key: string; page: number | null }

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
    takeOptions: () => [25, 50, 100],
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

const pageItems = computed<PageItem[]>(() => {
  const count = safePageCount.value

  if (count <= 7) return Array.from({ length: count }, (_, index) => pageItem(index + 1))

  const visible =
    props.page <= 3
      ? [1, 2, 3, count]
      : props.page >= count - 2
        ? [1, count - 2, count - 1, count]
        : [1, props.page - 1, props.page, props.page + 1, count]

  return visible.flatMap((page, index) => {
    const previous = visible[index - 1]
    const separator =
      previous && page - previous > 1 ? [{ key: `ellipsis-${page}`, page: null }] : []

    return [...separator, pageItem(page)]
  })
})

function pageItem(page: number): PageItem {
  return { key: `page-${page}`, page }
}

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
}

.table-pagination__page {
  white-space: nowrap;
}

.table-pagination__ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: space(6);

  color: color(text, tertiary);
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
  justify-content: flex-start;
  width: 100%;
}
</style>
