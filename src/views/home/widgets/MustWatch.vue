<template>
  <FlexBox direction="column" :gap="4">
    <SectionHeading title="Must Watch" :href="{ name: 'template' }" />

    <CarouselGrid :items="videos" :item-key="(video: VideoItem) => video.id">
      <template #default="{ item: video }">
        <VideoCard
          :title="video.title"
          :image="video.image"
          :image-alt="video.imageAlt"
          :href="video.href"
          :duration-seconds="video.durationSeconds"
          :published="video.published"
        />
      </template>
    </CarouselGrid>
  </FlexBox>
</template>

<script setup lang="ts">
import FlexBox from '@/library/components/flex/FlexBox.vue'
import VideoCard from '@/library/components/media/VideoCard.vue'
import CarouselGrid from '@/library/components/carousel/CarouselGrid.vue'

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
