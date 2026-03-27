<template>
  <div class="app-frame">
    <!-- MAIN CONTENT -->
    <main ref="contentRef" class="frame__main">
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

      <RouterView />
    </main>
  </div>

  <!-- GLOBALLY ACCESSIBLE COMPONENTS -->
  <BaseModal />
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue'

import NavBar from '@/shared/components/navbar/NavBar.vue'
import LanguageDropdown from '@/shared/widgets/dropdowns/LanguageDropdown.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'

import RouterView from '@/shared/components/router/RouterView.vue'

import { useModalStore } from '@/stores/modal'

import SignIn from '@/shared/forms/sign-in/SignIn.vue'
import type { FormValues as SignInValues } from '@/shared/forms/sign-in/types'
import CreateAccount from '@/shared/forms/create-account/CreateAccount.vue'
import type { FormValues as CreateAccountValues } from '@/shared/forms/create-account/types'
import BaseModal from '@/shared/components/modal/BaseModal.vue'

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
</script>

<style scoped lang="scss">
.app-frame {
  height: 100dvh;
  width: 100%;

  max-width: 100%;

  overflow: hidden;

  display: grid;
  grid-template-rows: auto 1fr;

  & .frame__main {
    min-width: 0;

    display: flex;
    flex-direction: column;
    flex: 1 1 auto;

    overflow: auto;

    & .frame__header {
      position: sticky;

      top: 0;
      left: 0;
      right: 0;

      z-index: z-index(floating);
      flex-shrink: 0;
    }
  }
}
</style>
