<template>
  <label
    :for="props.for"
    :class="[size && `size-${size}`, weight && `weight-${weight}`, tone && `tone-${tone}`]"
    @mousedown.prevent
  >
    <slot></slot>
  </label>
</template>

<script setup lang="ts">
import type { Size, Tone, Weight } from '@/library/types/components/text'

const props = withDefaults(
  defineProps<{ for: string; size?: Size; weight?: Weight; tone?: Tone }>(),
  {},
)
</script>

<style scoped lang="scss">
$text-sizes: (
  h1: font-size(h1),
  h2: font-size(h2),
  h3: font-size(h3),
  h4: font-size(h4),
  h5: font-size(h5),
  base: font-size(base),
  sm: font-size(sm),
);

$text-tones: (
  primary: color(text, primary),
  secondary: color(text, secondary),
  tertiary: color(text, tertiary),
  muted: color(text, muted),
  inherit: inherit,
);

$text-weights: (
  thin: font-weight(thin),
  extralight: font-weight(extralight),
  light: font-weight(light),
  normal: font-weight(normal),
  medium: font-weight(medium),
  semibold: font-weight(semibold),
  bold: font-weight(bold),
  extrabold: font-weight(extrabold),
  'black': font-weight(black),
  inherit: inherit,
);

label {
  // BASE
  cursor: pointer;
  user-select: none;

  color: color(text, primary);
  font-weight: font-weight(medium);

  // SIZE
  @each $size, $value in $text-sizes {
    &.size-#{$size} {
      font-size: #{$value};
    }
  }

  // TONE
  @each $tone, $value in $text-tones {
    &.tone-#{$tone} {
      color: #{$value};
    }
  }

  // FONT WEIGHT
  @each $weight, $value in $text-weights {
    &.weight-#{$weight} {
      font-weight: #{$value};
    }
  }
}
</style>
