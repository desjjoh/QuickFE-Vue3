<template>
  <RouterLink
    :to="{ name: to }"
    class="tab"
    :class="[tone && `tone-${tone}`]"
    activeClass="active"
    role="tab"
  >
    <span>
      <slot></slot>
    </span>
  </RouterLink>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { assertDefined } from '@/shared/helpers/assert'
import { type TabsContext, TabsKey } from './tabs'

defineProps<{
  to: string
}>()

const context: TabsContext | undefined = inject(TabsKey)!
assertDefined(context, 'Tab must be used inside <TabLayout>')

const { tone } = context
</script>
