<template>
  <component
    :is="element"
    :class="[
      tone && `tone-${tone}`,
      size && `size-${size}`,
      weight && `weight-${weight}`,
      leading && `leading-${leading}`,
      font && `font-${font}`,
    ]"
  >
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import type { Block, Font, Leading, Size, Tone, Weight } from './types'

withDefaults(
  defineProps<{
    tone?: Tone
    element?: Block
    size?: Size
    weight?: Weight
    leading?: Leading
    font?: Font
  }>(),
  {
    element: 'p',
  },
)
</script>

<style scoped lang="scss">
:where(h1, h2, h3, h4, h5, h6, p) {
  color: var(--text-color);
  font-size: var(--font-size);
  font-weight: var(--text-weight);
  line-height: var(--text-line-height);
  font-family: var(--text-family);
}

:where(h1, h2, h3, h4, h5, h6) {
  --text-color: #{color(text, primary)};
}

p {
  --text-color: #{color(text, secondary)};
}

h4,
h5,
h6 {
  --text-line-height: #{line-height(base)};
  --text-weight: #{font-weight(semibold)};
}

h1,
h2,
h3 {
  --text-line-height: #{line-height(sm)};
  --text-weight: #{font-weight(bold)};
  --text-family: #{font-family(display)};
}

$heading-sizes: (
  h1: font-size(h1),
  h2: font-size(h2),
  h3: font-size(h3),
  h4: font-size(h4),
  h5: font-size(h5),
  h6: font-size(base),
);

@each $tag, $size in $heading-sizes {
  #{$tag} {
    --font-size: #{$size};
  }
}

$text-tones: (
  primary: color(text, primary),
  secondary: color(text, secondary),
  tertiary: color(text, tertiary),
  muted: color(text, muted),
);

@each $tone, $value in $text-tones {
  .tone-#{$tone} {
    --text-color: #{$value};
  }
}

$text-sizes: (
  h1: font-size(h1),
  h2: font-size(h2),
  h3: font-size(h3),
  h4: font-size(h4),
  h5: font-size(h5),
  base: font-size(base),
  sm: font-size(sm),
);

@each $size, $value in $text-sizes {
  .size-#{$size} {
    --font-size: #{$value};
  }
}

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
);

@each $weight, $value in $text-weights {
  .weight-#{$weight} {
    --text-weight: #{$value};
  }
}

$text-line-heights: (
  sm: line-height(sm),
  base: line-height(base),
  lg: line-height(lg),
);

@each $lh, $value in $text-line-heights {
  .leading-#{$lh} {
    --text-line-height: #{$value};
  }
}

$text-families: (
  base: font-family(base),
  display: font-family(display),
  code: font-family(code),
);

@each $family, $value in $text-families {
  .font-#{$family} {
    --text-family: #{$value};
  }
}
</style>
