<template>
  <div class="app-frame">
    <main data-app-shell-scroll ref="contentRef" class="frame__main">
      <header class="frame__header">
        <NavBar>
          <template #start>
            <IconButton :icon="Menu" variant="ghost" tone="neutral" @click="openLeft" />
            <BrandNavigation />
            <MainNavigation :routes="mainNavigation" />
            <MoreDropdown :routes="moreNavigation" />
          </template>
          <template #end>
            <LanguageDropdown content-align="end" />

            <template v-if="!isAuthenticated">
              <BaseButton variant="soft" @click="register">
                {{ $t('auth.signIn.actions.createAccount') }}
              </BaseButton>

              <BaseButton @click="signIn">
                {{ $t('auth.signIn.actions.submit') }}
              </BaseButton>
            </template>
            <template v-else>
              <UserDropdown content-align="end" />
            </template>
          </template>
        </NavBar>
      </header>

      <RouterView />
    </main>
  </div>

  <ScrollToTopButton v-if="shouldShowScrollToTop" :scroll-ref="contentRef" />
  <ToastHost :scroll-ref="contentRef" />
  <ModalHost />
  <OffcanvasHost />
</template>

<script setup lang="ts">
import { computed, provide, ref, type Ref } from 'vue'
import { Menu } from 'lucide-vue-next'

import { useOffcanvas } from '@/stores/offcanvas'
import { APP_SHELL_SCROLL_REF_KEY } from '@/helpers/window'

import OffcanvasExamplePanel from '@/views/playground/components/OffcanvasExamplePanel.vue'

import ToastHost from '@/shared/components/toasts/ToastHost.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import RouterView from '@/shared/components/router/RouterView.vue'
import ModalHost from '@/shared/components/modal/ModalHost.vue'
import IconButton from '@/shared/components/buttons/IconButton.vue'
import OffcanvasHost from '@/shared/components/offcanvas/OffcanvasHost.vue'

import NavBar from './layouts/NavBar.vue'

import BrandNavigation from './widgets/navigation/BrandNavigation.vue'
import MainNavigation from './widgets/navigation/MainNavigation.vue'
import MoreDropdown from './widgets/dropdowns/MoreDropdown.vue'
import LanguageDropdown from './widgets/dropdowns/LanguageDropdown.vue'
import UserDropdown from './widgets/dropdowns/UserDropdown.vue'

import { useAuthActions } from './hooks/useAuthActions'
import { mainNavigation, moreNavigation } from './constants/navigation'

import ScrollToTopButton from './widgets/buttons/ScrollToTopButton.vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

// Important design choice

// I would not do role checks with permissions here yet if your routes are currently role-based.

// Use roles for route gating first.
// Keep permission checks for component/action-level control later.

// That keeps the route system simpler.

const { t } = useI18n()

const authStore = useAuthStore()

const route = useRoute()
const offcanvas = useOffcanvas()

const { signIn, register } = useAuthActions(t)

const contentRef: Ref<HTMLElement | null> = ref<HTMLElement | null>(null)
const isAuthenticated = computed<boolean>(() => authStore.isAuthenticated)

const shouldShowScrollToTop = computed<boolean>(() => route.meta.scrollToTop === true)

function openLeft(): void {
  offcanvas.open({
    view: OffcanvasExamplePanel,
    side: 'left',
    size: 'sm',
    key: 'offcanvas-left',
  })
}

await authStore.initialize()

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
