<template>
  <CenteredLayout>
    <GridBox :gap="4">
      <FlexBox direction="column" :gap="1">
        <BlockText element="h3">{{ $t('administration.activity.title') }}</BlockText>
        <BlockText>{{ $t('administration.activity.description') }}</BlockText>
      </FlexBox>

      <BaseCard>
        <CardListBody>
          <CardListSection>
            <FlexBox :direction="rowDirection" :align-items="rowAlignItems" :gap="4">
              <FlexBox grow>
                <SearchField
                  name="search"
                  :value="query.search"
                  @search="(search: string | undefined) => updateQuery({ search }, true)"
                />
              </FlexBox>

              <FlexBox :direction="rowSubDirection" :gap="4">
                <IconButton
                  variant="surface"
                  :icon="ListFilter"
                  :label="$t('profile.activityHistory.actions.filter')"
                />
                <BaseButton variant="surface" tone="neutral">
                  {{ $t('profile.activityHistory.actions.export') }}
                </BaseButton>
              </FlexBox>
            </FlexBox>
          </CardListSection>

          <CardListSection no-padding>
            <DataTable
              :headers="headers"
              :rows="store.activity"
              :active-sort="query.sort"
              :sort-order="query.order"
              :empty-label="$t('profile.activityHistory.empty')"
              @sort="toggleSort"
            >
              <template #event="{ row }">
                <FlexBox :gap="3" align-items="center">
                  <span class="activity__icon" :class="activityTone(row.event)"></span>
                  <FlexBox direction="column">
                    <BlockText element="h6" no-wrap>
                      {{ eventLabel(row.event) }}
                    </BlockText>
                    <BlockText size="sm" no-wrap>{{ row.actorId ?? row.actorType }}</BlockText>
                  </FlexBox>
                </FlexBox>
              </template>

              <template #domain="{ row }">
                <BaseBadge variant="soft" tone="neutral">{{ row.domain }}</BaseBadge>
              </template>

              <template #subject="{ row }">
                <InlineText size="sm" tone="primary">{{ row.subjectId }}</InlineText>
              </template>

              <template #ip="{ row }">
                <InlineText size="sm" tone="tertiary">{{ row.ipAddress }}</InlineText>
              </template>

              <template #occurredAt="{ row }">
                <InlineText size="sm" tone="primary">{{
                  formatDateTime(row.occurredAt)
                }}</InlineText>
              </template>

              <template #actions>
                <IconButton
                  :icon="EllipsisVertical"
                  tone="neutral"
                  variant="ghost"
                  :label="$t('profile.activityHistory.actions.openRow')"
                />
              </template>
            </DataTable>
          </CardListSection>

          <CardListSection>
            <DataTablePagination
              v-bind="store.pagination"
              :loading="store.loading"
              @page="(page) => updateQuery({ page })"
              @take="(take) => updateQuery({ take, page: 1 })"
            />
          </CardListSection>
        </CardListBody>
      </BaseCard>
    </GridBox>
  </CenteredLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseCard from '@/library/components/card/BaseCard.vue'
import CardListBody from '@/library/components/card/CardListBody.vue'
import CardListSection from '@/library/components/card/CardListSection.vue'
import DataTable, { type DataTableHeaders } from '@/library/components/table/DataTable.vue'
import DataTablePagination from '@/library/components/table/DataTablePagination.vue'
import FlexBox from '@/library/components/flex/FlexBox.vue'
import BlockText from '@/library/components/text/BlockText.vue'
import InlineText from '@/library/components/text/InlineText.vue'
import { useAuditPresentation } from '@/shared/hooks/useAuditPresentation'
import { usePaginatedQuery, type PaginatedQuery } from '@/shared/hooks/usePaginatedQuery'
import { useAdministrationActivityStore } from '../stores/activity'
import { useViewport } from '@/shared/hooks/useViewport'
import { EllipsisVertical, ListFilter } from 'lucide-vue-next'
import IconButton from '@/library/components/buttons/IconButton.vue'
import BaseButton from '@/library/components/buttons/BaseButton.vue'
import SearchField from '@/library/components/inputs/SearchField.vue'
import GridBox from '@/library/components/grid/GridBox.vue'
import type { AccountActivityQuery } from '@/shared/api/routes/useAccountRoutes'
import BaseBadge from '@/library/components/badges/BaseBadge.vue'
import CenteredLayout from '@/shared/layouts/CenteredLayout.vue'

const { t } = useI18n()
const store = useAdministrationActivityStore()
const { updateQuery, query, toggleSort } = usePaginatedQuery(
  { page: 1, take: store.pagination.take },
  (query: PaginatedQuery) => store.loadActivity(query as AccountActivityQuery),
  false,
)

const { eventLabel, formatDateTime, activityTone } = useAuditPresentation()
const { isTabletUp, isDesktop } = useViewport()

const headers = computed<DataTableHeaders>(() => ({
  event: { label: t('profile.activityHistory.table.event'), sort: 'event' },
  subject: { label: 'Subject' },
  domain: { label: t('profile.activityHistory.table.domain'), sort: 'domain' },
  occurredAt: { label: t('profile.activityHistory.table.occurredAt'), sort: 'occurredAt' },
  actions: {},
}))

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

<style lang="scss" scoped>
$activity-timeline-tones: (
  primary: primary,
  neutral: neutral,
  success: success,
  warning: warning,
  danger: danger,
  info: info,
);

.activity__icon {
  --activity-timeline-dot-color: #{color(theme, primary, theme-alpha, 9)};
  width: space(7);
  height: space(7);

  background-color: var(--activity-timeline-dot-color);
  border-radius: border-radius(md);
}

@each $tone, $palette in $activity-timeline-tones {
  .activity__icon.#{$tone} {
    --activity-timeline-dot-color: #{color(theme, #{$palette}, theme, 9)};
  }
}
</style>
