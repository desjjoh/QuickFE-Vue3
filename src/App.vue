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
import { useDynamicPageTitle } from '@/shared/hooks/useDynamicTitle'

import RouterComponent from '@/shared/components/routers/RouterComponent.vue'

import InitializingSplashView from '@/shared/components/splash/InitializingSplashView.vue'
import ErrorSplashView from '@/shared/components/splash/ErrorSplashView.vue'

useDynamicPageTitle()
</script>
