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
              <div class="container">
                <BlockText class="loading" tone="inherit">
                  {{ $t('common.loading') }}
                </BlockText>
              </div>
            </template>
          </template>
        </Suspense>

        <!-- ERROR FALLBACK -->
        <template #error="{ error }">
          <slot name="error" v-if="$slots.error" :error="error"></slot>
          <template v-else>
            <div class="container">
              <BlockText class="error" tone="inherit">
                {{ error }}
              </BlockText>
            </div>
          </template>
        </template>
      </ErrorBoundary>
    </template>
  </RouterView>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'

import ErrorBoundary from '@/shared/components/error/ErrorBoundary.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  height: 100%;
  display: grid;
  place-items: center;
  padding: space(5);
}

.loading {
  color: color(theme, neutral, dark-alpha, 11);
  max-width: space(125);
}

.error {
  color: color(theme, danger, dark-alpha, 11);
  max-width: space(125);
}
</style>
