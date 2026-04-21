<template>
  <section
    class="base__card"
    :class="[size && `size-${size}`]"
    :style="{
      alignSelf,
      justifySelf,
    }"
  >
    <slot></slot>
  </section>
</template>

<script setup lang="ts">
import { provide } from 'vue'
import { CARD_CONTEXT, type Props } from '@/shared/types/components/cards'

provide(CARD_CONTEXT, { isCard: true })

withDefaults(defineProps<Props>(), {
  size: 'md',
  justifySelf: 'auto',
  alignSelf: 'auto',
})
</script>

<style scoped lang="scss">
$card-sizes: (
  sm: (
    padding: space(3),
    radius: border-radius(sm),
  ),
  md: (
    padding: space(4),
    radius: border-radius(md),
  ),
  lg: (
    padding: space(6),
    radius: border-radius(lg),
  ),
);

.base__card {
  // BASE
  display: flex;
  flex-direction: column;
  overflow: hidden;

  background-color: color(bg, page);
  border-radius: border-radius(md);
  box-shadow: box-shadow(3);

  // SIZE
  @each $size, $values in $card-sizes {
    &.size-#{$size} {
      --card-padding: #{deep-get($values, padding)};
      --card-radius: #{deep-get($values, radius)};
    }
  }
}
</style>
