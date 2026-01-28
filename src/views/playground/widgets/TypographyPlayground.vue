<template>
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

<script setup lang="ts">
import BlockText from '@/shared/components/text/BlockText.vue'
import PlaygroundTable from '../layouts/PlaygroundTable.vue'
import type { Block, Font, Inline, Tone } from '@/shared/components/text/types'
import InlineText from '@/shared/components/text/InlineText.vue'

const fonts: Font[] = ['base', 'display', 'code']
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
</script>
