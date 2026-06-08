<template>
  <div class="app-frame">
    <main data-app-shell-scroll ref="contentRef" class="frame__main">
      <!-- MASTHEAD -->
      <header class="frame__header">
        <NavBar>
          <template #start>
            <IconButton :icon="Menu" tone="neutral" variant="ghost" />

            <BrandNavigation />

            <template v-if="!isGuestRoute">
              <MainNavigation :routes="mainNavigation" />
              <MoreDropdown :routes="moreNavigation" />
            </template>
          </template>
          <template #end>
            <LanguageDropdown content-align="end" />

            <template v-if="!isGuestRoute">
              <template v-if="!isAuthenticated">
                <CreateAccountButton />
                <SignInButton />
              </template>

              <template v-else>
                <UserDropdown content-align="end" />
              </template>
            </template>
          </template>
        </NavBar>
      </header>

      <!-- CONTENT -->
      <UnauthorizedView
        v-if="isUnauthorized"
        :eyebrow="$t('errors.unauthorized.eyebrow')"
        :title="$t('errors.unauthorized.title')"
        :msg="$t('errors.unauthorized.message')"
      />
      <UnauthorizedView
        v-else-if="isForbidden"
        :eyebrow="$t('errors.forbidden.eyebrow')"
        :title="$t('errors.forbidden.title')"
        :msg="$t('errors.forbidden.message')"
      />

      <RouterComponent v-else :key="contentKey" />
    </main>
  </div>

  <!-- GLOBAL UI ELEMENTS -->
  <ScrollToTopButton v-if="shouldShowScrollToTop" :scroll-ref="contentRef" />
  <ToastHost :scroll-ref="contentRef" />
  <ModalHost />
  <OffcanvasHost />
</template>

<script setup lang="ts">
import { useRoute, type RouteLocationNormalizedLoadedGeneric } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { computed, provide, ref, type Ref } from 'vue'

import { useAuthStore, type AuthStore } from '@/stores/auth'
import { APP_SHELL_SCROLL_REF_KEY } from '@/helpers/window'

import RouterComponent from '@/router/components/RouterComponent.vue'

import ToastHost from '@/shared/components/toasts/ToastHost.vue'
import ModalHost from '@/shared/components/modal/ModalHost.vue'
import OffcanvasHost from '@/shared/components/offcanvas/OffcanvasHost.vue'

import { useAppActions } from './hooks/useAppActions'
import { mainNavigation, moreNavigation } from './constants/navigation'

import NavBar from './layouts/NavBar.vue'

import ScrollToTopButton from './widgets/buttons/ScrollToTopButton.vue'
import BrandNavigation from './widgets/navigation/BrandNavigation.vue'
import MainNavigation from './widgets/navigation/MainNavigation.vue'
import MoreDropdown from './widgets/dropdowns/MoreDropdown.vue'
import LanguageDropdown from './widgets/dropdowns/LanguageDropdown.vue'
import UserDropdown from './widgets/dropdowns/UserDropdown.vue'
import SignInButton from './widgets/buttons/SignInButton.vue'
import CreateAccountButton from './widgets/buttons/CreateAccountButton.vue'
import IconButton from '@/shared/components/buttons/IconButton.vue'
import { Menu } from 'lucide-vue-next'
import UnauthorizedView from '@/shared/pages/splash/UnauthorizedView.vue'

const { t } = useI18n()
const { initialize } = useAppActions(t)

const route: RouteLocationNormalizedLoadedGeneric = useRoute()
const authStore: AuthStore = useAuthStore()

const contentRef: Ref<HTMLElement | null> = ref<HTMLElement | null>(null)

const isAuthenticated = computed<boolean>(() => authStore.isAuthenticated)
const shouldShowScrollToTop = computed<boolean>(() => route.meta.scrollToTop ?? false)
const requiresAuth = computed<boolean>(() => route.meta.requiresAuth ?? false)
const isGuestRoute = computed<boolean>(() => route.meta.isGuestRoute ?? false)

const requiredRoles = computed<string[]>(() => route.meta.requiredRoles ?? [])

const contentKey = computed<string>(() => String(route.meta.contentKey ?? route.name ?? route.path))

const isUnauthorized = computed<boolean>(() => {
  if (!requiresAuth.value) return false

  return !isAuthenticated.value
})

const isForbidden = computed<boolean>(() => {
  if (!requiredRoles.value.length) return false
  if (!isAuthenticated.value) return false

  return !authStore.hasRequiredRole(requiredRoles.value)
})

await initialize()

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
