<template>
  <FlexBox direction="column" :gap="2">
    <BlockText element="h3">{{ $t('administration.overview.dashboard.title') }}</BlockText>
    <BlockText tone="secondary">{{
      $t('administration.overview.dashboard.description')
    }}</BlockText>
  </FlexBox>
</template>

<script setup lang="ts">
import FlexBox from '@/library/components/flex/FlexBox.vue'
import BlockText from '@/library/components/text/BlockText.vue'
</script>
