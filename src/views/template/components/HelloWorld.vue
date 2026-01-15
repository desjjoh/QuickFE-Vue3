<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <div class="greetings">
    <h1>{{ msg }}</h1>
    <h5>
      You’ve successfully created a project with
      <a href="https://vite.dev/" target="_blank" rel="noopener">Vite</a> +
      <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue 3</a>. What's next?
    </h5>
  </div>
</template>

<style scoped lang="scss">
@use 'sass:map';

h1 {
  color: map.get($colors, brand, primary);
  position: relative;
  margin-bottom: 10px;
}

h5 {
  font-weight: font-weight(normal);
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
