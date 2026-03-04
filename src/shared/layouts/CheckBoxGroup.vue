<template>
  <FlexBox direction="column" :gap="2">
    <FlexBox :gap="2" align-items="center">
      <slot></slot>
      <FormLabel :for="id">
        {{ props.label }}
      </FormLabel>
    </FlexBox>
    <FlexBox v-if="$slots.error" class="alert__text" align-items="center" :gap="1">
      <CircleAlert />
      <BlockText><slot name="error"></slot></BlockText>
    </FlexBox>
  </FlexBox>
</template>

<script setup lang="ts">
import { CircleAlert } from 'lucide-vue-next'

import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import FormLabel from '../components/text/FormLabel.vue'

const props = defineProps<{ id: string; label: string }>()
</script>

<style lang="scss" scoped>
.alert__text {
  color: color(theme, danger, dark-alpha, 12);

  &:deep(svg) {
    width: 1em;
    height: 1em;
  }
}
</style>
