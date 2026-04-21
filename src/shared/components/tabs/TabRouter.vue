<template>
  <RouterLink
    :to="{ name: to }"
    class="tab"
    :class="[tone && `tone-${tone}`]"
    exactActiveClass="active"
    role="tab"
  >
    <span>
      <slot></slot>
    </span>
  </RouterLink>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { assertDefined } from '@/helpers/assert'
import { type TabsContext, TabsKey } from '@/shared/types/components/tabs'

defineProps<{
  to: string
}>()

const context: TabsContext | undefined = inject(TabsKey)!
assertDefined(context, 'Tab must be used inside <TabLayout>')

const { tone } = context
</script>
