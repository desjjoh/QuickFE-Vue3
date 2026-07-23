<template>
  <DropdownMenu :content-align="contentAlign">
    <template #trigger="{ toggle, triggerAttrs }">
      <ImageButton
        :src="user.profile.media.avatar?.url"
        :fallback="user.getInitials()"
        :alt="user.profile.media.avatar?.alt_text ?? $t('accessibility.userAvatar')"
        :size="size"
        radius="full"
        v-bind="triggerAttrs"
        @click="toggle"
      />
    </template>

    <template #default>
      <MenuViewport>
        <MenuRouter :to="{ name: 'profile' }">
          <InlineText>{{ $t('app.routes.profile') }}</InlineText>
          <UserStar />
        </MenuRouter>

        <MenuSeperator />

        <MenuButton @click="openRight">
          <InlineText>{{ $t('app.actions.sendfeedback') }}</InlineText>
          <MessageSquareWarning />
        </MenuButton>

        <MenuRouter :to="{ name: 'settings' }">
          <InlineText>{{ $t('app.routes.settings') }}</InlineText>
          <Settings />
        </MenuRouter>

        <MenuSeperator />

        <MenuButton tone="warning" @click="handleSignOut">
          <InlineText>{{ $t('auth.signOut.actions.submit') }}</InlineText>
          <LogOut />
        </MenuButton>
      </MenuViewport>
    </template>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { LogOut, MessageSquareWarning, Settings, UserStar } from 'lucide-vue-next'

import OffcanvasExamplePanel from '@/views/playground/components/OffcanvasExamplePanel.vue'

import DropdownMenu from '@/shared/components/dropdowns/BaseDropdown.vue'

import MenuViewport from '@/shared/components/dropdowns/MenuViewport.vue'
import MenuButton from '@/shared/components/dropdowns/MenuButton.vue'

import type { Align } from '@/library/types/components/dropdowns'
import type { Size } from '@/library/types/components/buttons'
import MenuSeperator from '@/shared/components/dropdowns/MenuSeperator.vue'
import MenuRouter from '@/shared/components/dropdowns/MenuRouter.vue'

import { useAppActions } from '@/app/hooks/useAppActions'
import InlineText from '@/shared/components/text/InlineText.vue'
import { useOffcanvas } from '@/stores/offcanvas'
import { useI18n } from 'vue-i18n'
import ImageButton from '@/shared/components/buttons/ImageButton.vue'
import type { UserDto } from '@/library/models/user'

const { t } = useI18n()

const { signOut } = useAppActions(t)

const offcanvas = useOffcanvas()

type MaybePromise<T> = T | Promise<T>

type props = {
  contentAlign?: Align
  size?: Size
  user: UserDto
  onSignOut?: () => MaybePromise<void>
}
const props = withDefaults(defineProps<props>(), { contentAlign: 'start', size: 'sm' })

async function handleSignOut(): Promise<void> {
  const signOutHandler = props.onSignOut ?? signOut

  await Promise.resolve(signOutHandler())
}

function openRight(): void {
  offcanvas.open({
    view: OffcanvasExamplePanel,
    side: 'right',
    size: 'sm',
    key: 'offcanvas-right',
  })
}
</script>
