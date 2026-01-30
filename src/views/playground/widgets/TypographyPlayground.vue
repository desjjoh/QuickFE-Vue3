<template>
  <PlaygroundShowcase :columns="1">
    <BlockText element="h1">
      The principles of the typographic craft are difficult to master
    </BlockText>
  </PlaygroundShowcase>
  <PlaygroundShowcase>
    <BlockText>
      The goal of typography is to relate font size, line height, and line width in a proportional
      way that maximizes beauty and makes reading easier and more pleasant. The question is: What
      proportion(s) will give us the best results? The golden ratio is often observed in nature
      where beauty and utility intersect; perhaps we can use this “divine” proportion to enhance
      these attributes in our typography.
    </BlockText>

    <BlockText>
      You can fine-tune emphasis using inline elements like
      <InlineText element="strong">strong</InlineText>,
      <InlineText element="em">emphasis</InlineText>,
      <InlineText element="mark">highlighting</InlineText>, or
      <InlineText element="code">inline code</InlineText>
      without breaking typography consistency.
    </BlockText>
  </PlaygroundShowcase>

  <TabLayout v-model="activeTab">
    <template #tabs>
      <Tab id="block">Block text</Tab>
      <Tab id="inline">Inline text</Tab>
      <Tab id="colors">Text color</Tab>
      <Tab id="family">Font family</Tab>
    </template>
    <template #block>
      <PlaygroundTable>
        <template #body>
          <tr v-for="header in headers" :key="header">
            <td>
              <InlineText size="sm">{{ header }}</InlineText>
            </td>

            <td>
              <div class="cell">
                <BlockText :element="header">The quick brown fox jumps over the lazy dog</BlockText>
              </div>
            </td>
          </tr>
        </template>
      </PlaygroundTable>
    </template>
    <template #inline>
      <PlaygroundTable>
        <template #body>
          <tr v-for="el in inline" :key="el">
            <td>
              <InlineText size="sm">{{ el }}</InlineText>
            </td>

            <td>
              <div class="cell">
                <InlineText :element="el">The quick brown fox jumps over the lazy dog</InlineText>
              </div>
            </td>
          </tr>
        </template>
      </PlaygroundTable>
    </template>
    <template #colors>
      <PlaygroundTable>
        <template #body>
          <tr v-for="color in colors" :key="color">
            <td>
              <InlineText size="sm">{{ color }}</InlineText>
            </td>

            <td>
              <div class="cell">
                <BlockText :tone="color">The quick brown fox jumps over the lazy dog</BlockText>
              </div>
            </td>
          </tr>
        </template>
      </PlaygroundTable>
    </template>
    <template #family>
      <PlaygroundTable>
        <template #body>
          <tr v-for="font in fonts" :key="font">
            <td>
              <InlineText size="sm">{{ font }}</InlineText>
            </td>

            <td>
              <div class="cell">
                <BlockText :font="font">The quick brown fox jumps over the lazy dog</BlockText>
              </div>
            </td>
          </tr>
        </template>
      </PlaygroundTable>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import type { TabId } from '@/shared/components/tabs/types'
import type { Block, Font, Inline, Tone } from '@/shared/components/text/types'

import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'

import BlockText from '@/shared/components/text/BlockText.vue'
import InlineText from '@/shared/components/text/InlineText.vue'

import PlaygroundTable from '../layouts/PlaygroundTable.vue'
import PlaygroundShowcase from '../layouts/PlaygroundShowcase.vue'

const fonts: Font[] = ['base', 'display', 'code', 'emphasis']
const headers: Block[] = ['p', 'h6', 'h5', 'h4', 'h3', 'h2', 'h1']
const colors: Tone[] = ['primary', 'secondary', 'tertiary', 'muted']
const inline: Inline[] = [
  'span',
  'small',
  'strong',
  'b',
  'em',
  'i',
  'del',
  's',
  'ins',
  'u',
  'code',
  'mark',
]

const activeTab = ref<TabId>('block')
</script>
