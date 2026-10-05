<template>
  <div class="media-carousel">
    <div class="media-carousel__viewport">
      <Transition :name="transitionName" mode="out-in">
        <MediaGrid :key="currentPage">
          <template v-for="item in visibleItems" :key="itemKey(item)">
            <slot :item="item"></slot>
          </template>
        </MediaGrid>
      </Transition>
    </div>

    <div v-if="pageCount > 1" class="media-carousel__controls">
      <button
        type="button"
        class="media-carousel__navigation"
        :disabled="currentPage === 0"
        aria-label="Previous page"
        @click="previousPage"
      >
        <ChevronLeft :size="20" stroke-width="2.5" />
      </button>

      <div class="media-carousel__pagination">
        <button
          v-for="page in pageCount"
          :key="page"
          type="button"
          class="media-carousel__page"
          :class="{ 'is-active': currentPage === page - 1 }"
          :aria-label="`Show page ${page}`"
          :aria-current="currentPage === page - 1 ? 'page' : undefined"
          @click="goToPage(page - 1)"
        >
          <span class="media-carousel__page-indicator"></span>
        </button>
      </div>

      <button
        type="button"
        class="media-carousel__navigation"
        :disabled="currentPage === pageCount - 1"
        aria-label="Next page"
        @click="nextPage"
      >
        <ChevronRight :size="20" stroke-width="2.5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

import { useViewport } from '@/shared/hooks/useViewport'

import MediaGrid from '../grid/MediaGrid.vue'

type ItemKey = string | number

const props = defineProps<{
  items: T[]
  itemKey: (item: T) => ItemKey
}>()

const { isMobile, isTablet } = useViewport()

const currentPage = ref<number>(0)
const direction = ref<'next' | 'previous'>('next')

const visibleCount = computed<number>(() => {
  if (isMobile.value) return 1
  if (isTablet.value) return 2

  return 4
})

const pageCount = computed<number>(() => {
  return Math.ceil(props.items.length / visibleCount.value)
})

const visibleItems = computed<T[]>(() => {
  const start = currentPage.value * visibleCount.value
  const end = start + visibleCount.value

  return props.items.slice(start, end)
})

const transitionName = computed<string>(() => {
  return direction.value === 'next' ? 'media-next' : 'media-previous'
})

function goToPage(page: number): void {
  if (page < 0 || page >= pageCount.value) return
  if (page === currentPage.value) return

  direction.value = page > currentPage.value ? 'next' : 'previous'

  currentPage.value = page
}

function previousPage(): void {
  goToPage(currentPage.value - 1)
}

function nextPage(): void {
  goToPage(currentPage.value + 1)
}

watch(visibleCount, (): void => {
  currentPage.value = 0
})

watch(pageCount, (count: number): void => {
  if (currentPage.value < count) return

  currentPage.value = Math.max(0, count - 1)
})
</script>

<style scoped lang="scss">
.media-carousel {
  display: flex;
  flex-direction: column;
  gap: space(4);
}

.media-carousel__controls {
  display: grid;
  grid-template-columns: auto minmax(0, max-content) auto;
  align-items: center;
  justify-content: center;
  column-gap: space(3);

  width: 100%;
}

.media-carousel__pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: space(2);

  min-width: 0;
}

.media-carousel__navigation,
.media-carousel__page {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.media-carousel__navigation {
  width: space(8);
  height: space(8);

  color: color(theme, neutral, theme, 11);
  flex-shrink: 0;

  @media (hover: hover) {
    &:not(:disabled):hover {
      color: color(theme, neutral, theme, 12);
    }
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
}

.media-carousel__page {
  height: space(8);
  padding-inline: space(0.5);
  flex-shrink: 0;
}

.media-carousel__page-indicator {
  display: block;

  width: space(6);
  height: 0.3rem;

  background-color: color(theme, neutral, theme, 6);
}

.media-carousel__page.is-active {
  .media-carousel__page-indicator {
    background-color: color(theme, primary, theme, 8);
  }
}

@media (hover: hover) {
  .media-carousel__page:not(.is-active):hover {
    .media-carousel__page-indicator {
      background-color: color(theme, neutral, theme, 8);
    }
  }

  .media-carousel__page.is-active:hover {
    .media-carousel__page-indicator {
      background-color: color(theme, primary, theme, 9);
    }
  }
}
</style>
