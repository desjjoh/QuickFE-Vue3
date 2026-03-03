<template>
  <FlexBox direction="column" :gap="6">
    <slot name="header"></slot>
    <FlexBox direction="column" :gap="4" grow>
      <slot name="content"></slot>
    </FlexBox>
    <FlexBox justify-content="flex-end" :gap="3">
      <slot name="actions"></slot>
    </FlexBox>
  </FlexBox>
</template>

<script setup lang="ts">
import FlexBox from '@/shared/components/flex/FlexBox.vue'
</script>
