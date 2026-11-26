<template>
  <FlexBox direction="column" :gap="6">
    <BlockText :id="titleId" element="h3">{{
      $t('profile.activityHistory.detail.title')
    }}</BlockText>

    <template v-if="record">
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
          <DataListItem
            v-for="field in originFields"
            :key="field.key"
            :label="$t(`profile.activityHistory.${field.key}`)"
          >
            <BlockText size="sm" :tone="field.value ? undefined : 'tertiary'">
              {{ field.value || unavailable }}
            </BlockText>
          </DataListItem>
        </DataList>
      </FlexBox>
    </template>
    <BlockText v-else-if="profile.activityDetail.detailError" role="alert">
      {{ $t('profile.activityHistory.detail.loadFailed') }}
    </BlockText>

    <FlexBox justify-content="flex-end">
      <BaseButton variant="soft" tone="neutral" @click="modal.close()">
        {{ $t('accessibility.close') }}
      </BaseButton>
    </FlexBox>
  </FlexBox>
</template>

<script setup lang="ts">
import { computed, inject, onScopeDispose, watch } from 'vue'
import { DialogTitleId } from '@/library/components/dialog'
import BaseButton from '@/library/components/buttons/BaseButton.vue'
import DataList from '@/library/components/datalist/DataList.vue'
import DataListItem from '@/library/components/datalist/DataListItem.vue'
import FlexBox from '@/library/components/flex/FlexBox.vue'
import BlockText from '@/library/components/text/BlockText.vue'
import { useAuditPresentation } from '@/shared/hooks/useAuditPresentation'
import { useModalStore } from '@/shared/stores/modal'
import { useProfileActivityDetails } from '../hooks/useProfileActivity'
import { useProfileStore } from '../stores/profile'

const props = defineProps<{ activityId: string }>()
const titleId = inject(DialogTitleId, undefined)
const modal = useModalStore()
const profile = useProfileStore()
const owner = modal.$instanceKey
const record = computed(() => profile.activityDetail.detail)

const { eventLabel, formatDateTime } = useAuditPresentation()
const { unavailable, originFields } = useProfileActivityDetails(() => record.value)
const clear = () => profile.clearActivityDetail(owner)

watch(
  () => modal.isOpen && modal.$instanceKey === owner,
  (active) => {
    if (!active) clear()
  },
  { flush: 'sync' },
)
onScopeDispose(clear)

await profile.loadActivityDetail(props.activityId, owner)
</script>
