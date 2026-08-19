<template>
  <CenteredLayout>
    <GridBox :columns="GridColumns" :gap="4">
      <GridCell :span="GridColumns">
        <FlexBox direction="column" :gap="1">
          <BlockText element="h3"> User management </BlockText>
          <BlockText> Search, review, and manage account access across the platform. </BlockText>
        </FlexBox>
      </GridCell>

      <GridCell>
        <StatCard
          title="Total users"
          value="1"
          trend-tone="success"
          trend="up"
          change="0 (0.0%)"
          footer-text="in last 30 days"
        />
      </GridCell>

      <GridCell>
        <StatCard
          title="Active sessions"
          value="1"
          trend-tone="success"
          change="100.0%"
          footer-text="of total users"
        />
      </GridCell>

      <GridCell>
        <StatCard
          title="Most represented country"
          value="Canada"
          value-size="sm"
          trend-tone="success"
          change="1 (100.0%)"
          footer-text="of total users"
        />
      </GridCell>

      <GridCell>
        <StatCard
          title="Primary age group"
          value="30-39"
          trend-tone="success"
          change="1 (100.0%)"
          footer-text="of total users"
        />
      </GridCell>

      <GridCell :span="GridColumns">
        <BaseCard>
          <CardListBody>
            <CardListSection>
              <FlexBox :direction="rowDirection" :align-items="rowAlignItems" :gap="4">
                <FlexBox grow>
                  <SearchField name="search" />
                </FlexBox>

                <FlexBox :direction="rowSubDirection" :gap="4">
                  <BaseButton variant="surface" tone="neutral">Export</BaseButton>
                </FlexBox>
              </FlexBox>
            </CardListSection>

            <CardListSection no-padding>
              <DataTable
                :headers="userTableHeaders"
                :rows="usersStore.users"
                :loading="usersStore.loading"
                :active-sort="query.sort"
                :sort-order="query.order"
                selectable
                @sort="toggleSort"
              >
                <template #selected="{ selected }">
                  <BaseButton variant="outline" tone="danger" :disabled="!selected.length">
                    Bulk actions
                  </BaseButton>
                </template>

                <template #user="{ row }">
                  <FlexBox align-items="center" :gap="3">
                    <AvatarItem
                      :src="row.profile.media.avatar?.url"
                      :alt="row.getFullName()"
                      :fallback="row.getInitials()"
                      size="sm"
                      radius="full"
                    />
                    <BlockText element="h6" no-wrap>{{ row.getFullName() }}</BlockText>
                  </FlexBox>
                </template>

                <template #email="{ row }">
                  <InlineText size="sm">{{ row.identity.email }}</InlineText>
                </template>

                <template #status="{ row }">
                  <BaseBadge tone="success" variant="soft">
                    {{ row.status.label }}
                  </BaseBadge>
                </template>

                <template #lastSignIn="{ row }">
                  <InlineText size="sm">{{ formatDate(row.metadata.lastSignIn) }}</InlineText>
                </template>

                <template #role="{ row }">
                  <BaseBadge v-if="row.roles[0]" tone="info" variant="soft">
                    {{ row.roles[0].label }}
                  </BaseBadge>
                  <span v-else>—</span>
                </template>

                <template #createdAt="{ row }">
                  <InlineText size="sm">{{ formatDate(row.createdAt) }}</InlineText>
                </template>

                <template #actions>
                  <IconButton :icon="EllipsisVertical" tone="neutral" variant="ghost" />
                </template>
              </DataTable>
            </CardListSection>
            <CardListSection>
              <DataTablePagination
                v-bind="usersStore.pagination"
                :loading="usersStore.loading"
                @page="(page: number) => updateQuery({ page })"
                @take="(take: number) => updateQuery({ take, page: 1 })"
              />
            </CardListSection>
          </CardListBody>
        </BaseCard>
      </GridCell>
    </GridBox>
  </CenteredLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useViewport } from '@/shared/hooks/useViewport'

import CenteredLayout from '@/shared/layouts/CenteredLayout.vue'
import GridBox from '@/library/components/grid/GridBox.vue'
import GridCell from '@/library/components/grid/GridCell.vue'
import FlexBox from '@/library/components/flex/FlexBox.vue'
import BlockText from '@/library/components/text/BlockText.vue'
import BaseCard from '@/library/components/card/BaseCard.vue'

import { usePaginatedQuery, type PaginatedQuery } from '@/shared/hooks/usePaginatedQuery'
import StatCard from '@/library/components/card/StatCard.vue'
import CardListBody from '@/library/components/card/CardListBody.vue'
import CardListSection from '@/library/components/card/CardListSection.vue'
import SearchField from '@/library/components/inputs/SearchField.vue'
import BaseButton from '@/library/components/buttons/BaseButton.vue'
import DataTable, { type DataTableHeaders } from '@/library/components/table/DataTable.vue'
import { type AdministrationUsersQuery } from '@/shared/api/routes/useAdministrationRoutes'
import { formatLocalizedDateTime } from '@/shared/helpers/date'
import AvatarItem from '@/library/components/avatars/AvatarItem.vue'
import BaseBadge from '@/library/components/badges/BaseBadge.vue'
import InlineText from '@/library/components/text/InlineText.vue'
import { useAdministrationUsersStore } from '../stores/users'
import DataTablePagination from '@/library/components/table/DataTablePagination.vue'
import IconButton from '@/library/components/buttons/IconButton.vue'
import { EllipsisVertical } from 'lucide-vue-next'

const usersStore = useAdministrationUsersStore()

const { isTabletUp, isDesktop, isTablet } = useViewport()

const userTableHeaders: DataTableHeaders = {
  user: { label: 'User', sort: 'fullname' },
  email: { label: 'Email', sort: 'user.identity.email' },
  role: { label: 'Role' },
  status: { label: 'Status' },
  lastSignIn: { label: 'Last sign-in' },
  createdAt: { label: 'Created', sort: 'user.createdAt' },
  actions: { label: 'Actions' },
}

const GridColumns = computed<number>(() => {
  if (isDesktop.value) return 4
  if (isTablet.value) return 2

  return 1
})

const rowDirection = computed<'row' | 'column'>(() => {
  return isDesktop.value ? 'row' : 'column'
})

const rowAlignItems = computed<'stretch' | 'center'>(() => {
  return isDesktop.value ? 'center' : 'stretch'
})

const rowSubDirection = computed<'row' | 'column'>(() => {
  return isTabletUp.value ? 'row' : 'column'
})

const { query, updateQuery, toggleSort } = usePaginatedQuery(
  { page: 1, take: usersStore.pagination.take },
  (value: PaginatedQuery) => usersStore.loadUsers(value as AdministrationUsersQuery),
  false,
)

function formatDate(value: Date | null): string {
  return value ? formatLocalizedDateTime(value, 'en-US') : 'Never'
}
</script>
