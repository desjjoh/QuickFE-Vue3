<template>
  <div class="app-frame">
    <main data-app-shell-scroll ref="contentRef" class="frame__main">
      <!-- MASTHEAD -->
      <header class="frame__header">
        <NavBar :centered="!isDesktop">
          <template #start>
            <NavigationMenuButton v-if="!isDesktop" />

            <template v-else-if="isDesktop">
              <BrandNavigation />

              <MainNavigation :routes="mainNavigation" />
              <MoreDropdown :routes="moreNavigation" />
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

      <RouteAccessGuard :key="contentKey">
        <RouterComponent>
          <template #error="{ error, reset }">
            <ErrorSplashView :error="error" :reset="reset" />
          </template>
        </RouterComponent>
      </RouteAccessGuard>
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
import { computed, nextTick, onMounted, provide, ref, watch, type Ref } from 'vue'

import { useAuthStore, type AuthStore } from '@/shared/stores/auth'
import { APP_SHELL_SCROLL_REF_KEY } from '@/shared/helpers/window'

import RouterComponent from '@/library/components/routers/RouterComponent.vue'

import ToastHost from '@/library/components/toasts/ToastHost.vue'
import ModalHost from '@/library/components/modal/ModalHost.vue'
import OffcanvasHost from '@/library/components/offcanvas/OffcanvasHost.vue'

import { useAppActions } from '@/app/hooks/useAppActions'
import { mainNavigation, moreNavigation } from './config/navigation'

import NavBar from '@/library/components/navbar/NavBar.vue'

import ScrollToTopButton from './widgets/buttons/ScrollToTopButton.vue'
import BrandNavigation from './widgets/navigation/BrandNavigation.vue'
import MainNavigation from './widgets/navigation/MainNavigation.vue'
import MoreDropdown from './widgets/dropdowns/MoreDropdown.vue'
import LanguageDropdown from './widgets/dropdowns/LanguageDropdown.vue'
import UserDropdown from './widgets/dropdowns/UserDropdown.vue'
import SignInButton from './widgets/buttons/SignInButton.vue'
import CreateAccountButton from './widgets/buttons/CreateAccountButton.vue'
import RouteAccessGuard from '@/router/guards/RouteAccessGuard.vue'
import type { UserDto } from '@/library/models/user.ts'
import ThemeToggle from './widgets/buttons/ThemeToggle.vue'
import NavigationMenuButton from './widgets/buttons/NavigationMenuButton.vue'
import { useViewport } from '@/shared/hooks/useViewport.ts'
import FlexBox from '@/library/components/flex/FlexBox.vue'
import ErrorSplashView from '@/library/components/splash/ErrorSplashView.vue'

const { t } = useI18n()
const { initialize } = useAppActions(t)
const { isDesktop } = useViewport()

const route: RouteLocationNormalizedLoadedGeneric = useRoute()
const authStore: AuthStore = useAuthStore()

const contentRef: Ref<HTMLElement | null> = ref<HTMLElement | null>(null)

const isAuthenticated = computed<boolean>(() => authStore.isAuthenticated)
const authenticatedUser = computed<UserDto | null>(() => authStore.user)
const shouldShowScrollToTop = computed<boolean>(() => route.meta.scrollToTop ?? false)
const isGuestRoute = computed<boolean>(() => route.meta.isGuestRoute ?? false)
const contentKey = computed<string>(() => String(route.meta.contentKey ?? route.name ?? route.path))

function scrollContentToTop(): void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  contentRef.value?.scrollTo({
    top: 0,
    left: 0,
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  })
}

onMounted(() => {
  scrollContentToTop()
})

watch(
  () => route.path,
  () => {
    void nextTick(scrollContentToTop)
  },
  { flush: 'post' },
)

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
    overflow-y: scroll;

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
