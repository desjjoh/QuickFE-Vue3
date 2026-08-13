<template>
  <PageLoadProgress />

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

import RouterComponent from '@/library/components/routers/RouterComponent.vue'
import PageLoadProgress from '@/library/components/progress/PageLoadProgress.vue'

import InitializingSplashView from '@/library/components/splash/InitializingSplashView.vue'
import ErrorSplashView from '@/library/components/splash/ErrorSplashView.vue'

useDynamicPageTitle()
</script>
