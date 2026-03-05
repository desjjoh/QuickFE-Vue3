<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="create-account">Create an account</Tab>
      <Tab id="sign-in">Sign in</Tab>
      <Tab id="confirm-action">Confirm action</Tab>
      <Tab id="password-verification">Password verification</Tab>
      <Tab id="permanently-delete">Permanently delete</Tab>
    </template>

    <!-- CREATE AN ACCOUNT -->
    <template #create-account>
      <PlaygroundShowcase>
        <GridBox :columns="3">
          <GridCell :span="2">
            <BaseCard>
              <CardBody>
                <CreateAccount :callback-submit="callbackFn" />
              </CardBody>
            </BaseCard>
          </GridCell>
        </GridBox>
      </PlaygroundShowcase>
    </template>

    <!-- SIGN IN -->
    <template #sign-in>
      <PlaygroundShowcase>
        <GridBox :columns="3">
          <GridCell :span="2">
            <BaseCard>
              <CardBody>
                <SingInForm :callback-submit="callbackFn" />
              </CardBody>
            </BaseCard>
          </GridCell>
        </GridBox>
      </PlaygroundShowcase>
    </template>

    <!-- CONFIRM ACTION -->
    <template #confirm-action>
      <PlaygroundShowcase>
        <GridBox :columns="2" align-items="start">
          <GridCell>
            <BaseCard>
              <CardBody>
                <ConfirmAction :callback-submit="callbackFn2" />
              </CardBody>
            </BaseCard>
          </GridCell>
          <GridCell>
            <BaseCard>
              <CardBody>
                <ConfirmAction
                  tone="warning"
                  title="Revoke access"
                  submit="Revoke"
                  :callback-submit="callbackFn2"
                >
                  <template #content>
                    <BlockText>
                      Are you sure? This application will no longer be accessible and any existing
                      sessions will be expired.
                    </BlockText>
                  </template>
                </ConfirmAction>
              </CardBody>
            </BaseCard>
          </GridCell>
        </GridBox>
      </PlaygroundShowcase>
    </template>

    <!-- PASSWORD VERIFICATION -->
    <template #password-verification>
      <PlaygroundShowcase>
        <GridBox :columns="3">
          <GridCell :span="2">
            <BaseCard>
              <CardBody>
                <PasswordVerification :callback-submit="callbackFn" />
              </CardBody>
            </BaseCard>
          </GridCell>
        </GridBox>
      </PlaygroundShowcase>
    </template>

    <!-- PERMANENTLY DELETE -->
    <template #permanently-delete>
      <PlaygroundShowcase>
        <GridBox :columns="3">
          <GridCell :span="2">
            <BaseCard>
              <CardBody>
                <PermanentlyDelete :callback-submit="callbackFn2" />
              </CardBody>
            </BaseCard>
          </GridCell>
        </GridBox>
      </PlaygroundShowcase>
    </template>
  </TabLayout>
</template>

<script setup lang="ts">
import GridBox from '@/shared/components/grid/GridBox.vue'
import CardBody from '@/shared/components/card/CardBody.vue'
import BaseCard from '@/shared/components/card/BaseCard.vue'

import PlaygroundShowcase from '../layouts/PlaygroundShowcase.vue'

import SingInForm from '@/shared/forms/sign-in/SignIn.vue'
import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'
import CreateAccount from '@/shared/forms/create-account/CreateAccount.vue'
import GridCell from '@/shared/components/grid/GridCell.vue'
import ConfirmAction from '@/shared/forms/confirm-action/ConfirmAction.vue'
import PasswordVerification from '@/shared/forms/password-verification/PasswordVerification.vue'
import PermanentlyDelete from '@/shared/forms/permanently-delete/PermanentlyDelete.vue'
import BlockText from '@/shared/components/text/BlockText.vue'

async function callbackFn(values: unknown): Promise<void> {
  console.log(values)
}

async function callbackFn2(): Promise<void> {
  console.log(Date.now())
}
</script>
