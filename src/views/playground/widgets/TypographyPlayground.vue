<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="block">{{ $t('playground.header.tabs.blockText') }}</Tab>
      <Tab id="inline">{{ $t('playground.header.tabs.inlineText') }}</Tab>
      <Tab id="colors">{{ $t('playground.header.tabs.textColor') }}</Tab>
      <Tab id="family">{{ $t('playground.header.tabs.fontFamily') }}</Tab>
      <Tab id="weight">{{ $t('playground.header.tabs.fontWeight') }}</Tab>
      <Tab id="examples">{{ $t('playground.header.tabs.examples') }}</Tab>
    </template>

    <!-- BLOCK TEXT (PARAGAPHS & HEADERS) -->
    <template #block>
      <PlaygroundTable>
        <template #body>
          <tr v-for="header in headers" :key="header">
            <th>
              <InlineText size="sm">{{ $t(`playground.table.block.${header}`) }}</InlineText>
            </th>

            <td>
              <div class="cell">
                <BlockText :element="header">{{ $t('playground.copy.pangram') }}</BlockText>
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
              <InlineText size="sm">{{ $t(`playground.table.inline.${el}`) }}</InlineText>
            </th>

            <td>
              <div class="cell">
                <InlineText :element="el">{{ $t('playground.copy.pangram') }}</InlineText>
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
              <InlineText size="sm">{{ $t(`playground.table.textTone.${color}`) }}</InlineText>
            </th>

            <td>
              <div class="cell">
                <BlockText :tone="color">{{ $t('playground.copy.pangram') }}</BlockText>
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
              <InlineText size="sm">{{ $t(`playground.table.font.${font}`) }}</InlineText>
            </th>

            <td>
              <div class="cell">
                <BlockText :font="font">{{ $t('playground.copy.pangram') }}</BlockText>
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
              <InlineText size="sm">{{ $t(`playground.table.weight.${weight}`) }}</InlineText>
            </th>

            <td>
              <div class="cell">
                <BlockText :weight="weight">{{ $t('playground.copy.pangram') }}</BlockText>
              </div>
            </td>
          </tr>
        </template>
      </PlaygroundTable>
    </template>

    <!-- EXAMPLES -->
    <template #examples>
      <PlaygroundShowcase>
        <GridBox :columns="2">
          <!-- HEADER DEMO -->
          <GridCell :span="2">
            <BlockText element="h1">
              {{ $t('playground.copy.typographyTitle') }}
            </BlockText>
          </GridCell>

          <!-- BLOCK TEXT DEMO -->
          <GridCell>
            <BlockText>
              The goal of typography is to relate font size, line height, and line width in a
              proportional way that maximizes beauty and makes reading easier and more pleasant. The
              question is: What proportion(s) will give us the best results? The golden ratio is
              often observed in nature where beauty and utility intersect; perhaps we can use this
              <InlineText element="q">divine</InlineText>
              proportion to enhance these attributes in our typography.
            </BlockText>
          </GridCell>

          <!-- INLINE TEXT DEMO -->
          <GridCell>
            <BlockText>
              <i18n-t keypath="playground.copy.inlineEmphasis" tag="span" scope="global">
                <InlineText element="strong">{{ $t('playground.copy.strong') }}</InlineText>
                <InlineText element="em">{{ $t('playground.copy.emphasis') }}</InlineText>
                <InlineText element="mark">{{ $t('playground.copy.highlighting') }}</InlineText>
                <InlineText element="code">inline code</InlineText>
              </i18n-t>
            </BlockText>
          </GridCell>
        </GridBox>
      </PlaygroundShowcase>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import type { Block, Font, Inline, Tone, Weight } from '@/library/types/components/text'

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
