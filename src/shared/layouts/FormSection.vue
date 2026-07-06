<template>
  <section class="form__section" :class="[divided && 'is-divided']">
    <FlexBox v-if="hasHeader" class="form__section-header" justify-content="space-between" :gap="4">
      <FlexBox direction="column" :gap="1" grow>
        <slot name="header">
          <BlockText v-if="title" element="h4" weight="semibold" tone="primary">
            {{ title }}
          </BlockText>

          <BlockText v-if="description" element="p" size="sm" tone="secondary">
            {{ description }}
          </BlockText>
        </slot>
      </FlexBox>

      <FlexBox v-if="$slots.actions" align-items="center" shrink>
        <slot name="actions"></slot>
      </FlexBox>
    </FlexBox>

    <FlexBox class="form__section-body" direction="column" :gap="gap">
      <slot></slot>
    </FlexBox>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'

type Props = {
  title?: string
  description?: string
  divided?: boolean
  gap?: number
}

const props = withDefaults(defineProps<Props>(), {
  divided: true,
  gap: 4,
})

const slots = defineSlots<{
  header?: () => unknown
  actions?: () => unknown
  default?: () => unknown
}>()

const hasHeader = computed(() => !!slots.header || !!props.title || !!props.description)
</script>

<style scoped lang="scss">
.form__section {
  display: flex;
  flex-direction: column;
  gap: space(4);
  min-width: 0;

  &.is-divided {
    padding-block-start: space(4);
    border-block-start: 0.1rem solid color(theme, neutral, theme-alpha, 6);

    &:first-child {
      padding-block-start: 0;
      border-block-start: 0;
    }
  }
}

.form__section-header,
.form__section-body {
  min-width: 0;
}
</style>
