<template>
  <BaseTooltip side="bottom">
    <template #trigger="{ triggerAttrs }">
      <div v-bind="triggerAttrs" class="hover__item">
        <BlockText>Hover here</BlockText>
      </div>
    </template>

    The quick brown fox
  </BaseTooltip>
</template>

<script setup lang="ts">
import BlockText from '@/shared/components/text/BlockText.vue'
import BaseTooltip from '@/shared/components/tooltips/BaseTooltip.vue'
</script>

<style scoped lang="scss">
.hover__item {
  color: color(text, primary);
  background: color(theme, primary, dark-alpha, 2);
  border-radius: border-radius(md);
  padding: space(4);
  border: 0.1rem dashed color(theme, primary, dark-alpha, 7);

  & * {
    pointer-events: none;
    user-select: none;
  }
}
</style>
