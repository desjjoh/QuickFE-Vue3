<template>
  <CalloutComponent class="dashboard__alert" :variant="variant">
    <FlexBox align-items="center" :gap="4">
      <component v-if="icon" :is="icon" aria-hidden="true" />
      <FlexBox direction="column" :gap="1" shrink>
        <BlockText>
          <InlineText element="strong">{{ title }}</InlineText>
        </BlockText>

        <BlockText>
          {{ message }}
        </BlockText>
      </FlexBox>
    </FlexBox>
  </CalloutComponent>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

import FlexBox from '@/shared/components/flex/FlexBox.vue'
import CalloutComponent from '@/shared/components/text/CalloutComponent.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import InlineText from '@/shared/components/text/InlineText.vue'

import type { Variant } from '@/shared/types/components/text'

defineProps<{
  title: string
  message: string
  variant: Variant
  icon?: Component
}>()
</script>

<style scoped lang="scss">
.dashboard__alert {
  :deep(svg) {
    flex: none;
    height: space(6);
    width: space(6);
  }
}
</style>
