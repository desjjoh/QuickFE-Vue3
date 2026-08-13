<template>
  <FlexBox direction="column" justify-content="flex-start" :gap="16">
    <slot></slot>
  </FlexBox>
</template>

<script setup lang="ts">
import FlexBox from '@/library/components/flex/FlexBox.vue'
</script>
