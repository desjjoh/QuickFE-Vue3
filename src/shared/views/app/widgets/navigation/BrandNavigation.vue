<template>
  <RouterLink :to="{ name: 'root' }" class="brand__link">
    <FlexBox :gap="2" align-items="center">
      <img
        :alt="$t('accessibility.logoAlt')"
        class="logo"
        src="/assets/logo.svg"
        width="32"
        height="32"
      />

      <BlockText v-if="!hideText" no-wrap element="h3">{{ $t('app.brand.name') }}</BlockText>
    </FlexBox>
  </RouterLink>
</template>

<script setup lang="ts">
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'

defineProps<{
  hideText?: boolean
}>()
</script>

<style scoped lang="scss">
.brand__link {
  display: inline-flex;
  text-decoration: none;
  user-select: none;
  outline: none;

  &:focus-visible,
  &:hover {
    text-decoration: underline color(text, primary);
    text-underline-offset: 0.15em;
  }
}
</style>
