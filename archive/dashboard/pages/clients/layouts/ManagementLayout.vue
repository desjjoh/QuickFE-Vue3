<template>
  <FlexBox direction="column" :gap="4" grow>
    <!-- FILTERS -->
    <FlexBox :direction="rowDirection" :align-items="rowAlignItems" :gap="4">
      <FlexBox grow>
        <slot name="searchFilter"></slot>
      </FlexBox>

      <FlexBox :direction="rowSubDirection" :gap="4">
        <slot name="statusFilter"></slot>
        <slot name="programFilter"></slot>
        <slot name="newClient"></slot>
      </FlexBox>
    </FlexBox>

    <!-- LIST -->
    <slot name="list"></slot>
  </FlexBox>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useViewport } from '@/shared/hooks/useViewport'

import FlexBox from '@/shared/components/flex/FlexBox.vue'

const { isTabletUp, isDesktop } = useViewport()

const rowDirection = computed<'row' | 'column'>(() => {
  return isDesktop.value ? 'row' : 'column'
})

const rowAlignItems = computed<'stretch' | 'center'>(() => {
  return isDesktop.value ? 'center' : 'stretch'
})

const rowSubDirection = computed<'row' | 'column'>(() => {
  return isTabletUp.value ? 'row' : 'column'
})
</script>
