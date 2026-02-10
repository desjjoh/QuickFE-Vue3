<template>
  <PlaygroundShowcase>
    <GridBox :columns="2">
      <GridCell>
        <BlockText>
          Susan Kare is an American artist and <BaseLink href="#">graphic designer</BaseLink>, who
          contributed <BaseLink href="#">interface</BaseLink> elements and
          <BaseLink href="#">typefaces</BaseLink> for the first
          <BaseLink href="#">Apple Macintosh</BaseLink> personal computer from 1983 to 1986.
        </BlockText>
      </GridCell>

      <GridCell>
        <BlockText>
          Deleting your account is permanent, and your data will not be able to be recovered. If you
          still want to use this account in the future, learn about
          <BaseLink href="#" tone="warning">pausing your subscription</BaseLink> instead.
        </BlockText>
      </GridCell>
    </GridBox>
  </PlaygroundShowcase>

  <TabLayout>
    <template #tabs>
      <Tab id="colors">Theme colors</Tab>
    </template>

    <template #colors>
      <PlaygroundTable>
        <template #body>
          <tr v-for="tone in tones" :key="tone">
            <th>
              <InlineText size="sm">{{ tone }}</InlineText>
            </th>

            <td>
              <div class="cell">
                <BaseLink href="#" :tone="tone">{{ examples[tone] }}</BaseLink>
              </div>
            </td>
          </tr>
        </template>
      </PlaygroundTable>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import type { Tone } from '@/shared/components/links/types'

import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'

import BaseLink from '@/shared/components/links/BaseLink.vue'

import BlockText from '@/shared/components/text/BlockText.vue'
import InlineText from '@/shared/components/text/InlineText.vue'

import GridCell from '@/shared/components/grid/GridCell.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'

import PlaygroundTable from '../layouts/PlaygroundTable.vue'
import PlaygroundShowcase from '../layouts/PlaygroundShowcase.vue'

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
