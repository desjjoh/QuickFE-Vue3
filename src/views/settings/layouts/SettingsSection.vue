<template>
  <section class="settings-section">
    <FlexBox direction="column" :gap="3">
      <FlexBox direction="column" :gap="1">
        <BlockText element="h3">
          {{ title }}
        </BlockText>

        <BlockText element="p" v-if="description">
          {{ description }}
        </BlockText>
      </FlexBox>

      <BaseCard>
        <CardListBody>
          <slot></slot>
        </CardListBody>
      </BaseCard>
    </FlexBox>
  </section>
</template>

<script setup lang="ts">
import BaseCard from '@/shared/components/card/BaseCard.vue'
import CardListBody from '@/shared/components/card/CardListBody.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'

defineProps<{
  title: string
  description?: string
}>()
</script>

<style scoped lang="scss">
.settings-section {
  width: 100%;
  min-width: 0;
}
</style>
