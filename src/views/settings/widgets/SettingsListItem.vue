<template>
  <CardListItem :tone="tone" :hide-start="isMobile">
    <slot name="header">
      <BlockText v-if="title" element="h6" weight="semibold">
        {{ title }}
      </BlockText>

      <BlockText v-if="description" size="sm">
        {{ description }}
      </BlockText>
    </slot>

    <template v-if="$slots.value" #value>
      <slot name="value"></slot>
    </template>

    <template v-if="$slots.default" #end>
      <div class="settings-list-item__actions" :class="{ 'is-mobile': isMobile }">
        <slot></slot>
      </div>
    </template>
  </CardListItem>
</template>

<script setup lang="ts">
import { useViewport } from '@/shared/hooks/useViewport'

import CardListItem from '@/shared/components/card/CardListItem.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import type { Tone } from '@/library/types/components/buttons'

withDefaults(
  defineProps<{
    title?: string
    description?: string
    tone?: Tone
  }>(),
  {
    description: undefined,
    tone: 'primary',
  },
)

const { isMobile } = useViewport()
</script>

<style scoped lang="scss">
.settings-list-item__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: space(3);
  flex-wrap: wrap;

  min-width: 0;
}

.settings-list-item__actions.is-mobile {
  width: 100%;
  flex-direction: column;
  align-items: stretch;
}

.settings-list-item__actions.is-mobile :deep(button),
.settings-list-item__actions.is-mobile :deep(a) {
  width: 100%;
  justify-content: center;
}
</style>
