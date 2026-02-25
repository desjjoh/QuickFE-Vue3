<template>
  <TabLayout>
    <template #tabs>
      <Tab id="sign-in">Sign in</Tab>
    </template>
    <template #sign-in>
      <PlaygroundShowcase>
        <GridBox :columns="2">
          <BaseCard>
            <CardBody>
              <SingInForm :callback="callbackFn" />
            </CardBody>
          </BaseCard>
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

async function callbackFn(values: unknown): Promise<void> {
  console.log(values)
}
</script>
