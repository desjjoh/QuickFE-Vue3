<template>
  <GridBox :gap="4">
    <FlexBox direction="column" :gap="1">
      <BlockText element="h3">Activity history</BlockText>
      <BlockText>
        Review recent actions, changes, and security events across your account.
      </BlockText>
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
              <IconButton variant="surface" :icon="ListFilter" />
              <BaseButton variant="surface" tone="neutral">
                {{ $t('administration.users.actions.export') }}
              </BaseButton>
            </FlexBox>
          </FlexBox>
        </CardListSection>

        <CardListSection no-padding>
          <DataTable
            :headers="headers"
            :rows="profileStore.recentActivity"
            :active-sort="query.sort"
            :sort-order="query.order"
            @sort="toggleSort"
          >
            <template #event="{ row }">
              <FlexBox :gap="3" align-items="center">
                <span class="activity__icon" :class="activityTone(row.event)"></span>
                <FlexBox direction="column">
                  <BlockText element="h6" no-wrap>{{ eventLabel(row.event) }}</BlockText>
                  <BlockText size="sm" tone="tertiary" no-wrap>
                    {{ activityDescription(row) }}
                  </BlockText>
                </FlexBox>
              </FlexBox>
            </template>

            <template #occurredAt="{ row }">
              <InlineText size="sm">{{ formatDate(row.occurredAt) }}</InlineText>
            </template>

            <template #actions>
              <IconButton :icon="EllipsisVertical" tone="neutral" variant="ghost" />
            </template>
          </DataTable>
        </CardListSection>

        <CardListSection>
          <DataTablePagination
            v-bind="profileStore.pagination"
            :loading="profileStore.loading"
            @page="(page) => updateQuery({ page })"
            @take="(take) => updateQuery({ take, page: 1 })"
          />
        </CardListSection>
      </CardListBody>
    </BaseCard>
  </GridBox>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { AuditDto } from '@/library/models/audit'

import BaseCard from '@/library/components/card/BaseCard.vue'
import CardListBody from '@/library/components/card/CardListBody.vue'
import CardListSection from '@/library/components/card/CardListSection.vue'
import DataTable, { type DataTableHeaders } from '@/library/components/table/DataTable.vue'
import DataTablePagination from '@/library/components/table/DataTablePagination.vue'
import FlexBox from '@/library/components/flex/FlexBox.vue'
import BlockText from '@/library/components/text/BlockText.vue'
import InlineText from '@/library/components/text/InlineText.vue'
import { formatLocalizedDateTime } from '@/shared/helpers/date'

import { usePaginatedQuery, type PaginatedQuery } from '@/shared/hooks/usePaginatedQuery'
import { useProfileStore } from '../stores/profile'
import { useViewport } from '@/shared/hooks/useViewport'
import { EllipsisVertical, ListFilter } from 'lucide-vue-next'
import IconButton from '@/library/components/buttons/IconButton.vue'
import BaseButton from '@/library/components/buttons/BaseButton.vue'
import SearchField from '@/library/components/inputs/SearchField.vue'
import GridBox from '@/library/components/grid/GridBox.vue'
import { activityTone } from '../hooks/useProfileActivity'
import type { AccountActivityQuery } from '@/shared/api/routes/useAccountRoutes'

const profileStore = useProfileStore()
const { updateQuery, query, toggleSort } = usePaginatedQuery(
  { page: 1, take: profileStore.pagination.take },
  (query: PaginatedQuery) => profileStore.loadRecentActivity(query as AccountActivityQuery),
  false,
)

const { locale, t, te } = useI18n()
const { isTabletUp, isDesktop } = useViewport()

const headers = computed<DataTableHeaders>(() => ({
  event: { label: 'Event', sort: 'event' },
  occurredAt: { label: 'Occurred at', sort: 'occurredAt' },
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

function eventLabel(event: string): string {
  const key = `profile.cards.activity.events.${event.replace(/\./g, '_')}`
  return te(key) ? t(key) : event
}

function formatDate(value: Date): string {
  return formatLocalizedDateTime(value, locale.value)
}

function formatSessionDevice(browser: string | null, os: string | null): string | null {
  if (browser && os) return t('profile.data.session.deviceValue', { browser, os })

  return browser ?? os
}

function formatSessionLocation(city: string | null, regionCode: string | null): string {
  return [city, regionCode].filter(Boolean).join(', ') || t('profile.data.security.notAvailable')
}

function activityDescription(activity: AuditDto): string {
  return (
    [
      formatSessionDevice(activity.browser, activity.os),
      formatSessionLocation(
        activity.ipLocation?.city ?? null,
        activity.ipLocation?.regionName ?? null,
      ),
    ]
      .filter(Boolean)
      .join(' · ') || activity.domain
  )
}
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
