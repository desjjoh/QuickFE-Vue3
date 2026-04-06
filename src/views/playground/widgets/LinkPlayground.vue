<template>
  <PlaygroundShowcase>
    <GridBox :columns="2">
      <GridCell>
        <!-- LINK DEMO -->
        <BlockText>
          Susan Kare is an American artist and
          <AppLink href="#">graphic designer</AppLink>, who contributed
          <AppLink href="#">interface</AppLink> elements and
          <AppLink href="#">typefaces</AppLink>
          for the first
          <AppLink href="#">Apple Macintosh</AppLink>
          personal computer from 1983 to 1986.
        </BlockText>
      </GridCell>

      <!-- LINK DEMO (THEMED) -->
      <GridCell>
        <BlockText>
          Deleting your account is permanent, and your data will not be able to be recovered. If you
          still want to use this account in the future, learn about
          <AppLink href="#" tone="warning"> pausing your subscription </AppLink>
          instead.
        </BlockText>
      </GridCell>
    </GridBox>
  </PlaygroundShowcase>

  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="colors">Theme colors</Tab>
    </template>

    <!-- THEME COLORS -->
    <template #colors>
      <PlaygroundTable>
        <template #body>
          <tr v-for="tone in tones" :key="tone">
            <th>
              <InlineText size="sm">{{ tone }}</InlineText>
            </th>

            <td>
              <div class="cell">
                <AppLink href="#" :tone="tone" @click.prevent="scrollTop">{{
                  examples[tone]
                }}</AppLink>
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

import AppLink from '@/shared/components/links/AppLink.vue'

import BlockText from '@/shared/components/text/BlockText.vue'
import InlineText from '@/shared/components/text/InlineText.vue'

import GridCell from '@/shared/components/grid/GridCell.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'

import PlaygroundTable from '../layouts/PlaygroundTable.vue'
import PlaygroundShowcase from '../layouts/PlaygroundShowcase.vue'

const tones: Tone[] = ['primary', 'neutral', 'success', 'warning', 'danger', 'info']

function scrollTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const examples: Record<Tone, string> = {
  primary: 'Read the documentation',
  neutral: 'View details',
  success: 'View successful deployment',
  warning: 'Review pending changes',
  danger: 'Delete this item',
  info: 'Learn more about this feature',
}
</script>
