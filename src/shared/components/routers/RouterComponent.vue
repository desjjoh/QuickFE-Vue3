<template>
  <RouterView v-slot="{ Component }">
    <template v-if="Component">
      <ErrorBoundary :key="routerViewKey">
        <!-- SUSPENSE + LOADING FALLBACK -->
        <Suspense>
          <template #default>
            <component :is="Component" />
          </template>

          <template #fallback>
            <slot name="loading" v-if="$slots.loading"> </slot>
            <template v-else>
              <FullContainer>
                <BlockText class="loading" tone="inherit">
                  {{ $t('common.loading') }}
                </BlockText>
              </FullContainer>
            </template>
          </template>
        </Suspense>

        <!-- ERROR FALLBACK -->
        <template #error="{ error }">
          <slot name="error" v-if="$slots.error" :error="error" :reset="resetRouterView"></slot>
          <template v-else>
            <FullContainer>
              <BlockText class="error" tone="inherit">
                {{ error }}
              </BlockText>
            </FullContainer>
          </template>
        </template>
      </ErrorBoundary>
    </template>
  </RouterView>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'

import ErrorBoundary from '@/shared/components/error/ErrorBoundary.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import FullContainer from '@/shared/components/container/FullContainer.vue'

const routerViewKey = ref(Date.now())

function resetRouterView(): void {
  routerViewKey.value = Date.now()
}
</script>

<style lang="scss" scoped>
.loading {
  color: color(theme, neutral, theme-alpha, 11);
  max-width: space(125);
}

.error {
  color: color(theme, danger, theme-alpha, 11);
  max-width: space(125);
}
</style>
