<template>
  <FlexBox direction="column" :gap="6">
    <slot></slot>
  </FlexBox>
</template>

<script setup lang="ts">
import FlexBox from '@/shared/components/flex/FlexBox.vue'
</script>
