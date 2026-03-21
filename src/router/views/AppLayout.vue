<template>
  <div class="app-frame">
    <!-- HEADER (TOP NAVIGATION) -->
    <header class="frame__header">
      <NavBar>
        <template #end>
          <!-- LANGUAGES -->
          <LanguageDropdown content-align="end" />

          <!-- ACTIONS (UNAUTHENTICATED) -->
          <template v-if="!isAuthenticated">
            <BaseButton variant="soft" tone="neutral">
              {{ $t('auth.signIn.actions.submit') }}
            </BaseButton>

            <BaseButton variant="outline">
              {{ $t('auth.signIn.actions.createAccount') }}
            </BaseButton>
          </template>
        </template>
      </NavBar>
    </header>

    <!-- MAIN CONTENT -->
    <main class="frame__main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import NavBar from '@/shared/components/navbar/NavBar.vue'
import LanguageDropdown from '@/shared/widgets/LanguageDropdown.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'

import RouterView from './RouterView.vue'

const isAuthenticated = ref<boolean>(false)
</script>

<style scoped lang="scss">
.app-frame {
  min-height: 100dvh;

  display: grid;
  grid-template-rows: auto 1fr;

  & .frame__header {
    position: sticky;
    top: 0;
    z-index: 100;
  }

  & .frame__main {
    display: flex;
    flex-direction: column;

    overflow: auto;

    min-height: 0;
    min-width: fit-content;
  }
}
</style>
