<template>
  <div class="app-frame">
    <!-- HEADER (TOP NAVIGATION) -->
    <header class="frame__header">
      <NavBar>
        <template #end>
          <LanguageDropdown />
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
import NavBar from '@/shared/components/navbar/NavBar.vue'
import RouterView from './RouterView.vue'
import LanguageDropdown from '@/shared/widgets/LanguageDropdown.vue'
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
