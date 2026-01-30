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
import type { Font, Inline, Leading, Size, Tone, Weight } from './types'

withDefaults(
  defineProps<{
    tone?: Tone
    element?: Inline
    size?: Size
    weight?: Weight
    leading?: Leading
    font?: Font
  }>(),
  {
    element: 'span',
  },
)
</script>

<style scoped lang="scss">
:where(span, small, em, strong, b, i, code, mark, small) {
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  font-family: inherit;
}

small {
  font-size: 0.875em;
}

strong,
b {
  font-weight: bolder;
}

em,
i {
  font-family: font-family(emphasis);

  font-style: italic;
  font-weight: lighter;
}

del,
s {
  text-decoration: line-through;
}

ins,
u {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.15em;
}

code {
  font-family: font-family(code);
  font-size: 0.875em;

  color: palette(pink, dark, 11);
  background-color: palette(pink, dark-alpha, 2);
  box-shadow: inset 0 0 0 1px palette(pink, dark-alpha, 6);

  padding-inline: 0.25em;
  padding-block: 0.075em;

  box-decoration-break: clone;
}

mark {
  color: palette(amber, dark-alpha, 11);
  background-color: palette(amber, dark-alpha, 3);
  box-shadow: inset 0 0 0 1px palette(amber, dark-alpha, 6);

  padding-inline: 0.25em;
  padding-block: 0.075em;

  box-decoration-break: clone;
}

$text-tones: (
  primary: color(text, primary),
  secondary: color(text, secondary),
  tertiary: color(text, tertiary),
  muted: color(text, muted),
);

@each $tone, $value in $text-tones {
  .tone-#{$tone} {
    color: #{$value};
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
    font-size: #{$value};
  }
}

$text-weights: (
  thin: font-weight(thin),
  light: font-weight(light),
  normal: font-weight(normal),
  medium: font-weight(medium),
  semibold: font-weight(semibold),
  bold: font-weight(bold),
);

@each $weight, $value in $text-weights {
  .weight-#{$weight} {
    font-weight: #{$value};
  }
}

$text-line-heights: (
  sm: prose-line-height(sm),
  base: prose-line-height(base),
  lg: prose-line-height(lg),
);

@each $lh, $value in $text-line-heights {
  .leading-#{$lh} {
    line-height: #{$value};
  }
}

$text-families: (
  base: font-family(base),
  display: font-family(display),
  code: font-family(code),
  emphasis: font-family(emphasis),
);

@each $family, $value in $text-families {
  .font-#{$family} {
    font-family: #{$value};
  }
}
</style>
