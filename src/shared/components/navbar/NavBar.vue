<template>
  <nav class="nav-bar" :class="{ 'is-centered': centered }" aria-label="Primary navigation">
    <div class="nav-bar__start">
      <slot name="start"></slot>
    </div>

    <div class="nav-bar__center">
      <slot name="center"></slot>
    </div>

    <div class="nav-bar__end">
      <slot name="end"></slot>
    </div>
  </nav>
</template>

<script setup lang="ts">
type Props = {
  centered?: boolean
}

withDefaults(defineProps<Props>(), {
  centered: false,
})
</script>

<style scoped lang="scss">
.nav-bar {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: space(5);

  height: 100%;
  width: 100%;
  padding-inline: space(4);

  background-color: color(bg, canvas);
  box-shadow: 0 1px color(shadow, outline);

  overflow: hidden;
}

.nav-bar__start,
.nav-bar__end {
  min-width: 0;
  display: flex;
  align-items: center;
}

.nav-bar__start {
  flex: 1 1 auto;
  justify-content: flex-start;
  gap: space(4);
}

.nav-bar__end {
  flex: 0 0 auto;
  justify-content: flex-end;
  gap: space(4);
}

.nav-bar__center {
  display: none;
}

.nav-bar.is-centered {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 0;
}

.nav-bar.is-centered .nav-bar__start,
.nav-bar.is-centered .nav-bar__center,
.nav-bar.is-centered .nav-bar__end {
  min-width: 0;
  display: flex;
  align-items: center;
}

.nav-bar.is-centered .nav-bar__start {
  justify-content: flex-start;
  gap: space(2);
}

.nav-bar.is-centered .nav-bar__center {
  justify-content: center;
}

.nav-bar.is-centered .nav-bar__end {
  justify-content: flex-end;
  gap: space(2);
}
</style>
