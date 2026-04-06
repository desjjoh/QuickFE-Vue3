<template>
  <div class="app-frame">
    <main data-app-shell-scroll ref="contentRef" class="frame__main">
      <header class="frame__header">
        <NavBar>
          <template #start>
            <IconButton :icon="Menu" variant="ghost" tone="neutral" />
            <BrandNavigation />
            <MainNavigation :routes="mainNavigation" />
            <MoreDropdown :routes="moreNavigation" />
          </template>
          <template #end>
            <LanguageDropdown content-align="end" />
            <template v-if="!isAuthenticated">
              <BaseButton variant="soft" tone="neutral" @click="signIn">
                {{ $t('auth.signIn.actions.submit') }}
              </BaseButton>

              <BaseButton variant="outline" @click="register">
                {{ $t('auth.signIn.actions.createAccount') }}
              </BaseButton>
            </template>

            <UserDropdown content-align="end" />
          </template>
        </NavBar>
      </header>

      <RouterView />
      <ScrollToTopButton :scroll-ref="contentRef" />
      <ToastHost :scroll-ref="contentRef" />
    </main>
  </div>

  <BaseModal />
</template>

<script setup lang="ts">
import { provide, ref, type Ref } from 'vue'
import { Menu } from 'lucide-vue-next'

import { APP_SHELL_SCROLL_REF_KEY } from '@/helpers/window'

import ToastHost from '@/shared/components/toasts/ToastHost.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import RouterView from '@/shared/components/router/RouterView.vue'
import BaseModal from '@/shared/components/modal/BaseModal.vue'
import IconButton from '@/shared/components/buttons/IconButton.vue'

import NavBar from './layouts/NavBar.vue'

import BrandNavigation from './widgets/BrandNavigation.vue'
import MainNavigation from './widgets/MainNavigation.vue'
import MoreDropdown from './widgets/MoreDropdown.vue'
import ScrollToTopButton from './widgets/ScrollToTopButton.vue'
import LanguageDropdown from './widgets/LanguageDropdown.vue'

import { useAuthActions } from './hooks/useAuthActions'

import { mainNavigation, moreNavigation } from './constants/navigation'
import UserDropdown from './widgets/UserDropdown.vue'

const { signIn, register } = useAuthActions()

const contentRef: Ref<HTMLElement | null> = ref<HTMLElement | null>(null)
const isAuthenticated = ref<boolean>(false)

provide(APP_SHELL_SCROLL_REF_KEY, contentRef)
</script>

<style scoped lang="scss">
.app-frame {
  height: 100dvh;
  width: 100%;

  max-width: 100%;

  overflow: hidden;

  & .frame__main {
    min-width: 0;
    height: 100%;

    display: flex;
    flex-direction: column;
    flex: 1 1 auto;

    overflow: auto;

    & .frame__header {
      position: sticky;

      height: $masthead-height;

      top: 0;
      left: 0;
      right: 0;

      z-index: z-index(floating);
      flex-shrink: 0;
    }
  }
}
</style>
