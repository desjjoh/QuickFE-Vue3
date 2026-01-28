<template>
  <div class="template__body">
    <div class="template__app">
      <header>
        <img alt="Vue logo" class="logo" src="/assets/logo.svg" width="120" height="120" />

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

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

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
  margin: 0 auto space(5);
}

nav {
  width: 100%;
  text-align: center;

  margin-top: space(5);

  a {
    color: color(text, primary);
    text-decoration: none;
  }
}

nav a.router-link-exact-active {
  color: inherit;
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 space(2);
  border-left: 1px solid color(border, subtle);
  transition: none;
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: space(20);
  }

  .logo {
    margin: 0 space(10) 0 0;
  }

  .template__app {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 0 space(5);
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
    margin-left: space(-2);

    padding: space(2) 0;
    margin-top: space(2);
  }
}
</style>
