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

        <MenuRouter :to="{ name: 'settings' }">
          <InlineText>{{ $t('app.routes.settings') }}</InlineText>
          <Settings />
        </MenuRouter>

        <MenuSeperator />

        <MenuRouter :disabled="administrationDisabled" :to="{ name: 'administration' }">
          <InlineText>{{ $t('app.routes.administration') }}</InlineText>
          <ShieldCheck />
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
import { useI18n } from 'vue-i18n'
import { LogOut, Settings, ShieldCheck, UserStar } from 'lucide-vue-next'
import { computed } from 'vue'

import { useAppActions } from '@/app/hooks/useAppActions'
import { ADMINISTRATION_ROLES } from '@/config/permissions'

import DropdownMenu from '@/library/components/dropdowns/BaseDropdown.vue'
import MenuViewport from '@/library/components/dropdowns/MenuViewport.vue'
import MenuButton from '@/library/components/dropdowns/MenuButton.vue'
import type { Align } from '@/library/components/dropdowns/dropdowns'
import type { Size } from '@/library/components/buttons/buttons'
import MenuSeperator from '@/library/components/dropdowns/MenuSeperator.vue'
import MenuRouter from '@/library/components/dropdowns/MenuRouter.vue'
import InlineText from '@/library/components/text/InlineText.vue'
import ImageButton from '@/library/components/buttons/ImageButton.vue'
import type { UserDto } from '@/library/models/user'

const { t } = useI18n()

const { signOut } = useAppActions(t)

type MaybePromise<T> = T | Promise<T>

type props = {
  contentAlign?: Align
  size?: Size
  user: UserDto
  onSignOut?: () => MaybePromise<void>
}
const props = withDefaults(defineProps<props>(), { contentAlign: 'start', size: 'sm' })

const administrationRoles = new Set<string>(Object.values(ADMINISTRATION_ROLES))

const administrationDisabled = computed<boolean>(() => {
  return !props.user.roles.some((role) => administrationRoles.has(role.key))
})

async function handleSignOut(): Promise<void> {
  const signOutHandler = props.onSignOut ?? signOut

  await Promise.resolve(signOutHandler())
}
</script>
