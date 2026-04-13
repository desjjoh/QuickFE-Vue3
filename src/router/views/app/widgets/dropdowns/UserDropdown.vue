<template>
  <DropdownMenu :content-align="contentAlign">
    <template #trigger="{ toggle, triggerAttrs }">
      <IconButton
        :icon="User"
        tone="neutral"
        variant="soft"
        :size="size"
        v-bind="triggerAttrs"
        @click="toggle"
      />
    </template>

    <template #default>
      <MenuViewport>
        <MenuRouter :to="{ name: 'root' }">
          <InlineText>Settings</InlineText> <Settings />
        </MenuRouter>

        <MenuSeperator />

        <MenuButton tone="warning" @click="signOut">
          <InlineText>{{ $t('auth.signOut.actions.submit') }}</InlineText> <LogOut />
        </MenuButton>
      </MenuViewport>
    </template>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { LogOut, Settings, User } from 'lucide-vue-next'

import IconButton from '@/shared/components/buttons/IconButton.vue'
import DropdownMenu from '@/shared/components/dropdowns/BaseDropdown.vue'

import MenuViewport from '@/shared/components/dropdowns/MenuViewport.vue'
import MenuButton from '@/shared/components/dropdowns/MenuButton.vue'

import type { Size } from '@/shared/components/buttons/types'
import type { Align } from '@/shared/components/dropdowns/types'
import MenuSeperator from '@/shared/components/dropdowns/MenuSeperator.vue'
import MenuRouter from '@/shared/components/dropdowns/MenuRouter.vue'

import { useAuthActions } from '../../hooks/useAuthActions'
import InlineText from '@/shared/components/text/InlineText.vue'

const { signOut } = useAuthActions()

type props = { contentAlign?: Align; size?: Size }
withDefaults(defineProps<props>(), { contentAlign: 'start', size: 'md' })
</script>
