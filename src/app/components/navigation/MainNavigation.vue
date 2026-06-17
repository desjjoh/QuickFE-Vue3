<template>
  <FlexBox align-items="center" :gap="3" class="app-header__inner" align-self="stretch">
    <nav class="app__nav" :aria-label="$t('accessibility.primaryNavigation')">
      <ul class="nav__list">
        <li v-for="(route, idx) in routes" :key="idx" class="nav__item">
          <RouterLink :to="route.to" class="nav__link" active-class="is-active">
            <BlockText no-wrap element="h6">{{ $t(route.label) }}</BlockText>
          </RouterLink>
        </li>
      </ul>
    </nav>
  </FlexBox>
</template>

<script setup lang="ts">
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'

import { type iRoute } from '../../config/navigation'

const { routes } = defineProps<{ routes: iRoute[] }>()
</script>

<style scoped lang="scss">
.app__nav {
  height: 100%;

  & .nav__list {
    display: flex;
    align-items: stretch;
    gap: space(2);

    margin: 0;
    padding: 0;

    list-style: none;

    height: 100%;
  }

  & .nav__item {
    display: flex;
    height: 100%;

    & .nav__link {
      position: relative;

      display: inline-flex;
      align-items: center;
      justify-content: center;

      gap: 0.8rem;

      padding: 0 1.6rem;
      min-height: 100%;

      color: inherit;

      text-decoration: none;
      font-weight: 600;
      white-space: nowrap;

      outline: none;

      &:focus-visible,
      &:hover {
        text-decoration: underline color(text, primary);
        text-underline-offset: 0.15em;
      }

      &::after {
        content: '';

        position: absolute;

        left: 0;
        right: 0;
        bottom: 0;

        height: 2px;

        background-color: transparent;
        border-radius: 999px;
      }

      &.is-active::after {
        background-color: color(theme, primary, theme, 9);
      }
    }
  }
}
</style>
