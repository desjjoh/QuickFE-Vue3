<template>
  <BaseCard size="lg">
    <CardBody>
      <FlexBox direction="column" :gap="3" grow>
        <div class="card-list-item__main">
          <div v-if="hasStart" class="card-list-item__start">
            <slot name="start"></slot>
          </div>

          <FlexBox direction="column" class="card-list-item__content">
            <BlockText element="h5">{{ title }}</BlockText>
            <BlockText v-if="subtitle" size="sm" truncate>{{ subtitle }}</BlockText>
          </FlexBox>
        </div>

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
import { computed, useSlots, type ComputedRef } from 'vue'
import { useViewport } from '@/shared/hooks/useViewport'

type Props = {
  title: string
  subtitle?: string
}

const slots = useSlots()
const { isMobile } = useViewport()

defineProps<Props>()

const hasStart: ComputedRef<boolean> = computed<boolean>(() => !isMobile.value && !!slots.start)
</script>

<style lang="scss" scoped>
.card-list-item__main {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: flex-start;
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
  gap: space(1);

  min-width: 0;
}
</style>
