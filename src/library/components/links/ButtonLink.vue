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
        class="button__icon button__icon--start"
        aria-hidden="true"
        :stroke-width="3"
      />

      <span class="button__label">
        <slot></slot>
      </span>

      <component
        :is="icon"
        v-if="icon && iconPosition === 'end'"
        class="button__icon button__icon--end"
        aria-hidden="true"
        :stroke-width="3"
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
        class="button__icon button__icon--start"
        aria-hidden="true"
        :stroke-width="3"
      />

      <span class="button__label">
        <slot></slot>
      </span>

      <component
        :is="icon"
        v-if="icon && iconPosition === 'end'"
        class="button__icon button__icon--end"
        aria-hidden="true"
        :stroke-width="3"
      />
    </span>
  </a>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { Component, ComputedRef } from 'vue'
import { RouterLink } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

import type { Variant, Tone, Size, Radius } from '../buttons/buttons'

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
  icon: undefined,
  iconPosition: 'end',
})

const attrs = useAttrs()

const buttonClasses: ComputedRef<string[]> = computed<string[]>(() => [
  'button-link',
  `tone-${props.tone}`,
  `variant-${props.variant}`,
  `size-${props.size}`,
  `radius-${props.radius}`,
])

const isRouteObject: ComputedRef<boolean> = computed<boolean>(() => {
  return typeof props.to === 'object' && props.to !== null
})

const stringDestination: ComputedRef<string | undefined> = computed<string | undefined>(() => {
  if (typeof props.to === 'string') return props.to

  return props.href
})

const isAbsoluteUrl: ComputedRef<boolean> = computed<boolean>(() => {
  const value: string | undefined = stringDestination.value

  return typeof value === 'string' && (/^[a-z][a-z\d+.-]*:/i.test(value) || value.startsWith('//'))
})

const usesRouterLink: ComputedRef<boolean> = computed<boolean>(() => {
  if (isRouteObject.value) return true

  return !props.external && !isAbsoluteUrl.value
})

const routerDestination: ComputedRef<RouteLocationRaw> = computed<RouteLocationRaw>(() => {
  return props.to ?? props.href ?? '/'
})

const anchorHref: ComputedRef<string> = computed<string>(() => {
  return stringDestination.value ?? '#'
})

const linkTarget: ComputedRef<string | undefined> = computed<string | undefined>(() => {
  return props.target ?? (props.external ? '_blank' : undefined)
})

const linkRel: ComputedRef<string | undefined> = computed<string | undefined>(() => {
  return props.rel ?? (linkTarget.value === '_blank' ? 'noopener noreferrer' : undefined)
})
</script>

<style scoped lang="scss">
@use '@/library/styles/components' as button;

.button-link {
  @include button.interactive-control;
  @include button.states;
  text-decoration: none;
}

@include button.styles;
</style>
