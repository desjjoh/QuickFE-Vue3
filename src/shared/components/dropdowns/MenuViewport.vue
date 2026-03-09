<template>
  <FlexBox class="dropdown__menu__viewport" direction="column" :padding="2" @mousedown.prevent>
    <slot></slot>
  </FlexBox>
</template>

<script setup lang="ts">
import FlexBox from '../flex/FlexBox.vue'
</script>

<style lang="scss" scoped>
.dropdown__menu__viewport {
  width: max-content;

  min-width: space(40);
  max-width: space(72);
}
</style>
