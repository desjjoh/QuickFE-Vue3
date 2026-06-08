<template>
  <RouterComponent>
    <template #error="{ error, reset }">
      <ErrorSplashView :error="error" :reset="reset" />
    </template>
    <template #loading>
      <InitializingSplashView />
    </template>
  </RouterComponent>
</template>

<script setup lang="ts">
import RouterComponent from '@/router/components/RouterComponent.vue'

import { useDynamicPageTitle } from '@/shared/hooks/useDynamicTitle'
import InitializingSplashView from './shared/pages/splash/InitializingSplashView.vue'
import ErrorSplashView from './shared/pages/splash/ErrorSplashView.vue'

useDynamicPageTitle()
</script>
