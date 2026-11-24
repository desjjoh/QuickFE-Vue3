<template>
  <FlexBox direction="column" :gap="6">
    <BlockText :id="titleId" element="h3">{{
      $t('profile.activityHistory.detail.title')
    }}</BlockText>

    <FlexBox direction="column" :gap="3">
      <BlockText element="h4">{{ $t('profile.activityHistory.table.event') }}</BlockText>
      <DataList>
        <DataListItem :label="$t('profile.activityHistory.table.event')">
          <BlockText size="sm">{{ eventLabel(record.event) }}</BlockText>
        </DataListItem>
        <DataListItem :label="$t('profile.activityHistory.table.occurredAt')">
          <BlockText size="sm">{{ formatDateTime(record.occurredAt) }}</BlockText>
        </DataListItem>
      </DataList>
    </FlexBox>

    <FlexBox direction="column" :gap="3">
      <BlockText element="h4">
        {{ $t('profile.activityHistory.detail.origin') }}
      </BlockText>
      <DataList>
        <DataListItem :label="$t('profile.activityHistory.detail.browser')">
          <BlockText size="sm" :tone="browser ? undefined : 'tertiary'">
            {{ browser || unavailable }}
          </BlockText>
        </DataListItem>
        <DataListItem :label="$t('profile.activityHistory.detail.device')">
          <BlockText size="sm" :tone="device ? undefined : 'tertiary'">
            {{ device || unavailable }}
          </BlockText>
        </DataListItem>
        <DataListItem :label="$t('profile.activityHistory.detail.location')">
          <BlockText size="sm" :tone="location ? undefined : 'tertiary'">
            {{ location || unavailable }}
          </BlockText>
        </DataListItem>
        <DataListItem :label="$t('profile.activityHistory.table.ipAddress')">
          <BlockText size="sm" :tone="record.ipAddress ? undefined : 'tertiary'">
            {{ record.ipAddress || unavailable }}
          </BlockText>
        </DataListItem>
      </DataList>
    </FlexBox>

    <FlexBox justify-content="flex-end">
      <BaseButton variant="soft" tone="neutral" @click="modal.close()">
        {{ $t('accessibility.close') }}
      </BaseButton>
    </FlexBox>
  </FlexBox>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { DialogTitleId } from '@/library/components/dialog'
import BaseButton from '@/library/components/buttons/BaseButton.vue'
import DataList from '@/library/components/datalist/DataList.vue'
import DataListItem from '@/library/components/datalist/DataListItem.vue'
import FlexBox from '@/library/components/flex/FlexBox.vue'
import BlockText from '@/library/components/text/BlockText.vue'
import type { AuditDto } from '@/library/models/audit'
import { useAuditPresentation } from '@/shared/hooks/useAuditPresentation'
import { useModalStore } from '@/shared/stores/modal'
import { useProfileActivityDetails } from '../hooks/useProfileActivity'

const props = defineProps<{ record: AuditDto }>()
const titleId = inject(DialogTitleId, undefined)
const modal = useModalStore()

const { eventLabel, formatDateTime } = useAuditPresentation()
const { unavailable, browser, device, location } = useProfileActivityDetails(() => props.record)
</script>
