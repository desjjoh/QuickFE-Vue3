<template>
  <PlaygroundShowcase>
    <GridBox :columns="2">
      <!-- HEADER DEMO -->
      <GridCell :span="2">
        <BlockText element="h1">
          The principles of the typographic craft are difficult to master
        </BlockText>
      </GridCell>

      <!-- BLOCK TEXT DEMO -->
      <GridCell>
        <BlockText>
          The goal of typography is to relate font size, line height, and line width in a
          proportional way that maximizes beauty and makes reading easier and more pleasant. The
          question is: What proportion(s) will give us the best results? The golden ratio is often
          observed in nature where beauty and utility intersect; perhaps we can use this
          <InlineText element="q">divine</InlineText>
          proportion to enhance these attributes in our typography.
        </BlockText>
      </GridCell>

      <!-- INLINE TEXT DEMO -->
      <GridCell>
        <BlockText>
          You can fine-tune emphasis using inline elements like
          <InlineText element="strong">strong</InlineText>,
          <InlineText element="em">emphasis</InlineText>,
          <InlineText element="mark">highlighting</InlineText>, or
          <InlineText element="code">inline code</InlineText>
          without breaking typography consistency.
        </BlockText>
      </GridCell>
    </GridBox>
  </PlaygroundShowcase>

  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="block">Block text</Tab>
      <Tab id="inline">Inline text</Tab>
      <Tab id="colors">Text color</Tab>
      <Tab id="family">Font family</Tab>
      <Tab id="weight">Font weight</Tab>
    </template>

    <!-- BLOCK TEXT (PARAGAPHS & HEADERS) -->
    <template #block>
      <PlaygroundTable>
        <template #body>
          <tr v-for="header in headers" :key="header">
            <th>
              <InlineText size="sm">{{ header }}</InlineText>
            </th>

            <td>
              <div class="cell">
                <BlockText :element="header">The quick brown fox jumps over the lazy dog</BlockText>
              </div>
            </td>
          </tr>
        </template>
      </PlaygroundTable>
    </template>

    <!-- INLINE TEXT -->
    <template #inline>
      <PlaygroundTable>
        <template #body>
          <tr v-for="el in inline" :key="el">
            <th>
              <InlineText size="sm">{{ el }}</InlineText>
            </th>

            <td>
              <div class="cell">
                <InlineText :element="el">The quick brown fox jumps over the lazy dog</InlineText>
              </div>
            </td>
          </tr>
        </template>
      </PlaygroundTable>
    </template>

    <!-- TEXT COLOR -->
    <template #colors>
      <PlaygroundTable>
        <template #body>
          <tr v-for="color in colors" :key="color">
            <th>
              <InlineText size="sm">{{ color }}</InlineText>
            </th>

            <td>
              <div class="cell">
                <BlockText :tone="color">The quick brown fox jumps over the lazy dog</BlockText>
              </div>
            </td>
          </tr>
        </template>
      </PlaygroundTable>
    </template>

    <!-- FONT FAMILY -->
    <template #family>
      <PlaygroundTable>
        <template #body>
          <tr v-for="font in fonts" :key="font">
            <th>
              <InlineText size="sm">{{ font }}</InlineText>
            </th>

            <td>
              <div class="cell">
                <BlockText :font="font">The quick brown fox jumps over the lazy dog</BlockText>
              </div>
            </td>
          </tr>
        </template>
      </PlaygroundTable>
    </template>

    <!-- FONT WEIGHT -->
    <template #weight>
      <PlaygroundTable>
        <template #body>
          <tr v-for="weight in weights" :key="weight">
            <th>
              <InlineText size="sm">{{ weight }}</InlineText>
            </th>

            <td>
              <div class="cell">
                <BlockText :weight="weight">The quick brown fox jumps over the lazy dog</BlockText>
              </div>
            </td>
          </tr>
        </template>
      </PlaygroundTable>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import type { Block, Font, Inline, Tone, Weight } from '@/shared/components/text/types'

import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'

import BlockText from '@/shared/components/text/BlockText.vue'
import InlineText from '@/shared/components/text/InlineText.vue'

import GridCell from '@/shared/components/grid/GridCell.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'

import PlaygroundTable from '../layouts/PlaygroundTable.vue'
import PlaygroundShowcase from '../layouts/PlaygroundShowcase.vue'

const fonts: Font[] = ['base', 'display', 'code', 'emphasis']
const headers: Block[] = ['p', 'h6', 'h5', 'h4', 'h3', 'h2', 'h1']
const colors: Tone[] = ['primary', 'secondary', 'tertiary', 'muted']
const weights: Weight[] = [
  'thin',
  'extralight',
  'light',
  'normal',
  'medium',
  'semibold',
  'bold',
  'extrabold',
  'black',
]
const inline: Inline[] = [
  'span',
  'small',
  'sub',
  'sup',
  'strong',
  'b',
  'em',
  'i',
  'q',
  'del',
  's',
  'ins',
  'u',
  'code',
  'mark',
]
</script>
