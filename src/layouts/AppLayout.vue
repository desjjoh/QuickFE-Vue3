<template>
  <div class="app-frame">
    <header class="frame__header"></header>

    <main class="frame__main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.app-frame {
  min-height: 100dvh;
  display: grid;
  grid-template-rows: auto 1fr;

  .frame__header {
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .frame__main {
    overflow: auto;
  }
}
</style>
