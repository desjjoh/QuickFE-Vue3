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
    <div class="administration-navigation__sections">
      <template v-for="(section, index) in sections" :key="section.label">
        <div v-if="index > 0" class="administration-navigation__separator" aria-hidden="true" />

        <section class="administration-navigation__section" :aria-label="section.label">
          <BlockText v-if="isDesktop" element="h6" size="sm" tone="secondary" spaced>
            {{ section.label }}
          </BlockText>

          <ul class="administration-navigation__list">
            <li
              v-for="item in section.items"
              :key="item.label"
              class="administration-navigation__item"
            >
              <RouterLink v-slot="{ href, isExactActive, navigate }" custom :to="item.to">
                <a
                  :href="href"
                  class="administration-navigation__link"
                  :class="{ 'is-active': isExactActive }"
                  :aria-current="isExactActive ? 'page' : undefined"
                  @click="navigate"
                >
                  <component :is="item.icon" aria-hidden="true" stroke-width="2" />
                  <span class="administration-navigation__label">{{ item.label }}</span>
                </a>
              </RouterLink>
            </li>
          </ul>
        </section>
      </template>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { useViewport } from '@/shared/hooks/useViewport'

import type { AdministrationNavigationSection } from '../config/navigation'
import BlockText from '@/shared/components/text/BlockText.vue'

defineProps<{ sections: AdministrationNavigationSection[] }>()

const { isDesktop, isMobile, isTablet } = useViewport()
</script>

<style scoped lang="scss">
.administration-navigation {
  box-sizing: border-box;
  width: space(60);
  padding: space(3);
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

.administration-navigation__sections,
.administration-navigation__section {
  display: flex;
  flex-direction: column;
}

.administration-navigation__sections {
  gap: space(5);
}

.administration-navigation__section {
  gap: space(2);
}

.administration-navigation__separator {
  display: none;
  flex: 0 0 1px;

  background: color(border, subtle);
}

.administration-navigation__link {
  display: flex;
  align-items: center;
  gap: space(3);
  min-height: space(10);
  padding: space(2) space(3);
  border-radius: border-radius(md);
  font-weight: font-weight(semibold);

  color: color(text, primary);

  background-color: color(theme, neutral, theme-alpha, 2);
  text-decoration: none;

  outline: none;

  svg {
    width: 1.25em;
    height: 1.25em;
    flex: 0 0 auto;
  }

  &:focus-visible,
  &:hover {
    background-color: color(theme, neutral, theme-alpha, 3);
  }

  &.is-active {
    background-color: color(theme, primary, theme-alpha, 9);
    color: color(theme, primary, solid-fg);
  }

  &.is-active:focus-visible,
  &.is-active:hover {
    background-color: color(theme, primary, theme-alpha, 10);
  }
}

.administration-navigation.is-tablet {
  width: fit-content;

  .administration-navigation__sections {
    gap: 0;
  }

  .administration-navigation__section {
    gap: 0;
  }

  .administration-navigation__separator {
    display: block;
    margin-block: space(2);
    margin-inline: space(1);
    min-height: 1px;
  }

  .administration-navigation__link {
    width: space(10);
    height: space(10);
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
  overflow-x: auto;
  scrollbar-width: thin;

  .administration-navigation__sections,
  .administration-navigation__list {
    flex-direction: row;
  }

  .administration-navigation__sections {
    width: max-content;
    min-width: 100%;
    gap: 0;
  }

  .administration-navigation__section {
    gap: 0;
  }

  .administration-navigation__separator {
    display: block;
    min-width: 1px;
    margin-block: space(1);
    margin-inline: space(2);
  }

  .administration-navigation__link {
    width: space(10);
    height: space(10);
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
