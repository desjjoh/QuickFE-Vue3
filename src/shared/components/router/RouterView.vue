<template>
  <RouterView v-slot="{ Component }">
    <template v-if="Component">
      <ErrorBoundary>
        <!-- SUSPENSE + LOADING FALLBACK -->
        <Suspense>
          <template #default>
            <component :is="Component" />
          </template>

          <template #fallback>
            <slot name="loading" v-if="$slots.loading"> </slot>
            <template v-else>
              {{ $t('common.loading') }}
            </template>
          </template>
        </Suspense>

        <!-- ERROR FALLBACK -->
        <template #error="{ error }">
          <slot name="error" v-if="$slots.error" :error="error"></slot>
          <template v-else>
            {{ error }}
          </template>
        </template>
      </ErrorBoundary>
    </template>
  </RouterView>
</template>

<script setup lang="ts">
import ErrorBoundary from '@/shared/layouts/ErrorBoundary.vue'
import { RouterView } from 'vue-router'
</script>
