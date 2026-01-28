<template>
  <div class="showcase-section">
    <BlockText>
      Susan Kare is an American artist and <BaseLink href="#">graphic designer</BaseLink>, who
      contributed <BaseLink href="#">interface</BaseLink> elements and
      <BaseLink href="#">typefaces</BaseLink> for the first
      <BaseLink href="#">Apple Macintosh</BaseLink> personal computer from 1983 to 1986.
    </BlockText>
  </div>
  <PlaygroundTable>
    <template #body>
      <tr v-for="tone in tones" :key="tone">
        <td>
          <InlineText size="sm">{{ tone }}</InlineText>
        </td>

        <td>
          <div class="cell">
            <BaseLink href="#" :tone="tone">{{ examples[tone] }}</BaseLink>
          </div>
        </td>
      </tr>
    </template>
  </PlaygroundTable>
</template>

<script setup lang="ts">
import BaseLink from '@/shared/components/links/BaseLink.vue'
import PlaygroundTable from '../layouts/PlaygroundTable.vue'
import type { Tone } from '@/shared/components/links/types'
import BlockText from '@/shared/components/text/BlockText.vue'
import InlineText from '@/shared/components/text/InlineText.vue'

const tones: Tone[] = ['primary', 'neutral', 'success', 'warning', 'danger', 'info']

const examples: Record<Tone, string> = {
  primary: 'Read the documentation',
  neutral: 'View details',
  success: 'View successful deployment',
  warning: 'Review pending changes',
  danger: 'Delete this item',
  info: 'Learn more about this feature',
}
</script>

<style scoped lang="scss">
.showcase-section {
  max-width: space(110);
}
</style>
