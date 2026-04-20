<template>
  <FlexBox align-items="center" justify-content="center">
    <BlockText element="h1">{{ $t('template.about.title') }}</BlockText>
  </FlexBox>
</template>

<script setup lang="ts">
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
</script>
