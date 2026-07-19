<template>
  <nav
    class="administration-navigation"
    :class="{
      'is-desktop': isDesktop,
      'is-tablet': isTablet,
      'is-mobile': isMobile,
    }"
    aria-label="Administration navigation"
  >
    <ul class="administration-navigation__list">
      <li v-for="item in items" :key="item.label" class="administration-navigation__item">
        <RouterLink v-slot="{ href, isExactActive, navigate }" custom :to="item.to">
          <a
            :href="href"
            class="administration-navigation__link"
            :class="{ 'is-active': isExactActive }"
            :aria-current="isExactActive ? 'page' : undefined"
            :title="item.label"
            @click="navigate"
          >
            <component :is="item.icon" aria-hidden="true" />
            <span class="administration-navigation__label">{{ item.label }}</span>
          </a>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { useViewport } from '@/shared/hooks/useViewport'

import type { AdministrationNavigationItem } from '../config/navigation'

defineProps<{ items: AdministrationNavigationItem[] }>()

const { isDesktop, isMobile, isTablet } = useViewport()
</script>

<style scoped lang="scss">
.administration-navigation {
  box-sizing: border-box;
  width: space(60);
  padding: space(2);
  background: color(bg, page);
}

.administration-navigation__list {
  display: flex;
  flex-direction: column;
  gap: space(1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.administration-navigation__link {
  display: flex;
  align-items: center;
  gap: space(3);
  min-height: space(11);
  padding: space(2) space(3);
  border-radius: border-radius(sm);
  color: color(text, primary);
  font-weight: 600;
  text-decoration: none;

  svg {
    width: 1.25em;
    height: 1.25em;
    flex: 0 0 auto;
  }

  &:hover,
  &:focus-visible,
  &.is-active {
    background: color(theme, primary, theme-alpha, 3);
    color: color(theme, primary, theme, 11);
  }

  &:focus-visible {
    outline: 2px solid color(theme, primary, theme, 9);
    outline-offset: 2px;
  }
}

.administration-navigation.is-tablet {
  width: space(15);

  .administration-navigation__link {
    width: space(11);
    height: space(11);
    min-height: 0;
    justify-content: center;
    padding: 0;
  }

  .administration-navigation__label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}

.administration-navigation.is-mobile {
  width: 100%;
  height: space(15);
  overflow-x: auto;
  scrollbar-width: thin;

  .administration-navigation__list {
    flex-direction: row;
    width: max-content;
    min-width: 100%;
  }

  .administration-navigation__link {
    width: space(11);
    height: space(11);
    min-height: 0;
    justify-content: center;
    padding: 0;
  }

  .administration-navigation__label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}

.administration-navigation.is-desktop {
  .administration-navigation__link {
    gap: 0;
  }

  svg {
    display: none;
  }
}
</style>
