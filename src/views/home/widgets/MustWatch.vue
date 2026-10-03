<template>
  <FlexBox direction="column" :gap="4">
    <SectionHeading title="Must Watch" :href="{ name: 'template' }" />

    <div class="must-watch__viewport">
      <Transition :name="transitionName" mode="out-in">
        <MediaGrid :key="currentPage">
          <VideoCard
            v-for="video in visibleVideos"
            :key="video.id"
            :title="video.title"
            :image="video.image"
            :image-alt="video.imageAlt"
            :href="video.href"
            :duration-seconds="video.durationSeconds"
            :published="video.published"
          />
        </MediaGrid>
      </Transition>
    </div>

    <div v-if="pageCount > 1" class="must-watch__pagination">
      <button
        v-for="page in pageCount"
        :key="page"
        class="must-watch__page"
        :class="{ 'is-active': currentPage === page - 1 }"
        type="button"
        :aria-label="`Show page ${page}`"
        :aria-current="currentPage === page - 1 ? 'page' : undefined"
        @click="goToPage(page - 1)"
      ></button>
    </div>
  </FlexBox>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import FlexBox from '@/library/components/flex/FlexBox.vue'
import { useViewport } from '@/shared/hooks/useViewport'

import VideoCard from '../components/VideoCard.vue'
import MediaGrid from '../layouts/MediaGrid.vue'
import SectionHeading from '../components/SectionHeading.vue'

type VideoItem = {
  id: string
  title: string
  image: string
  imageAlt: string
  href: string
  published: string
  durationSeconds: number
}

const videos: VideoItem[] = [
  {
    id: 'shesterkin-goalie-goal',
    title: "TBL@NYR: Shesterkin pots Rangers' first ever goalie goal",
    image:
      'https://media.d3.nhle.com/image/private/t_ratio16_9-size20/dpr_3.0/f_auto/v1790906311/prd/dseszu2chfwxgvfbf8g5.jpg',
    imageAlt: 'Placeholder video thumbnail',
    href: '/',
    durationSeconds: 50,
    published: '2026-10-01T19:33:44.215327Z',
  },
  {
    id: 'thursday-goals',
    title: 'Watch all the goals from Thursday night',
    image:
      'https://media.d3.nhle.com/image/private/t_ratio16_9-size20/dpr_3.0/f_auto/prd/pdqjmxjevtlcrieapz82.jpg',
    imageAlt: 'Placeholder video thumbnail',
    href: '/',
    durationSeconds: 578,
    published: '2026-10-01T19:33:44.215327Z',
  },
  {
    id: 'mcdavid-five-point-night',
    title: 'EDM@VAN: McDavid notches goal, four assists in victory',
    image:
      'https://media.d3.nhle.com/image/private/t_ratio16_9-size20/dpr_3.0/f_png/prd/icfvwtys36ydrexgnpik.png',
    imageAlt: 'Placeholder video thumbnail',
    href: '/',
    durationSeconds: 361,
    published: '2026-10-01T19:33:44.215327Z',
  },
  {
    id: 'hughes-overtime',
    title: 'PHI@NJD: Hughes whips it in through the backdoor to win it in overtime',
    image:
      'https://media.d3.nhle.com/image/private/t_ratio16_9-size20/dpr_3.0/f_auto/v1790906734/prd/jk8fwjfv511pw8jdj5ux.jpg',
    imageAlt: 'Placeholder video thumbnail',
    href: '/',
    durationSeconds: 68,
    published: '2026-10-01T19:33:44.215327Z',
  },
]

const { isMobile, isTablet } = useViewport()

const currentPage = ref<number>(0)
const direction = ref<'next' | 'previous'>('next')

const visibleCount = computed<number>(() => {
  if (isMobile.value) return 1
  if (isTablet.value) return 2

  return 4
})

const pageCount = computed<number>(() => {
  return Math.ceil(videos.length / visibleCount.value)
})

const visibleVideos = computed<VideoItem[]>(() => {
  const start = currentPage.value * visibleCount.value
  const end = start + visibleCount.value

  return videos.slice(start, end)
})

const transitionName = computed<string>(() => {
  return direction.value === 'next' ? 'media-next' : 'media-previous'
})

function goToPage(page: number): void {
  if (page === currentPage.value) return

  direction.value = page > currentPage.value ? 'next' : 'previous'

  currentPage.value = page
}

watch(visibleCount, (): void => {
  currentPage.value = 0
})
</script>

<style scoped lang="scss">
.must-watch__pagination {
  display: flex;
  justify-content: center;
  align-items: center;

  gap: space(2);
}

.must-watch__page {
  width: space(2);
  height: space(2);

  padding: 0;
  border: 0;
  border-radius: 50%;

  background-color: color(border, subtle);

  cursor: pointer;

  &.is-active {
    background-color: color(theme, primary, theme, 11);
  }
}
</style>
