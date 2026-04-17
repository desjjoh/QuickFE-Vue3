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
                <FlexBox class="loading" align-items="center">
                  <BlockText tone="inherit">{{ $t('common.loading') }}</BlockText>
                </FlexBox>
              </div>
            </template>
          </template>
        </Suspense>

        <!-- ERROR FALLBACK -->
        <template #error="{ error }">
          <slot name="error" v-if="$slots.error" :error="error"></slot>
          <template v-else>
            <div class="container">
              <ErrorContainer>{{ error }}</ErrorContainer>
            </div>
          </template>
        </template>
      </ErrorBoundary>
    </template>
  </RouterView>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'

import ErrorContainer from '@/shared/components/error/ErrorContainer.vue'
import ErrorBoundary from '@/shared/components/error/ErrorBoundary.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  height: 100%;
  display: grid;
  place-items: center;
  padding: space(5);
}

.error {
  padding: space(3);

  background-color: color(theme, danger, dark-alpha, 2);
  color: color(theme, danger, dark-alpha, 11);

  border: 1px dashed color(theme, danger, dark-alpha, 11);
  border-radius: border-radius(md);

  max-width: space(125);

  user-select: none;

  :deep(svg) {
    flex: none;

    height: 1em;
    width: 1em;
  }
}

.loading {
  padding: space(3);

  background-color: color(theme, neutral, dark-alpha, 2);
  color: color(theme, neutral, dark-alpha, 11);

  border: 1px dashed color(theme, neutral, dark-alpha, 11);
  border-radius: border-radius(md);

  max-width: space(125);

  user-select: none;
}
</style>
