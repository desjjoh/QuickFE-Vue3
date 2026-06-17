<template>
  <DropdownMenu>
    <template #trigger="{ toggle, triggerAttrs }">
      <IconButton
        v-bind="triggerAttrs"
        :icon="EllipsisVertical"
        tone="neutral"
        variant="ghost"
        @click="toggle"
      />
    </template>

    <template #default>
      <MenuViewport>
        <MenuRouter v-for="(route, idx) in routes" :to="route.to" :key="idx">
          {{ $t(route.label) }}
        </MenuRouter>
      </MenuViewport>
    </template>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { EllipsisVertical } from 'lucide-vue-next'

import DropdownMenu from '@/shared/components/dropdowns/BaseDropdown.vue'
import MenuViewport from '@/shared/components/dropdowns/MenuViewport.vue'
import IconButton from '@/shared/components/buttons/IconButton.vue'
import MenuRouter from '@/shared/components/dropdowns/MenuRouter.vue'

import { type iRoute } from '../../config/navigation'

const { routes } = defineProps<{ routes: iRoute[] }>()
</script>
