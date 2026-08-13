<template>
  <component
    :is="element"
    :class="[
      tone && `tone-${tone}`,
      size && `size-${size}`,
      weight && `weight-${weight}`,
      leading && `leading-${leading}`,
      font && `font-${font}`,
      truncate && 'is-truncated',
    ]"
  >
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import type { Font, Inline, Leading, Size, Tone, Weight } from '@/library/types/components/text'

type props = {
  tone?: Tone
  element?: Inline
  size?: Size
  weight?: Weight
  leading?: Leading
  font?: Font
  truncate?: boolean
}

withDefaults(defineProps<props>(), {
  element: 'span',
  truncate: false,
})
</script>

<style scoped lang="scss">
$text-families: (
  base: font-family(base),
  display: font-family(display),
  code: font-family(code),
  emphasis: font-family(emphasis),
);

$text-tones: (
  primary: color(text, primary),
  secondary: color(text, secondary),
  tertiary: color(text, tertiary),
  muted: color(text, muted),
  inherit: inherit,
);

$text-sizes: (
  h1: font-size(h1),
  h2: font-size(h2),
  h3: font-size(h3),
  h4: font-size(h4),
  h5: font-size(h5),
  base: font-size(base),
  sm: font-size(sm),
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

$text-line-heights: (
  sm: prose-line-height(sm),
  base: prose-line-height(base),
  lg: prose-line-height(lg),
);

:where(span, small, em, strong, b, i, code, mark, small) {
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  font-family: inherit;
}

small,
sub,
sup {
  font-size: 0.875em;
}

strong,
b {
  font-weight: bolder;
}

em,
i,
q {
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
  font-size: font-size(sm);

  color: color(theme, pink, theme, 11);
  background-color: color(theme, pink, theme-alpha, 2);
  box-shadow: inset 0 0 0 1px color(theme, pink, theme-alpha, 6);

  padding-inline: space(1);
  padding-block: space(0.5);

  box-decoration-break: clone;
}

mark {
  color: color(theme, amber, theme-alpha, 11);
  background-color: color(theme, amber, theme-alpha, 3);
  box-shadow: inset 0 0 0 1px color(theme, amber, theme-alpha, 6);

  padding-inline: space(1);
  padding-block: space(0.5);

  box-decoration-break: clone;
}

@each $tone, $value in $text-tones {
  .tone-#{$tone} {
    color: #{$value};
  }
}

@each $size, $value in $text-sizes {
  .size-#{$size} {
    font-size: #{$value};
  }
}

@each $weight, $value in $text-weights {
  .weight-#{$weight} {
    font-weight: #{$value};
  }
}

@each $lh, $value in $text-line-heights {
  .leading-#{$lh} {
    line-height: #{$value};
  }
}

@each $family, $value in $text-families {
  .font-#{$family} {
    font-family: #{$value};
  }
}
</style>
