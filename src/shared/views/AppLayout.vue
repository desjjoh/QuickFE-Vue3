<template>
  <div class="app-frame">
    <!-- HEADER (TOP NAVIGATION) -->
    <header class="frame__header">
      <NavBar>
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
    <main class="frame__main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import NavBar from '@/shared/components/navbar/NavBar.vue'
import LanguageDropdown from '@/shared/widgets/dropdowns/LanguageDropdown.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'

import RouterView from './RouterView.vue'

import { useModalStore } from '@/stores/modal'

import SignIn from '@/shared/forms/sign-in/SignIn.vue'
import type { FormValues as SignInValues } from '@/shared/forms/sign-in/types'
import CreateAccount from '@/shared/forms/create-account/CreateAccount.vue'
import type { FormValues as CreateAccountValues } from '@/shared/forms/create-account/types'

const modalStore = useModalStore()

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
</script>

<style scoped lang="scss">
.app-frame {
  min-height: 100dvh;

  display: grid;
  grid-template-rows: auto 1fr;

  & .frame__header {
    position: sticky;
    top: 0;
    z-index: 100;
  }

  & .frame__main {
    display: flex;
    flex-direction: column;

    overflow: auto;

    min-height: 0;
    min-width: fit-content;
  }
}
</style>
