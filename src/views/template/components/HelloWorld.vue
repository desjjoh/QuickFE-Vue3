<template>
  <div class="greetings">
    <BlockText element="h1">{{ msg }}</BlockText>
    <BlockText element="h5" tone="secondary" weight="normal">
      You’ve successfully created a project with
      <BaseLink href="https://vite.dev/" external>Vite</BaseLink> +
      <BaseLink href="https://vuejs.org/" external>Vue 3</BaseLink>. What's next?
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
