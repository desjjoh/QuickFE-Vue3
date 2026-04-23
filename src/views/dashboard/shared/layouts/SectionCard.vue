<template>
  <BaseCard size="lg">
    <CardBody>
      <FlexBox direction="column" :gap="4">
        <FlexBox direction="column" :gap="1">
          <BlockText element="h5">{{ title }}</BlockText>
          <BlockText v-if="subtitle">{{ subtitle }}</BlockText>
        </FlexBox>

        <slot></slot>
      </FlexBox>
    </CardBody>
  </BaseCard>
</template>

<script setup lang="ts">
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BaseCard from '@/shared/components/card/BaseCard.vue'
import CardBody from '@/shared/components/card/CardBody.vue'
import BlockText from '@/shared/components/text/BlockText.vue'

type Props = { title: string; subtitle?: string }

defineProps<Props>()
</script>
