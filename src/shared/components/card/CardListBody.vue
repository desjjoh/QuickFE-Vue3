<template>
  <ul class="card-list-body">
    <slot></slot>
  </ul>
</template>

<script setup lang="ts">
import { inject } from 'vue'

import { assertDefined } from '@/helpers/assert'
import { CARD_CONTEXT } from '@/library/types/components/cards'

const context = inject(CARD_CONTEXT)

assertDefined(context, '[CardListBody] must be used inside <BaseCard>.')
</script>

<style scoped lang="scss">
.card-list-body {
  display: flex;
  flex-direction: column;

  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 0;

  list-style: none;
}
</style>
