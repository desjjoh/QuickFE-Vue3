<template>
  <StoriesLayout>
    <template #featured>
      <HeroMedia
        title="'I STILL LOVE THE GAME'"
        description="Ovechkin set to start 22nd NHL season with another Capitals Cup run on his mind"
        image="https://media.d3.nhle.com/image/private/t_ratio16_9-size30/dpr_3.0/f_auto/v1790868459/prd/y3tpzybopre7x46wzrth.jpg"
        image-alt="Alex Ovechkin celebrating with Washington Capitals teammates"
        href="/content/ovechkin"
      />
    </template>

    <template #secondary>
      <CardMedia
        title="'Unbelievable feelings' for Shesterkin's goalie goal"
        image="https://media.d3.nhle.com/image/private/t_ratio16_9-size20/dpr_3.0/f_auto/v1790913135/prd/a17bp2wxxj7cjq72x22n.jpg"
        image-alt="Hockey players celebrating on the ice"
        href="/content/rangers"
      />
      <CardMedia
        title="Red Wings stress 'early urgency' ahead of opener"
        image="https://media.d3.nhle.com/image/private/t_ratio16_9-size20/dpr_3.0/f_auto/prd/f5yy3xcstassubgra48z.jpg"
        image-alt="Hockey players celebrating on the ice"
        href="/content/rangers"
      />
      <CardMedia
        title="Mammoth show they're ready for high expectations"
        image="https://media.d3.nhle.com/image/private/t_ratio16_9-size20/dpr_3.0/f_png/v1790921677/prd/bmdcmxzd1g0geuqpcwi6.png"
        image-alt="Hockey players celebrating on the ice"
        href="/content/mammoth"
      />
    </template>

    <template #stories>
      <FlexBox direction="column" :gap="2">
        <SectionHeading title="Top Stories" :href="{ name: 'template' }" />
        <RecentStories :headlines="topStories" />
      </FlexBox>
    </template>
  </StoriesLayout>
</template>

<script setup lang="ts">
import FlexBox from '@/library/components/flex/FlexBox.vue'

import StoriesLayout from '../layouts/StoriesLayout.vue'
import RecentStories, { type Headline } from '../components/RecentStories.vue'
import HeroMedia from '../components/HeroMedia.vue'
import CardMedia from '../components/CardMedia.vue'
import SectionHeading from '../components/SectionHeading.vue'

const topStories: Headline[] = [
  {
    title: 'WATCH: All 21 goalie goals in NHL history',
    href: { name: 'template' },
  },
  {
    title: "Bouchard 'elite as it gets,' Oilers teammates say",
    href: { name: 'template' },
  },
  {
    title: 'Barkov leaves in 2nd period following awkward fall',
    href: { name: 'template' },
  },
  {
    title: 'McDavid has 5 points, Oilers bounce back with 9 goals',
    href: { name: 'template' },
  },
  {
    title: 'Hughes brothers lift Devils to season-opening OT win',
    href: { name: 'template' },
  },
  {
    title: 'Knies 3 points in debut lift Jackets past Sabres',
    href: { name: 'template' },
  },
  {
    title: 'Smith scores twice, Sharks recover for OT win in opener',
    href: { name: 'template' },
  },
  {
    title: 'Young NHL players find ways to get used to adulting',
    href: { name: 'template' },
  },
  {
    title: 'List of NHL EBUGS for 2026-27 season',
    href: { name: 'template' },
  },
]
</script>
