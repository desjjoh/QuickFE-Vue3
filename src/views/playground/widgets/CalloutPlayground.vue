<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="color">Theme colors</Tab>
      <Tab id="examples">Examples</Tab>
    </template>

    <!-- THEME COLORS -->
    <template #color>
      <PlaygroundTable>
        <template #body>
          <tr v-for="variant in variants" :key="variant">
            <th>
              <InlineText size="sm">{{ variant }}</InlineText>
            </th>

            <td>
              <div class="cell">
                <CalloutText :variant="variant">
                  Perfect typography is certainly the most elusive of all arts. Sculpture in stone
                  alone comes near it in obstinacy.
                </CalloutText>
              </div>
            </td>
          </tr>
        </template>
      </PlaygroundTable>
    </template>

    <!-- EXAMPLES -->
    <template #examples>
      <PlaygroundShowcase>
        <GridBox :columns="2" align-items="start">
          <!-- CALLOUT DEMO -->
          <GridCell>
            <CalloutText>
              <InlineText element="strong">Three fundamental aspects of typography</InlineText> are
              legibility, readability, and aesthetics. Although in a non-technical sense
              <InlineText element="q">legible</InlineText> and
              <InlineText element="q">readable</InlineText> are often used synonymously,
              typographically they are separate but related concepts.
            </CalloutText>
          </GridCell>

          <!-- CALLOUT DEMO (THEMED) -->
          <GridCell>
            <CalloutText variant="warning">
              <InlineText element="strong">Accessibility tip:</InlineText> Using color to add
              meaning only provides a visual indication, which will not be conveyed to users of
              assistive technologies like screen readers. Please ensure the meaning is obvious from
              the content itself (e.g., the visible text with a sufficient color contrast) or is
              included through alternative means.
            </CalloutText>
          </GridCell>
        </GridBox>
      </PlaygroundShowcase>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import type { Variant } from '@/shared/types/components/text'

import CalloutText from '@/shared/components/text/CalloutComponent.vue'
import InlineText from '@/shared/components/text/InlineText.vue'

import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'

import GridCell from '@/shared/components/grid/GridCell.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'

import PlaygroundShowcase from '../layouts/PlaygroundShowcase.vue'
import PlaygroundTable from '../layouts/PlaygroundTable.vue'

const variants: Variant[] = ['primary', 'neutral', 'success', 'warning', 'danger', 'info']
</script>

<style scoped lang="scss">
.cell {
  max-width: space(105);
}
</style>
