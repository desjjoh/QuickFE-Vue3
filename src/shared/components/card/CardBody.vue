<template>
  <div class="card__body">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { CARD_CONTEXT } from '@/library/types/components/cards'
import { assertDefined } from '@/helpers/assert'

const context = inject(CARD_CONTEXT)

assertDefined(context, '[CardBody] must be used inside <BaseCard>.')
</script>

<style scoped lang="scss">
.card__body {
  display: flex;
  flex-direction: column;

  flex: 1 1 auto;

  padding: var(--card-padding);
  overflow: hidden;
}
</style>
