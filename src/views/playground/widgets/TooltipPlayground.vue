<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="examples">Examples</Tab>
    </template>

    <!-- EXAMPLES -->
    <template #examples>
      <BaseTooltip side="bottom">
        <template #trigger="{ triggerAttrs }">
          <div v-bind="triggerAttrs" class="hover__item">
            <BlockText>Hover here</BlockText>
          </div>
        </template>

        The quick brown fox
      </BaseTooltip>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import BlockText from '@/shared/components/text/BlockText.vue'
import BaseTooltip from '@/shared/components/tooltips/BaseTooltip.vue'

import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'
</script>

<style scoped lang="scss">
.hover__item {
  color: color(text, primary);
  background: color(theme, primary, dark-alpha, 2);
  border-radius: border-radius(md);
  padding: space(4);
  border: 0.1rem dashed color(theme, primary, dark-alpha, 7);

  & * {
    pointer-events: none;
    user-select: none;
  }
}
</style>
