<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div class="template__body">
    <div class="template__app">
      <header>
        <img alt="Vue logo" class="logo" src="/assets/logo.svg" width="125" height="125" />

        <div class="wrapper">
          <HelloWorld msg="You did it!" />

          <nav>
            <RouterLink to="/">Home</RouterLink>
            <RouterLink to="/about">About</RouterLink>
          </nav>
        </div>
      </header>

      <RouterView />
    </div>
  </div>
</template>

<style scoped lang="scss">
.template__body {
  height: 100%;

  .template__app {
    max-width: 1280px;
    margin: 0 auto;

    padding: space(5);

    header {
      max-height: 100%;
    }
  }
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  text-align: center;

  margin-top: 2rem;

  a {
    text-decoration: none;
  }
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
  transition: 0.3s;
}

nav a:first-of-type {
  border: 0;
}

@media (hover: hover) {
  a:hover {
    background-color: hsla(160, 100%, 37%, 0.2);
  }
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 4rem 0 0;
  }

  .template__app {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 0 2rem;
  }

  .template__body {
    display: flex;
    place-items: center;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
