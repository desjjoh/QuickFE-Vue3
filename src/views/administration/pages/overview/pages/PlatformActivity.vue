<template>
  <GridBox :gap="4">
    <FlexBox direction="column" :gap="1">
      <BlockText element="h3">{{ $t('administration.overview.activity.title') }}</BlockText>
      <BlockText>{{ $t('administration.overview.activity.description') }}</BlockText>
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
                :label="$t('administration.overview.activity.actions.filter')"
              />
              <BaseButton variant="surface" tone="neutral">
                {{ $t('administration.overview.activity.actions.export') }}
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
            :empty-label="$t('administration.overview.activity.empty')"
            @sort="toggleSort"
          >
            <template #event="{ row }">
              <FlexBox direction="column" class="activity__icon" :class="activityTone(row.event)">
                <BlockText element="h6" no-wrap>
                  {{ eventLabel(row.event) }}
                </BlockText>
                <BlockText size="sm" no-wrap>
                  {{ row.actorUser?.name ?? row.actorId ?? row.actorType }}
                </BlockText>
              </FlexBox>
            </template>

            <template #origin="{ row }">
              <FlexBox direction="column">
                <InlineText size="sm" tone="primary">{{ row.ipAddress }}</InlineText>
                <InlineText size="sm" tone="tertiary">{{ activityDescription(row) }}</InlineText>
              </FlexBox>
            </template>

            <template #subject="{ row }">
              <FlexBox direction="column">
                <InlineText size="sm" tone="primary">{{ row.subjectId }}</InlineText>
              </FlexBox>
            </template>

            <template #domain="{ row }">
              <BaseBadge variant="soft" :tone="domainTone(row.domain)">
                {{ activityDomainLabel(row.domain) }}
              </BaseBadge>
            </template>

            <template #occurredAt="{ row }">
              <InlineText size="sm" tone="primary">
                {{ formatDateTime(row.occurredAt) }}
              </InlineText>
            </template>

            <template #actions>
              <IconButton
                :icon="EllipsisVertical"
                tone="neutral"
                variant="ghost"
                :label="$t('administration.overview.activity.actions.openRow')"
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
</template>

<script setup lang="ts">
import { computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { EllipsisVertical, ListFilter } from 'lucide-vue-next'

import BaseCard from '@/library/components/card/BaseCard.vue'
import CardListBody from '@/library/components/card/CardListBody.vue'
import CardListSection from '@/library/components/card/CardListSection.vue'
import DataTable, { type DataTableHeaders } from '@/library/components/table/DataTable.vue'
import DataTablePagination from '@/library/components/table/DataTablePagination.vue'
import FlexBox from '@/library/components/flex/FlexBox.vue'
import BlockText from '@/library/components/text/BlockText.vue'
import InlineText from '@/library/components/text/InlineText.vue'
import { useReferenceTranslations } from '@/shared/hooks/useReferenceTranslations'
import { useAuditPresentation } from '@/shared/hooks/useAuditPresentation'
import { usePaginatedQuery } from '@/shared/hooks/usePaginatedQuery'
import {
  useAdministrationActivityStore,
  normalizeAdministrationActivityQuery,
  toAdministrationAuditQuery,
} from '@/views/administration/stores/activity'
import { useRoute } from 'vue-router'
import { useViewport } from '@/shared/hooks/useViewport'

import IconButton from '@/library/components/buttons/IconButton.vue'
import BaseButton from '@/library/components/buttons/BaseButton.vue'
import SearchField from '@/library/components/inputs/SearchField.vue'
import GridBox from '@/library/components/grid/GridBox.vue'
import BaseBadge from '@/library/components/badges/BaseBadge.vue'

const { t } = useI18n()

const store = useAdministrationActivityStore()
const route = useRoute()

const { updateQuery, query, toggleSort } = usePaginatedQuery(
  { page: 1, take: store.pagination.take },
  () => {
    if (route.name !== 'administration-activity') return
    return store.loadActivity(
      toAdministrationAuditQuery(
        normalizeAdministrationActivityQuery(route.query, { page: 1, take: store.pagination.take }),
      ),
    )
  },
  false,
)

const { activityDescription, eventLabel, formatDateTime, activityTone, domainTone } =
  useAuditPresentation()
const { activityDomainLabel } = useReferenceTranslations()
const { isTabletUp, isDesktop } = useViewport()

const headers = computed<DataTableHeaders>(() => ({
  event: { label: t('administration.overview.activity.table.event'), sort: 'event' },
  origin: { label: t('administration.overview.activity.table.origin') },
  subject: { label: t('administration.overview.activity.table.subject') },
  domain: { label: t('administration.overview.activity.table.domain'), sort: 'domain' },
  occurredAt: { label: t('administration.overview.activity.table.occurredAt'), sort: 'occurredAt' },
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

onUnmounted(() => store.clear())
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
  --activity-timeline-color: #{color(theme, primary, theme, 9)};

  border-left: 2px solid var(--activity-timeline-color);
  padding-inline-start: space(3);
}

@each $tone, $palette in $activity-timeline-tones {
  .activity__icon.#{$tone} {
    --activity-timeline-color: #{color(theme, #{$palette}, theme, 9)};
  }
}
</style>
