<template>
  <TabLayout>
    <template #tabs>
      <Tab id="sign-in">Sign in</Tab>
      <Tab id="create-account">Create an account</Tab>
    </template>

    <template #sign-in>
      <PlaygroundShowcase>
        <GridBox :columns="2">
          <GridCell>
            <BaseCard>
              <CardBody>
                <SingInForm :callback="callbackFn" />
              </CardBody>
            </BaseCard>
          </GridCell>
        </GridBox>
      </PlaygroundShowcase>
    </template>

    <template #create-account>
      <PlaygroundShowcase>
        <GridBox :columns="3">
          <GridCell :span="2">
            <BaseCard>
              <CardBody>
                <CreateAccount :callback="callbackFn" />
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

async function callbackFn(values: unknown): Promise<void> {
  console.log(values)
}
</script>
