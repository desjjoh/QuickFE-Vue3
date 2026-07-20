<template>
  <div
    class="template__body"
    :class="{
      'is-desktop': isDesktop,
    }"
  >
    <div class="template__app">
      <header class="template__header">
        <img
          :alt="$t('accessibility.logoAlt')"
          class="template__logo"
          src="/assets/logo.svg"
          width="120"
          height="120"
        />

        <div class="template__header-content">
          <HelloWorld :msg="$t('template.header.title')" />

          <nav class="template__nav">
            <RouterLink :to="{ name: 'template-home' }">
              {{ $t('app.routes.home') }}
            </RouterLink>

            <RouterLink :to="{ name: 'template-about' }">
              {{ $t('app.routes.about') }}
            </RouterLink>
          </nav>
        </div>
      </header>

      <RouterComponent />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { useViewport } from '@/shared/hooks/useViewport'

import RouterComponent from '@/shared/components/routers/RouterComponent.vue'

import HelloWorld from './components/HelloWorld.vue'

const { isDesktop } = useViewport()
</script>

<style scoped lang="scss">
.template__body {
  height: 100%;
}

.template__app {
  max-width: 1280px;
  margin: 0 auto;
  padding: space(5);
}

.template__header {
  max-height: 100%;
  margin-bottom: space(6);
}

.template__logo {
  display: block;
  margin: 0 auto space(5);
}

.template__header-content {
  min-width: 0;
}

.template__nav {
  width: 100%;
  margin-top: space(5);

  text-align: center;

  a {
    display: inline-block;
    padding: 0 space(2);
    border-left: 1px solid color(border, subtle);

    color: color(theme, primary, theme-alpha, 11);
    font-weight: font-weight(medium);
    text-decoration: none;

    transition: none;

    &:first-of-type {
      border: 0;
    }

    &:hover {
      color: color(theme, primary, theme-alpha, 12);
    }
  }
}

.template__body.is-desktop {
  display: flex;
  place-items: center;

  .template__app {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);

    padding: 0 space(10);
  }

  .template__header {
    display: flex;
    place-items: center;

    margin-bottom: 0;
    padding-right: space(20);
  }

  .template__logo {
    margin: 0 space(10) 0 0;
  }

  .template__header-content {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  .template__nav {
    margin-top: space(2);
    margin-left: space(-2);
    padding: space(2) 0;

    text-align: left;
  }
}
</style>
