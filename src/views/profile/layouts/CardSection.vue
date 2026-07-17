<template>
  <BaseCard size="lg">
    <CardBody>
      <FlexBox direction="column" :gap="3" grow>
        <div class="card-list-item__main">
          <FlexBox direction="column" class="card-list-item__content">
            <BlockText element="h5">{{ title }}</BlockText>
            <BlockText v-if="subtitle" size="sm" truncate>{{ subtitle }}</BlockText>
          </FlexBox>
        </div>

        <FlexBox direction="column" :justify-content="justify" grow>
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

import type { FlexJustify } from '@/library/types/components/flex'

type Props = {
  title: string
  subtitle?: string
  justify?: FlexJustify
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.card-list-item__main {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: space(4);

  min-width: 0;
  max-width: 100%;
}

.card-list-item__start {
  display: flex;
  align-items: center;
  justify-content: center;

  min-width: 0;
}

.card-list-item__content {
  display: grid;

  min-width: 0;
}
</style>
