<template>
  <section class="form__section" :class="[divided && 'is-divided']">
    <FlexBox v-if="hasHeader" class="form__section-header" justify-content="space-between" :gap="4">
      <FlexBox direction="column" grow>
        <BlockText v-if="title" element="h6" weight="semibold" tone="tertiary" spaced>
          {{ title }}
        </BlockText>
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
  divided?: boolean
  gap?: number
}

const props = withDefaults(defineProps<Props>(), {
  divided: true,
  gap: 4,
})

const hasHeader = computed(() => !!props.title)
</script>

<style scoped lang="scss">
.form__section {
  display: flex;
  flex-direction: column;
  gap: space(3);
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
