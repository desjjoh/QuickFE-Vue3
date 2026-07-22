<template>
  <ManagementLayout>
    <template #searchFilter>
      <SearchField name="search" />
    </template>

    <template #statusFilter>
      <SelectInput
        id="test-select"
        name="test-select"
        placeholder="Status"
        :options="['All Statuses', 'Active', 'At Risk', 'Inactive']"
      >
        <template #option="{ option }">
          {{ option }}
        </template>
      </SelectInput>
    </template>

    <template #programFilter>
      <SelectInput
        id="test-select-2"
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
    </template>

    <template #newClient>
      <BaseButton>New client</BaseButton>
    </template>

    <template #list>
      <SectionCard :title="`My Clients (${clients.length})`">
        <FlexBox direction="column" :gap="2">
          <ClientMetricsCard v-for="client in clients" :key="client.id" v-bind="client" />
        </FlexBox>
      </SectionCard>
    </template>
  </ManagementLayout>
</template>

<script setup lang="ts">
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import SearchField from '@/shared/components/inputs/SearchField.vue'
import SelectInput from '@/shared/components/inputs/SelectInput.vue'

import ClientMetricsCard from '@/views/dashboard/shared/widgets/ClientMetricsCard.vue'

import { clients } from './constants/clientmetrics'
import SectionCard from '../../shared/layouts/SectionCard.vue'
import ManagementLayout from './layouts/ManagementLayout.vue'
import { type LocalHostAPI, useLocalHostAPI } from '@/api/useLocalhostAPI.ts'
import { type AuthStore, useAuthStore } from '@/stores/auth.ts'

const authStore: AuthStore = useAuthStore()
const api: LocalHostAPI = useLocalHostAPI()

const token = await authStore.getValidAccessToken()
const users = await api.administration.users.getUsers(token)

console.log(users)
</script>
