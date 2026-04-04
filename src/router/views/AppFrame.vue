<template>
  <div class="app-frame">
    <main data-app-shell-scroll ref="contentRef" class="frame__main">
      <!-- HEADER (TOP NAVIGATION) -->
      <header class="frame__header">
        <NavBar>
          <template #start>
            <IconButton :icon="Menu" variant="ghost" tone="neutral" />
          </template>
          <template #end>
            <!-- LANGUAGES -->
            <LanguageDropdown content-align="end" />

            <!-- ACTIONS (UNAUTHENTICATED) -->
            <template v-if="!isAuthenticated">
              <BaseButton variant="soft" tone="neutral" @click="signIn">
                {{ $t('auth.signIn.actions.submit') }}
              </BaseButton>

              <BaseButton variant="outline" @click="register">
                {{ $t('auth.signIn.actions.createAccount') }}
              </BaseButton>
            </template>
          </template>
        </NavBar>
      </header>

      <!-- MAIN CONTENT -->
      <RouterView />

      <ScrollToTopButton :scroll-ref="contentRef" />
      <ToastHost :scroll-ref="contentRef" />
    </main>
  </div>

  <!-- GLOBALLY ACCESSIBLE COMPONENTS -->
  <BaseModal />
</template>

<script setup lang="ts">
import { provide, ref, type Ref } from 'vue'

import { useModalStore } from '@/stores/modal'

import NavBar from './layouts/NavBar.vue'
import LanguageDropdown from '@/shared/widgets/dropdowns/LanguageDropdown.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import RouterView from '@/shared/components/router/RouterView.vue'
import BaseModal from '@/shared/components/modal/BaseModal.vue'

import SignIn from '@/shared/forms/sign-in/SignIn.vue'
import type { FormValues as SignInValues } from '@/shared/forms/sign-in/types'

import CreateAccount from '@/shared/forms/create-account/CreateAccount.vue'
import type { FormValues as CreateAccountValues } from '@/shared/forms/create-account/types'

import IconButton from '@/shared/components/buttons/IconButton.vue'
import { Menu } from 'lucide-vue-next'
import { APP_SHELL_SCROLL_REF_KEY } from '@/helpers/window'
import ScrollToTopButton from '@/shared/widgets/buttons/ScrollToTopButton.vue'
import ToastHost from '@/shared/components/toasts/ToastHost.vue'

const modalStore = useModalStore()
const contentRef: Ref<HTMLElement | null> = ref<HTMLElement | null>(null)

function signIn() {
  modalStore.openModal({
    view: SignIn,
    props: {
      callbackSubmit: async (values: SignInValues) => {
        console.log(values)
      },
    },
  })
}

function register() {
  modalStore.openModal({
    view: CreateAccount,
    props: {
      callbackSubmit: async (values: CreateAccountValues) => {
        console.log(values)
      },
    },
  })
}

const isAuthenticated = ref<boolean>(false)

provide(APP_SHELL_SCROLL_REF_KEY, contentRef)
</script>

<style scoped lang="scss">
.app-frame {
  height: 100dvh;
  width: 100%;

  max-width: 100%;

  overflow: hidden;

  & .frame__main {
    min-width: 0;
    height: 100%;

    display: flex;
    flex-direction: column;
    flex: 1 1 auto;

    overflow: auto;

    & .frame__header {
      position: sticky;

      height: $masthead-height;

      top: 0;
      left: 0;
      right: 0;

      z-index: z-index(floating);
      flex-shrink: 0;
    }
  }
}
</style>
