<template>
  <div class="app-frame">
    <!-- HEADER (TOP NAVIGATION) -->
    <header class="frame__header"></header>
    <!-- MAIN CONTENT -->
    <main class="frame__main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import RouterView from './RouterView.vue'
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
