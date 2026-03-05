<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="theme">Theme colors</Tab>
      <Tab id="colors">All colors</Tab>
      <Tab id="neutrals">All neutrals</Tab>
      <Tab id="scale">Scale Anatomy</Tab>
    </template>

    <!-- THEME COLORS -->
    <template #theme>
      <PlaygroundShowcase>
        <GridBox :gap-x="2" :gap-y="3" :columns="9">
          <GridCell v-for="theme in themes" :key="theme">
            <FlexBox direction="column" :gap="1">
              <div class="color__box" :class="[`theme-${theme}`]"></div>
              <BlockText size="sm">{{ theme }}</BlockText>
            </FlexBox>
          </GridCell>
        </GridBox>
      </PlaygroundShowcase>
    </template>

    <!-- ALL COLORS -->
    <template #colors>
      <PlaygroundShowcase>
        <GridBox :gap-x="2" :gap-y="3" :columns="9">
          <GridCell v-for="color in colors" :key="color">
            <FlexBox direction="column" :gap="1">
              <div class="color__box" :class="[`color-${color}`]"></div>
              <BlockText size="sm">{{ color }}</BlockText>
            </FlexBox>
          </GridCell>
        </GridBox>
      </PlaygroundShowcase>
    </template>

    <!-- NEUTRAL COLORS -->
    <template #neutrals>
      <PlaygroundShowcase>
        <GridBox :gap-x="2" :gap-y="3" :columns="9">
          <GridCell v-for="color in grays" :key="color">
            <FlexBox direction="column" :gap="1">
              <div class="color__box" :class="[`color-${color}`]"></div>
              <BlockText size="sm">{{ color }}</BlockText>
            </FlexBox>
          </GridCell>
        </GridBox>
      </PlaygroundShowcase>
    </template>

    <!-- SCALE ANATOMY -->
    <template #scale>
      <PlaygroundShowcase>
        <GridBox :gap-x="2" :gap-y="3" :columns="12">
          <GridCell v-for="i in 12" :key="i">
            <FlexBox direction="column" :gap="1">
              <div class="color__box" :class="[`scale-dark-${i}`]"></div>
              <BlockText size="sm" text-align="center">{{ i }}</BlockText>
            </FlexBox>
          </GridCell>
        </GridBox>
      </PlaygroundShowcase>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'
import PlaygroundShowcase from '../layouts/PlaygroundShowcase.vue'
import GridCell from '@/shared/components/grid/GridCell.vue'
import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'
import type { Tone } from '@/shared/components/buttons/types'
import BlockText from '@/shared/components/text/BlockText.vue'

const themes: Tone[] = ['primary', 'neutral', 'success', 'warning', 'danger', 'info']

const colors: string[] = [
  'gold',
  'bronze',
  'brown',
  'yellow',
  'amber',
  'orange',
  'tomato',
  'red',
  'ruby',
  'crimson',
  'pink',
  'plum',
  'purple',
  'violet',
  'iris',
  'indigo',
  'blue',
  'cyan',
  'teal',
  'jade',
  'green',
  'grass',
  'lime',
  'mint',
  'sky',
]

const grays: string[] = ['gray', 'mauve', 'slate', 'sage', 'olive', 'sand']
</script>

<style scoped lang="scss">
@use '@/styles/palette' as *;

.color__box {
  height: space(12);
  border-radius: border-radius(sm);

  --swatch-color: transparent;

  @each $color, $value in deep-get($colors, theme) {
    &.theme-#{'' + $color} {
      background-color: deep-get($value, dark, 9);
    }
  }

  @each $color, $values in $accents {
    &.color-#{'' + $color} {
      background-color: deep-get($values, dark, 9);
    }
  }

  @each $color, $values in $neutrals {
    &.color-#{'' + $color} {
      background-color: deep-get($values, dark, 9);
    }
  }

  @for $i from 1 through 12 {
    &.scale-dark-#{$i} {
      background-color: color(theme, primary, dark, $i);
    }
  }
}
</style>
