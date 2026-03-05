<template>
  <FlexBox direction="column" justify-content="flex-start" :gap="4">
    <BlockText element="h3">
      {{ title }}
    </BlockText>

    <FlexBox direction="column" align-items="flex-start" :gap="6">
      <slot name="body"></slot>
    </FlexBox>
  </FlexBox>
</template>

<script setup lang="ts">
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'

defineProps<{ title: string }>()
</script>
