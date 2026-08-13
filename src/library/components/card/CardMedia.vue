<template>
  <div class="card__media" :class="[direction]" :style="{ '--size': size }">
    <img :src="src" :aria-label="alt" />
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { CARD_CONTEXT, type CardDirection } from '@/library/types/components/cards'
import { assertDefined } from '@/helpers/assert'

type Props = {
  alt: string
  src: string

  direction?: CardDirection
  size?: number
}

withDefaults(defineProps<Props>(), {
  direction: 'column',
  size: 20,
})

const context = inject(CARD_CONTEXT)
assertDefined(context, '[CardBody] must be used inside <BaseCard>.')
</script>

<style scoped lang="scss">
.card__media {
  display: flex;
  flex-shrink: 0;

  &.row {
    width: calc(var(--size, 0) * $spacer);
  }

  &.column {
    height: calc(var(--size, 0) * $spacer);
    width: 100%;
  }

  & img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }
}
</style>
