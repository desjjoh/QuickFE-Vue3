<template>
  <RouterLink
    v-if="usesRouterLink"
    v-bind="attrs"
    :to="routerDestination"
    :target="linkTarget"
    :rel="linkRel"
    :class="buttonClasses"
  >
    <span class="button__content">
      <component
        :is="icon"
        v-if="icon && iconPosition === 'start'"
        class="button__icon"
        aria-hidden="true"
        :strokeWidth="3"
      />

      <span class="button__label">
        <slot></slot>
      </span>

      <component
        :is="icon"
        v-if="icon && iconPosition === 'end'"
        class="button__icon"
        aria-hidden="true"
        :strokeWidth="3"
      />
    </span>
  </RouterLink>

  <a
    v-else
    v-bind="attrs"
    :href="anchorHref"
    :target="linkTarget"
    :rel="linkRel"
    :class="buttonClasses"
  >
    <span class="button__content">
      <component
        :is="icon"
        v-if="icon && iconPosition === 'start'"
        class="button__icon"
        aria-hidden="true"
        :strokeWidth="3"
      />

      <span class="button__label">
        <slot></slot>
      </span>

      <component
        :is="icon"
        v-if="icon && iconPosition === 'end'"
        class="button__icon"
        aria-hidden="true"
        :strokeWidth="3"
      />
    </span>
  </a>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { Component } from 'vue'
import { RouterLink } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

import type { Variant, Tone, Size, Radius } from '@/library/types/components/buttons'

defineOptions({ inheritAttrs: false })

type Props = {
  to?: RouteLocationRaw
  href?: string
  external?: boolean
  target?: string
  rel?: string
  variant?: Variant
  tone?: Tone
  size?: Size
  radius?: Radius
  icon?: Component
  iconPosition?: 'start' | 'end'
}

const props = withDefaults(defineProps<Props>(), {
  external: false,
  variant: 'solid',
  tone: 'primary',
  size: 'md',
  radius: 'sm',
  iconPosition: 'end',
})

const attrs = useAttrs()

const buttonClasses = computed(() => [
  'button-link',
  `tone-${props.tone}`,
  `variant-${props.variant}`,
  `size-${props.size}`,
  `radius-${props.radius}`,
])

const isRouteObject = computed(() => typeof props.to === 'object' && props.to !== null)

const stringDestination = computed(() => {
  if (typeof props.to === 'string') {
    return props.to
  }

  return props.href
})

const isAbsoluteUrl = computed(() => {
  const value = stringDestination.value

  return typeof value === 'string' && (/^[a-z][a-z\d+.-]*:/i.test(value) || value.startsWith('//'))
})

const usesRouterLink = computed(() => {
  if (isRouteObject.value) {
    return true
  }

  return !props.external && !isAbsoluteUrl.value
})

const routerDestination = computed<RouteLocationRaw>(() => props.to ?? props.href ?? '/')
const anchorHref = computed(() => stringDestination.value ?? '#')
const linkTarget = computed(() => props.target ?? (props.external ? '_blank' : undefined))
const linkRel = computed(
  () => props.rel ?? (linkTarget.value === '_blank' ? 'noopener noreferrer' : undefined),
)
</script>

<style scoped lang="scss">
$button-tones: (
  primary: primary,
  neutral: neutral,
  success: success,
  warning: warning,
  danger: danger,
  info: info,
);

$button-sizes: (
  sm: (
    height: space(6),
    padding-x: space(2),
    font-size: font-size(sm),
    icon: 0.9em,
    line-height: ui-line-height(tight),
  ),
  md: (
    height: space(8),
    padding-x: space(3),
    font-size: font-size(base),
    icon: 1em,
    line-height: ui-line-height(normal),
  ),
  lg: (
    height: space(10),
    padding-x: space(4),
    font-size: font-size(h5),
    icon: 1.1em,
    line-height: ui-line-height(normal),
  ),
  xl: (
    height: space(12),
    padding-x: space(5),
    font-size: font-size(h4),
    icon: 1.15em,
    line-height: ui-line-height(relaxed),
  ),
);

$button-radius: (
  none: 0,
  xs: border-radius(xs),
  sm: border-radius(sm),
  md: border-radius(md),
  lg: border-radius(lg),
  xl: border-radius(xl),
  xxl: border-radius(xxl),
  full: border-radius(pill),
);

.button-link {
  // BASE
  display: inline-flex;
  align-items: center;
  justify-content: center;

  position: relative;

  height: space(8);
  padding: 0 space(3);
  border-radius: var(--btn-radius, border-radius(sm));

  font: inherit;
  line-height: ui-line-height(normal);
  font-weight: font-weight(semibold);
  font-size: font-size(base);
  text-decoration: none;
  white-space: nowrap;

  appearance: none;
  border: var(--btn-border, 0);
  background: transparent;

  color: var(--btn-fg, color(text, primary));
  background-color: var(--btn-bg, transparent);

  cursor: pointer;
  user-select: none;

  & .button__label {
    display: inline-flex;
    align-items: center;
  }

  & .button__icon {
    flex: 0 0 auto;
  }

  & .button__content {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: space(2);
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 1px var(--btn-a2),
      0 0 0 3px var(--btn-focus-ring),
      0 0 8px 2px var(--btn-focus-ring);
  }
}

// SIZE
@each $size, $values in $button-sizes {
  .size-#{$size} {
    height: deep-get($values, height);
    padding: 0 deep-get($values, padding-x);
    font-size: deep-get($values, font-size);
    line-height: deep-get($values, line-height);

    &:deep(svg) {
      width: deep-get($values, icon);
      height: deep-get($values, icon);
    }
  }
}

// BORDER RADIUS
@each $radius, $value in $button-radius {
  .radius-#{$radius} {
    --btn-radius: #{$value};
  }
}

// TONE
@each $tone, $palette in $button-tones {
  .tone-#{$tone} {
    --btn-color-8: #{color(theme, #{$palette}, theme, 8)};
    --btn-color-9: #{color(theme, #{$palette}, theme, 9)};
    --btn-color-10: #{color(theme, #{$palette}, theme, 10)};
    --btn-color-11: #{color(theme, #{$palette}, theme, 11)};

    --btn-a1: #{color(theme, #{$palette}, theme-alpha, 1)};
    --btn-a2: #{color(theme, #{$palette}, theme-alpha, 2)};

    --btn-a3: #{color(theme, #{$palette}, theme-alpha, 3)};
    --btn-a4: #{color(theme, #{$palette}, theme-alpha, 4)};
    --btn-a5: #{color(theme, #{$palette}, theme-alpha, 5)};

    --btn-a6: #{color(theme, #{$palette}, theme-alpha, 6)};
    --btn-a7: #{color(theme, #{$palette}, theme-alpha, 7)};

    --btn-text: #{color(theme, #{$palette}, theme-alpha, 11)};
    --btn-solid-fg: #{color(theme, #{$palette}, solid-fg)};

    --btn-focus-ring: #{color(theme, #{$palette}, theme-alpha, 6)};
  }
}

// VARIANTS (SOLID)
.variant-solid {
  --btn-bg: var(--btn-color-9);
  --btn-fg: var(--btn-solid-fg);

  @media (hover: hover) {
    &:hover {
      --btn-bg: var(--btn-color-10);
    }
  }

  &:active {
    --btn-bg: var(--btn-color-11);
  }
}

// VARIANTS (SOFT)
.variant-soft {
  --btn-bg: var(--btn-a3);
  --btn-fg: var(--btn-text);

  @media (hover: hover) {
    &:hover {
      --btn-bg: var(--btn-a4);
    }
  }

  &:active {
    --btn-bg: var(--btn-a5);
  }
}

// VARIANTS (SURFACE)
.variant-surface {
  --btn-bg: var(--btn-a2);
  --btn-fg: var(--btn-text);
  --btn-border: 1px solid var(--btn-a6);

  @media (hover: hover) {
    &:hover {
      --btn-bg: var(--btn-a3);
      --btn-border: 1px solid var(--btn-a7);
    }
  }

  &:active {
    --btn-bg: var(--btn-a4);
    --btn-border: 1px solid var(--btn-color-8);
  }
}

// VARIANTS (OUTLINE)
.variant-outline {
  --btn-bg: transparent;
  --btn-fg: var(--btn-text);
  --btn-border: 1px solid var(--btn-color-8);

  @media (hover: hover) {
    &:hover {
      --btn-bg: var(--btn-a3);
    }
  }

  &:active {
    --btn-bg: var(--btn-a4);
  }
}

// VARIANTS (GHOST)
.variant-ghost {
  --btn-bg: transparent;
  --btn-fg: var(--btn-text);

  @media (hover: hover) {
    &:hover {
      --btn-bg: var(--btn-a4);
    }
  }

  &:active {
    --btn-bg: var(--btn-a5);
  }
}
</style>
