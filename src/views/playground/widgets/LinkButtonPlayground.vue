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
                <LinkButton :tone="tone">{{ $t(examples[tone]) }}</LinkButton>
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
                <LinkButton>{{ $t('playground.copy.graphicDesigner') }}</LinkButton>
                <LinkButton>{{ $t('playground.copy.interface') }}</LinkButton>
                <LinkButton>{{ $t('playground.copy.typefaces') }}</LinkButton>
                <LinkButton>{{ $t('playground.copy.appleMacintosh') }}</LinkButton>
              </i18n-t>
            </BlockText>
          </GridCell>

          <!-- LINK DEMO (THEMED) -->
          <GridCell>
            <BlockText>
              <i18n-t keypath="playground.copy.warningLinkDemo" tag="span" scope="global">
                <LinkButton tone="warning">
                  {{ $t('playground.copy.pausingSubscription') }}
                </LinkButton>
              </i18n-t>
            </BlockText>
          </GridCell>
        </GridBox>
      </PlaygroundShowcase>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import type { Tone } from '@/library/types/components/links'

import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'

import BlockText from '@/shared/components/text/BlockText.vue'
import InlineText from '@/shared/components/text/InlineText.vue'

import GridCell from '@/shared/components/grid/GridCell.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'

import PlaygroundTable from '../layouts/PlaygroundTable.vue'
import PlaygroundShowcase from '../layouts/PlaygroundShowcase.vue'
import LinkButton from '@/shared/components/buttons/LinkButton.vue'

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
