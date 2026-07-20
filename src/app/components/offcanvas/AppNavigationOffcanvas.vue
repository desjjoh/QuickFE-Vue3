<template>
  <div class="app-navigation-drawer">
    <FlexBox>
      <BrandNavigation @click="closeOffcanvas" />
    </FlexBox>

    <nav class="drawer__nav" :aria-label="$t('accessibility.primaryNavigation')">
      <section class="drawer__section">
        <BlockText element="h6" tone="secondary" spaced>
          {{ $t('app.navigation.primary') }}
        </BlockText>

        <ul class="drawer__list">
          <li v-for="(route, idx) in mainRoutes" :key="`main-${idx}`">
            <RouterLink
              :to="route.to"
              class="drawer__link"
              active-class="is-active"
              @click="closeOffcanvas"
            >
              {{ $t(route.label) }}
            </RouterLink>
          </li>
        </ul>
      </section>

      <section class="drawer__section" v-if="isAuthenticated">
        <BlockText element="h6" tone="secondary" spaced>
          {{ $t('app.navigation.account') }}
        </BlockText>
        <ul class="drawer__list">
          <li v-for="(route, idx) in userRoutes" :key="`more-${idx}`">
            <RouterLink
              :to="route.to"
              class="drawer__link"
              active-class="is-active"
              @click="closeOffcanvas"
            >
              {{ $t(route.label) }}
            </RouterLink>
          </li>
        </ul>
      </section>

      <section class="drawer__section">
        <BlockText element="h6" tone="secondary" spaced>
          {{ $t('app.navigation.more') }}
        </BlockText>

        <ul class="drawer__list">
          <li v-for="(route, idx) in moreRoutes" :key="`more-${idx}`">
            <RouterLink
              :to="route.to"
              class="drawer__link"
              active-class="is-active"
              @click="closeOffcanvas"
            >
              {{ $t(route.label) }}
            </RouterLink>
          </li>
        </ul>
      </section>
    </nav>

    <div class="drawer__account-actions">
      <FlexBox :gap="2">
        <ThemeToggle />
        <LanguageDropdown />
      </FlexBox>

      <template v-if="!isAuthenticated && !isGuestRoute">
        <CreateAccountButton :on-create-account="handleCreateAccount" />
        <SignInButton :on-sign-in="handleSignIn" />
      </template>

      <template v-else>
        <BaseButton tone="warning" @click="handleSignOut">
          {{ $t('auth.signOut.actions.submit') }}
        </BaseButton>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { useAppActions } from '@/app/hooks/useAppActions'
import { useOffcanvas } from '@/stores/offcanvas'
import type { UserDto } from '@/library/models/user'

import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'

import type { iRoute } from '../../config/navigation'

import BrandNavigation from '../navigation/BrandNavigation.vue'
import CreateAccountButton from '../buttons/CreateAccountButton.vue'
import SignInButton from '../buttons/SignInButton.vue'
import ThemeToggle from '../buttons/ThemeToggle.vue'
import LanguageDropdown from '../dropdowns/LanguageDropdown.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'

const { t } = useI18n()
const offcanvas = useOffcanvas()
const { register, signIn, signOut } = useAppActions(t)

defineProps<{
  mainRoutes: iRoute[]
  moreRoutes: iRoute[]
  userRoutes: iRoute[]
  isGuestRoute: boolean
  isAuthenticated: boolean
  user: UserDto | null
}>()

function closeOffcanvas(): void {
  offcanvas.close()
}

async function closeOffcanvasThen(callback: () => void): Promise<void> {
  await offcanvas.closeAndWait()
  callback()
}

async function handleCreateAccount(): Promise<void> {
  await closeOffcanvasThen(register)
}

async function handleSignIn(): Promise<void> {
  await closeOffcanvasThen(signIn)
}

async function handleSignOut(): Promise<void> {
  await closeOffcanvasThen(signOut)
}
</script>

<style scoped lang="scss">
.app-navigation-drawer {
  display: flex;
  flex-direction: column;
  gap: space(6);
  min-width: min(100%, space(60));
}

.drawer__nav,
.drawer__section,
.drawer__list,
.drawer__account-actions {
  display: flex;
  flex-direction: column;
}

.drawer__nav {
  gap: space(5);
  flex-grow: 1;
}

.drawer__section {
  gap: space(2);
}

.drawer__list {
  gap: space(1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.drawer__link {
  display: flex;
  align-items: center;
  min-height: space(10);
  padding: 0 space(3);
  border-radius: border-radius(md);

  color: color(text, primary);
  text-decoration: none;
  font-weight: font-weight(semibold);

  background-color: color(theme, neutral, theme-alpha, 2);

  outline: none;

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

.drawer__actions {
  display: flex;
  align-items: center;
  gap: space(2);
  border-top: 1px solid color(border, primary);
}

.drawer__account-actions {
  gap: space(2);
}
</style>
