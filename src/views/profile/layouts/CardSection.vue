<template>
  <BaseCard size="lg">
    <CardBody>
      <FlexBox direction="column" :gap="3" grow>
        <FlexBox direction="column">
          <BlockText element="h5">{{ title }}</BlockText>
          <BlockText v-if="subtitle" size="sm" truncate>{{ subtitle }}</BlockText>
        </FlexBox>

        <FlexBox direction="column" grow>
          <slot></slot>
        </FlexBox>
      </FlexBox>
    </CardBody>
  </BaseCard>
</template>

<script setup lang="ts">
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BaseCard from '@/shared/components/card/BaseCard.vue'

import BlockText from '@/shared/components/text/BlockText.vue'
import CardBody from '@/shared/components/card/CardBody.vue'

type Props = {
  title: string
  subtitle?: string
}

defineProps<Props>()
</script>
