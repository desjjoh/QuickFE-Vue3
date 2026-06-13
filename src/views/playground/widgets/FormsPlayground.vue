<template>
  <TabLayout>
    <!-- TABS -->
    <template #tabs>
      <Tab id="create-account">{{ $t('playground.header.tabs.createAccount') }}</Tab>
      <Tab id="sign-in">{{ $t('playground.header.tabs.signIn') }}</Tab>
      <Tab id="password-verification">{{ $t('playground.header.tabs.passwordVerification') }}</Tab>
      <Tab id="permanently-delete">{{ $t('playground.header.tabs.permanentlyDelete') }}</Tab>
      <Tab id="change-address">{{ $t('settings.addressDetails.title') }}</Tab>
      <Tab id="change-phone">{{ $t('settings.phoneDetails.title') }}</Tab>
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

    <!-- CHANGE ADDRESS -->
    <template #change-address>
      <PlaygroundShowcase>
        <GridBox :columns="3">
          <GridCell :span="2">
            <BaseCard>
              <CardBody>
                <AddressDetails :callback-submit="callbackFn" :callback="callbackFn2" />
              </CardBody>
            </BaseCard>
          </GridCell>
        </GridBox>
      </PlaygroundShowcase>
    </template>

    <!-- CHANGE ADDRESS -->
    <template #change-phone>
      <PlaygroundShowcase>
        <GridBox :columns="3">
          <GridCell :span="2">
            <BaseCard>
              <CardBody>
                <PhoneDetails :callback-submit="callbackFn" :callback="callbackFn2" />
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

import SingInForm from '@/shared/forms/SignIn.vue'
import TabLayout from '@/shared/components/tabs/TabLayout.vue'
import Tab from '@/shared/components/tabs/TabButton.vue'
import CreateAccount from '@/shared/forms/CreateAccount.vue'
import GridCell from '@/shared/components/grid/GridCell.vue'
import PasswordVerification from '@/shared/forms/PasswordVerification.vue'
import PermanentlyDelete from '@/shared/forms/PermanentlyDelete.vue'
import AddressDetails from '@/shared/forms/AddressDetails.vue'
import PhoneDetails from '@/shared/forms/PhoneDetails.vue'

async function callbackFn(values: unknown): Promise<void> {
  console.log(values)
}

async function callbackFn2(): Promise<void> {
  console.log(Date.now())
}
</script>
