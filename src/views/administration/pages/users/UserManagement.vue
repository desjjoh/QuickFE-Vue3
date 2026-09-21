<template>
  <CenteredLayout>
    <GridBox :columns="GridColumns" :gap="4">
      <GridCell :span="GridColumns">
        <FlexBox direction="column" :gap="1">
          <BlockText element="h3">{{ $t('administration.users.title') }}</BlockText>
          <BlockText>{{ $t('administration.users.description') }}</BlockText>
        </FlexBox>
      </GridCell>

      <!-- <GridCell>
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
      </GridCell> -->

      <GridCell :span="GridColumns">
        <BaseCard>
          <CardListBody>
            <CardListSection>
              <FlexBox :direction="rowDirection" :align-items="rowAlignItems" :gap="4">
                <FlexBox grow>
                  <SearchField
                    name="search"
                    :value="query.search"
                    @search="(search) => updateQuery({ search }, true)"
                  />
                </FlexBox>

                <FlexBox :direction="rowSubDirection" :gap="4">
                  <IconButton variant="surface" :icon="ListFilter" />
                  <BaseButton variant="surface" tone="neutral">
                    {{ $t('administration.users.actions.export') }}
                  </BaseButton>
                </FlexBox>
              </FlexBox>
            </CardListSection>

            <CardListSection no-padding>
              <DataTable
                :headers="userTableHeaders"
                :rows="usersStore.users"
                :active-sort="query.sort"
                :sort-order="query.order"
                selectable
                @sort="toggleSort"
              >
                <template #selected="{ selected }">
                  <BaseButton variant="outline" tone="danger" :disabled="!selected.length">
                    {{ $t('administration.users.actions.bulk') }}
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
                      variant="soft"
                    />

                    <FlexBox direction="column">
                      <BlockText element="h6" no-wrap>{{ row.getFullName() }}</BlockText>
                      <BlockText size="sm" tone="tertiary" no-wrap>{{ row.id }}</BlockText>
                    </FlexBox>
                  </FlexBox>
                </template>

                <template #email="{ row }">
                  <InlineText size="sm">{{ row.identity.email }}</InlineText>
                </template>

                <template #status="{ row }">
                  <BaseBadge tone="success" variant="soft" pill>
                    {{ row.status.label }}
                  </BaseBadge>
                </template>

                <template #lastSignIn="{ row }">
                  <InlineText size="sm">{{ formatDate(row.metadata.lastSignIn) }}</InlineText>
                </template>

                <template #role="{ row }">
                  <BaseBadge
                    v-if="row.roles[0]"
                    :tone="getBadgeTone(row.roles[0].key)"
                    variant="soft"
                  >
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
import { useI18n } from 'vue-i18n'
import { EllipsisVertical, ListFilter } from 'lucide-vue-next'

import { useViewport } from '@/shared/hooks/useViewport'
import CenteredLayout from '@/shared/layouts/CenteredLayout.vue'
import { usePaginatedQuery, type PaginatedQuery } from '@/shared/hooks/usePaginatedQuery'
import { type AdministrationUsersQuery } from '@/shared/api/routes/useAdministrationRoutes'
import { formatLocalizedDateTime } from '@/shared/helpers/date'

import GridBox from '@/library/components/grid/GridBox.vue'
import GridCell from '@/library/components/grid/GridCell.vue'
import FlexBox from '@/library/components/flex/FlexBox.vue'
import BlockText from '@/library/components/text/BlockText.vue'
import BaseCard from '@/library/components/card/BaseCard.vue'
// import StatCard from '@/library/components/card/StatCard.vue'
import CardListBody from '@/library/components/card/CardListBody.vue'
import CardListSection from '@/library/components/card/CardListSection.vue'
import SearchField from '@/library/components/inputs/SearchField.vue'
import BaseButton from '@/library/components/buttons/BaseButton.vue'
import DataTable, { type DataTableHeaders } from '@/library/components/table/DataTable.vue'
import AvatarItem from '@/library/components/avatars/AvatarItem.vue'
import BaseBadge from '@/library/components/badges/BaseBadge.vue'
import InlineText from '@/library/components/text/InlineText.vue'
import DataTablePagination from '@/library/components/table/DataTablePagination.vue'
import IconButton from '@/library/components/buttons/IconButton.vue'
import type { Tone } from '@/library/components/badges/badges'

import { useAdministrationUsersStore } from '../../stores/users'

const usersStore = useAdministrationUsersStore()
const { isTabletUp, isDesktop, isTablet } = useViewport()
const { locale, t } = useI18n()
const dateLocale = computed(
  () => ({ en: 'en-GB', es: 'es-ES', fr: 'fr-FR' })[locale.value] ?? locale.value,
)

const userTableHeaders = computed<DataTableHeaders>(() => ({
  user: { label: t('administration.users.table.user'), sort: 'fullname' },
  email: { label: t('administration.users.table.email'), sort: 'user.identity.email' },
  role: { label: t('administration.users.table.role') },

  lastSignIn: {
    label: t('administration.users.table.lastSignIn'),
    sort: 'user.metadata.last_sign_in',
  },
  createdAt: { label: t('administration.users.table.created'), sort: 'user.createdAt' },
  status: { label: t('administration.users.table.status') },
  actions: {},
}))

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
  return value ? formatLocalizedDateTime(value, dateLocale.value) : t('administration.users.never')
}

function getBadgeTone(value: string): Tone {
  if (value === 'user') return 'neutral'

  return 'primary'
}
</script>
