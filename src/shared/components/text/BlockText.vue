<template>
  <component
    :is="element"
    :class="[
      truncate && 'is-truncated',
      noWrap && `no-wrap`,
      clamp && 'is-clamped',
      tone && `tone-${tone}`,
      size && `size-${size}`,
      weight && `weight-${weight}`,
      leading && `leading-${leading}`,
      font && `font-${font}`,
      textAlign && `align-${textAlign}`,
      spaced && `letter-spaced`,
    ]"
    :style="{ whiteSpace, '--text-clamp': clamp }"
  >
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import type {
  Block,
  Font,
  Leading,
  Size,
  TextAlign,
  Tone,
  Weight,
} from '@/library/types/components/text'

type Props = {
  tone?: Tone
  element?: Block
  size?: Size
  weight?: Weight
  leading?: Leading
  font?: Font
  truncate?: boolean
  noWrap?: boolean
  textAlign?: TextAlign
  clamp?: number
  spaced?: boolean
  whiteSpace?: 'normal' | 'pre' | 'pre-wrap' | 'pre-line'
}

withDefaults(defineProps<Props>(), {
  element: 'p',
  truncate: false,
  noWrap: false,
  textAlign: 'left',
  spaced: false,
})
</script>

<style scoped lang="scss">
$text-tones: (
  primary: color(text, primary),
  secondary: color(text, secondary),
  tertiary: color(text, tertiary),
  muted: color(text, muted),
  inherit: inherit,
);

$heading-sizes: (
  h1: font-size(h1),
  h2: font-size(h2),
  h3: font-size(h3),
  h4: font-size(h4),
  h5: font-size(h5),
  h6: font-size(base),
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

$text-families: (
  base: font-family(base),
  display: font-family(display),
  code: font-family(code),
  emphasis: font-family(emphasis),
);

$text-alignments: (
  left: left,
  center: center,
  right: right,
  justify: justify,
);

:where(h1, h2, h3, h4, h5, h6, p) {
  color: var(--text-color);
  font-size: var(--font-size);
  font-weight: var(--text-weight);
  line-height: var(--text-line-height);
  font-family: var(--text-family);

  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;

  &.no-wrap {
    white-space: nowrap;
  }

  &.is-truncated {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &.is-clamped {
    display: -webkit-box;

    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--text-clamp);

    overflow: hidden;
  }

  &.letter-spaced {
    text-transform: uppercase;
    letter-spacing: $letter-spaced;
  }
}

:where(h1, h2, h3, h4, h5, h6) {
  --text-color: #{color(text, primary)};
}

h4,
h5,
h6 {
  --text-line-height: #{prose-line-height(base)};
  --text-weight: #{font-weight(semibold)};
}

h1,
h2,
h3 {
  --text-line-height: #{prose-line-height(sm)};
  --text-weight: #{font-weight(bold)};
  --text-family: #{font-family(display)};
}

@each $tag, $size in $heading-sizes {
  #{$tag} {
    --font-size: #{$size};
  }
}

@each $tone, $value in $text-tones {
  .tone-#{$tone} {
    --text-color: #{$value};
  }
}

@each $size, $value in $text-sizes {
  .size-#{$size} {
    --font-size: #{$value};
  }
}

@each $weight, $value in $text-weights {
  .weight-#{$weight} {
    --text-weight: #{$value};
  }
}

@each $lh, $value in $text-line-heights {
  .leading-#{$lh} {
    --text-line-height: #{$value};
  }
}

@each $family, $value in $text-families {
  .font-#{$family} {
    --text-family: #{$value};
  }
}

@each $align, $value in $text-alignments {
  .align-#{$align} {
    text-align: #{$value};
  }
}
</style>
