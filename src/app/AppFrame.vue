<template>
  <div class="app-frame">
    <main data-app-shell-scroll ref="contentRef" class="frame__main">
      <!-- MASTHEAD -->
      <header class="frame__header">
        <NavBar :centered="!isDesktop">
          <template #start>
            <NavigationMenuButton v-if="!isDesktop" />
            <template v-else>
              <BrandNavigation />

              <template v-if="!isGuestRoute">
                <MainNavigation :routes="mainNavigation" />
                <MoreDropdown :routes="moreNavigation" />
              </template>
            </template>
          </template>

          <template #center>
            <BrandNavigation hide-text v-if="!isDesktop" />
          </template>

          <template #end>
            <FlexBox v-if="isDesktop" :gap="2">
              <ThemeToggle />
              <LanguageDropdown content-align="end" />
            </FlexBox>

            <template v-if="!isGuestRoute">
              <FlexBox v-if="!isAuthenticated && isDesktop" :gap="2">
                <CreateAccountButton />
                <SignInButton />
              </FlexBox>

              <template v-else-if="authenticatedUser">
                <UserDropdown content-align="end" :user="authenticatedUser" />
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

      <RouterComponent v-else :key="contentKey">
        <template #error="{ error, reset }">
          <ErrorSplashView :error="error" :reset="reset" />
        </template>

        <template #loading>
          <FullContainer>
            <SpinnerComponent />
          </FullContainer>
        </template>
      </RouterComponent>
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

import RouterComponent from '@/shared/components/routers/RouterComponent.vue'

import ToastHost from '@/shared/components/toasts/ToastHost.vue'
import ModalHost from '@/shared/components/modal/ModalHost.vue'
import OffcanvasHost from '@/shared/components/offcanvas/OffcanvasHost.vue'

import { useAppActions } from '@/app/hooks/useAppActions'
import { mainNavigation, moreNavigation } from './config/navigation'

import NavBar from '@/shared/components/navbar/NavBar.vue'

import ScrollToTopButton from './components/buttons/ScrollToTopButton.vue'
import BrandNavigation from './components/navigation/BrandNavigation.vue'
import MainNavigation from './components/navigation/MainNavigation.vue'
import MoreDropdown from './components/dropdowns/MoreDropdown.vue'
import LanguageDropdown from './components/dropdowns/LanguageDropdown.vue'
import UserDropdown from './components/dropdowns/UserDropdown.vue'
import SignInButton from './components/buttons/SignInButton.vue'
import CreateAccountButton from './components/buttons/CreateAccountButton.vue'
import UnauthorizedView from '@/shared/pages/UnauthorizedView.vue'
import type { UserDto } from '@/shared/models/user.ts'
import ThemeToggle from './components/buttons/ThemeToggle.vue'
import NavigationMenuButton from './components/buttons/NavigationMenuButton.vue'
import { useViewport } from '@/shared/hooks/useViewport.ts'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import ErrorSplashView from '@/shared/pages/ErrorSplashView.vue'

import FullContainer from '@/shared/components/container/FullContainer.vue'
import SpinnerComponent from '@/shared/components/progress/SpinnerComponent.vue'

const { t } = useI18n()
const { initialize } = useAppActions(t)
const { isDesktop } = useViewport()

const route: RouteLocationNormalizedLoadedGeneric = useRoute()
const authStore: AuthStore = useAuthStore()

const contentRef: Ref<HTMLElement | null> = ref<HTMLElement | null>(null)

const isAuthenticated = computed<boolean>(() => authStore.isAuthenticated)
const authenticatedUser = computed<UserDto | null>(() => authStore.user)
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
