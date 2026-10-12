<template>
  <FlexBox direction="column" :gap="2">
    <BlockText element="h3">{{ $t('administration.articles.management.title') }}</BlockText>
    <BlockText tone="secondary">{{
      $t('administration.articles.management.description')
    }}</BlockText>
  </FlexBox>
</template>

<script setup lang="ts">
import FlexBox from '@/library/components/flex/FlexBox.vue'
import BlockText from '@/library/components/text/BlockText.vue'
</script>
