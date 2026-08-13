<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="colors">{{ $t('playground.header.tabs.themeColors') }}</Tab>
      <Tab id="examples">{{ $t('playground.header.tabs.examples') }}</Tab>
    </template>

    <!-- THEME COLORS -->
    <template #colors>
      <PlaygroundTable>
        <template #body>
          <tr v-for="tone in tones" :key="tone">
            <th>
              <InlineText size="sm">{{ $t(`playground.table.tone.${tone}`) }}</InlineText>
            </th>

            <td>
              <div class="cell">
                <AppLink href="#" :tone="tone">
                  {{ $t(examples[tone]) }}
                </AppLink>
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
          <GridCell>
            <!-- LINK DEMO -->
            <BlockText>
              <i18n-t keypath="playground.copy.linkDemo" tag="span" scope="global">
                <AppLink href="#">{{ $t('playground.copy.graphicDesigner') }}</AppLink>
                <AppLink href="#">{{ $t('playground.copy.interface') }}</AppLink>
                <AppLink href="#">{{ $t('playground.copy.typefaces') }}</AppLink>
                <AppLink href="#">{{ $t('playground.copy.appleMacintosh') }}</AppLink>
              </i18n-t>
            </BlockText>
          </GridCell>

          <!-- LINK DEMO (THEMED) -->
          <GridCell>
            <BlockText>
              <i18n-t keypath="playground.copy.warningLinkDemo" tag="span" scope="global">
                <AppLink href="#" tone="warning">
                  {{ $t('playground.copy.pausingSubscription') }}
                </AppLink>
              </i18n-t>
            </BlockText>
          </GridCell>
        </GridBox>
      </PlaygroundShowcase>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import type { Tone } from '@/library/components/links/links'

import TabLayout from '@/library/components/tabs/TabLayout.vue'
import Tab from '@/library/components/tabs/TabButton.vue'

import AppLink from '@/library/components/links/AppLink.vue'

import BlockText from '@/library/components/text/BlockText.vue'
import InlineText from '@/library/components/text/InlineText.vue'

import GridCell from '@/library/components/grid/GridCell.vue'
import GridBox from '@/library/components/grid/GridBox.vue'

import PlaygroundTable from '../layouts/PlaygroundTable.vue'
import PlaygroundShowcase from '../layouts/PlaygroundShowcase.vue'

const tones: Tone[] = ['primary', 'neutral', 'success', 'warning', 'danger', 'info']
const examples: Record<Tone, string> = {
  primary: 'playground.link.tone.primary',
  neutral: 'playground.link.tone.neutral',
  success: 'playground.link.tone.success',
  warning: 'playground.link.tone.warning',
  danger: 'playground.link.tone.danger',
  info: 'playground.link.tone.info',
}
</script>
