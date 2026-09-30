<template>
  <CenteredLayout>
    <FlexBox direction="column" :gap="1">
      <BlockText element="h3">{{ $t('administration.activity.title') }}</BlockText>
      <BlockText>{{ $t('administration.activity.description') }}</BlockText>
    </FlexBox>
  </CenteredLayout>
</template>

<script setup lang="ts">
import CenteredLayout from '@/shared/layouts/CenteredLayout.vue'
import FlexBox from '@/library/components/flex/FlexBox.vue'
import BlockText from '@/library/components/text/BlockText.vue'
</script>
