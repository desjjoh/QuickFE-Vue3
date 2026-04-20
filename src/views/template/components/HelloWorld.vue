<template>
  <div class="greetings">
    <BlockText element="h1">{{ msg }}</BlockText>
    <BlockText element="h5" tone="inherit" weight="normal">
      <i18n-t keypath="template.header.subtitle" tag="span" scope="global">
        <BaseLink href="https://vite.dev/" external>{{ $t('template.header.0') }}</BaseLink>
        <BaseLink href="https://vuejs.org/" external>{{ $t('template.header.1') }}</BaseLink>
      </i18n-t>
    </BlockText>
  </div>
</template>

<script setup lang="ts">
import BaseLink from '@/shared/components/links/BaseLink.vue'
import BlockText from '@/shared/components/text/BlockText.vue'

type props = { msg: string }
defineProps<props>()
</script>

<style scoped lang="scss">
h1 {
  margin-bottom: space(2);
}

.greetings h1,
.greetings h5 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h5 {
    text-align: left;
  }
}
</style>
