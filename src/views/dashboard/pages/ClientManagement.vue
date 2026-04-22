<template>
  <FlexBox direction="column" :gap="4" grow>
    <!-- FILTERS -->
    <FlexBox
      class="client__filters"
      :direction="rowDirection"
      :align-items="rowAlignItems"
      :gap="4"
    >
      <FlexBox grow>
        <TextField placeholder="Search" name="search" />
      </FlexBox>

      <FlexBox :direction="rowSubDirection" :gap="4">
        <TextField placeholder="Search" name="search" />
        <TextField placeholder="Search" name="search" />
        <BaseButton>New client <Plus :strokeWidth="3" /></BaseButton>
      </FlexBox>
    </FlexBox>

    <!-- LIST -->
    <BaseCard>
      <CardBody>
        <FlexBox direction="column" :gap="4">
          <!-- HEADER -->
          <BlockText element="h5">My Clients (24)</BlockText>

          <!-- BODY -->
          <FlexBox direction="column" :gap="2">
            <ClientMetricsRow v-for="client in clients" :key="client.id" v-bind="client" />
          </FlexBox>
        </FlexBox>
      </CardBody>
    </BaseCard>
  </FlexBox>
</template>

<script setup lang="ts">
import BaseCard from '@/shared/components/card/BaseCard.vue'
import CardBody from '@/shared/components/card/CardBody.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import ClientMetricsRow from '../widgets/ClientMetricsRow.vue'

import { clients } from '../types/clientmetrics'
import TextField from '@/shared/components/inputs/TextField.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import { Plus } from 'lucide-vue-next'
import { useViewport } from '@/shared/hooks/useViewport'
import { computed } from 'vue'

const { isTabletUp, isDesktop } = useViewport()

const rowDirection = computed<'row' | 'column'>(() => {
  return isDesktop.value ? 'row' : 'column'
})

const rowAlignItems = computed<'stretch' | 'center'>(() => {
  return isDesktop.value ? 'center' : 'stretch'
})

const rowSubDirection = computed<'row' | 'column'>(() => {
  return isTabletUp.value ? 'row' : 'column'
})
</script>
