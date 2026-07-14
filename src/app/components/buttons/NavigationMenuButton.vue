<template>
  <IconButton
    :icon="Menu"
    tone="neutral"
    variant="ghost"
    :label="$t('accessibility.openNavigationMenu')"
    @click="openNavigationMenu"
  />
</template>

<script setup lang="ts">
import { Menu } from 'lucide-vue-next'

import { useOffcanvas, type OffcanvasStore } from '@/stores/offcanvas'
import IconButton from '@/shared/components/buttons/IconButton.vue'

import AppNavigationOffcanvas from '../offcanvas/AppNavigationOffcanvas.vue'
import { mainNavigation, moreNavigation, userNavigation } from '../../config/navigation.ts'

import type { UserDto } from '@/library/models/user.ts'
import { type RouteLocationNormalizedLoadedGeneric, useRoute } from 'vue-router'
import { useAuthStore, type AuthStore } from '@/stores/auth.ts'
import { computed } from 'vue'

const route: RouteLocationNormalizedLoadedGeneric = useRoute()
const authStore: AuthStore = useAuthStore()
const offcanvas: OffcanvasStore = useOffcanvas()

const isAuthenticated = computed<boolean>(() => authStore.isAuthenticated)
const authenticatedUser = computed<UserDto | null>(() => authStore.user)
const isGuestRoute = computed<boolean>(() => route.meta.isGuestRoute ?? false)

function openNavigationMenu(): void {
  offcanvas.open({
    view: AppNavigationOffcanvas,
    side: 'left',
    size: 'sm',
    key: 'app-navigation',
    props: {
      mainRoutes: mainNavigation,
      moreRoutes: moreNavigation,
      userRoutes: userNavigation,
      isGuestRoute: isGuestRoute.value,
      isAuthenticated: isAuthenticated.value,
      user: authenticatedUser.value,
    },
  })
}
</script>
