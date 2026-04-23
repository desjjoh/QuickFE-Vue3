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
        <SearchField name="search" />
      </FlexBox>

      <FlexBox :direction="rowSubDirection" :gap="4">
        <SelectInput
          name="test-select"
          placeholder="Status"
          :options="['All Statuses', 'Active', 'At Risk', 'Inactive']"
        >
          <template #option="{ option }">
            {{ option }}
          </template>
        </SelectInput>

        <SelectInput
          name="test-select-2"
          placeholder="Program"
          :options="[
            'All Programs',
            'Physical Therapy',
            'Occupational Therapy',
            'Youth Wellness',
            'School Program',
          ]"
        />

        <BaseButton :icon="Plus">New client</BaseButton>
      </FlexBox>
    </FlexBox>

    <!-- LIST -->
    <BaseCard size="lg">
      <CardBody>
        <FlexBox direction="column" :gap="4">
          <!-- HEADER -->
          <BlockText element="h5">My Clients (24)</BlockText>

          <!-- BODY -->
          <FlexBox direction="column" :gap="2">
            <ClientMetricsCard v-for="client in clients" :key="client.id" v-bind="client" />
          </FlexBox>
        </FlexBox>
      </CardBody>
    </BaseCard>
  </FlexBox>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Plus } from 'lucide-vue-next'

import { useViewport } from '@/shared/hooks/useViewport'

import BaseCard from '@/shared/components/card/BaseCard.vue'
import CardBody from '@/shared/components/card/CardBody.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import SearchField from '@/shared/components/inputs/SearchField.vue'
import SelectInput from '@/shared/components/inputs/SelectInput.vue'

import ClientMetricsCard from '../widgets/ClientMetricsCard.vue'

import { clients } from '../types/clientmetrics'

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
