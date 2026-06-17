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

import InitializingSplashView from '@/shared/pages/InitializingSplashView.vue'
import ErrorSplashView from '@/shared/pages/ErrorSplashView.vue'

useDynamicPageTitle()
</script>
