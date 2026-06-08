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
        <MenuRouter :to="{ name: 'settings' }">
          <InlineText>{{ $t('app.routes.profile') }}</InlineText>
          <UserStar />
        </MenuRouter>

        <MenuRouter :to="{ name: 'settings' }">
          <InlineText>{{ $t('app.routes.settings') }}</InlineText>
          <Settings />
        </MenuRouter>

        <MenuSeperator />

        <MenuButton @click="openRight">
          <InlineText>{{ $t('app.actions.help') }}</InlineText>
          <CircleQuestionMark />
        </MenuButton>

        <MenuButton @click="openRight">
          <InlineText>{{ $t('app.actions.sendfeedback') }}</InlineText>
          <MessageSquareWarning />
        </MenuButton>

        <MenuSeperator />

        <MenuButton tone="warning" @click="signOut">
          <InlineText>{{ $t('auth.signOut.actions.submit') }}</InlineText>
          <LogOut />
        </MenuButton>
      </MenuViewport>
    </template>
  </DropdownMenu>
</template>

<script setup lang="ts">
import {
  CircleQuestionMark,
  LogOut,
  MessageSquareWarning,
  Settings,
  User,
  UserStar,
} from 'lucide-vue-next'

import OffcanvasExamplePanel from '@/views/playground/components/OffcanvasExamplePanel.vue'

import IconButton from '@/shared/components/buttons/IconButton.vue'
import DropdownMenu from '@/shared/components/dropdowns/BaseDropdown.vue'

import MenuViewport from '@/shared/components/dropdowns/MenuViewport.vue'
import MenuButton from '@/shared/components/dropdowns/MenuButton.vue'

import type { Align } from '@/shared/types/components/dropdowns'
import type { Size } from '@/shared/types/components/buttons'
import MenuSeperator from '@/shared/components/dropdowns/MenuSeperator.vue'
import MenuRouter from '@/shared/components/dropdowns/MenuRouter.vue'

import { useAppActions } from '../../hooks/useAppActions'
import InlineText from '@/shared/components/text/InlineText.vue'
import { useOffcanvas } from '@/stores/offcanvas'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { signOut } = useAppActions(t)

const offcanvas = useOffcanvas()

type props = { contentAlign?: Align; size?: Size }
withDefaults(defineProps<props>(), { contentAlign: 'start', size: 'md' })

function openRight(): void {
  offcanvas.open({
    view: OffcanvasExamplePanel,
    side: 'right',
    size: 'sm',
    key: 'offcanvas-right',
  })
}
</script>
