<template>
  <FlexBox role="banner" class="nav__bar" align-items="stretch" justify-content="space-between">
    <FlexBox align-items="center" :gap="3">
      <slot name="start"></slot>
    </FlexBox>
    <FlexBox align-items="center" :gap="3">
      <slot name="end"></slot>
    </FlexBox>
  </FlexBox>
</template>

<script setup lang="ts">
import FlexBox from '../flex/FlexBox.vue'
</script>

<style scoped lang="scss">
.nav__bar {
  display: flex;
  justify-content: space-between;
  align-items: stretch;

  height: space(16);
  padding-inline: space(4);
  background-color: color(bg, canvas);
  box-shadow: 0 1px palette(gray, dark-alpha, 4);
}
</style>
