<template>
  <FlexBox direction="column" :gap="6">
    <BlockText :id="titleId" element="h3">{{ t(`${namespace}.title`) }}</BlockText>

    <FlexBox v-if="error" direction="column" :gap="3" role="alert">
      <BlockText>{{ t(`${namespace}.errors.${error}`) }}</BlockText>

      <BaseButton v-if="error === 'failed'" variant="surface" @click="retry">
        {{ t(`${namespace}.retry`) }}
      </BaseButton>
    </FlexBox>

    <template v-else-if="record">
      <FlexBox v-for="section in sections" :key="section.id" direction="column" :gap="3">
        <FlexBox direction="column" :gap="1">
          <BlockText element="h4">{{ t(`${namespace}.sections.${section.id}`) }}</BlockText>

          <template v-if="section.id === 'actor' && record.actorUser">
            <BlockText size="sm" tone="secondary">
              {{ t(`${namespace}.currentActor`) }}
            </BlockText>
          </template>
        </FlexBox>

        <DataList>
          <DataListItem
            v-for="field in section.fields"
            :key="field.key"
            :label="t(`${namespace}.fields.${field.key}`)"
          >
            <BaseBadge
              v-if="field.key === 'domain'"
              :tone="domainTone(record.domain)"
              variant="soft"
            >
              {{ field.value }}
            </BaseBadge>

            <BaseBadge
              v-else-if="field.key === 'actorStatus' && record.actorUser"
              :tone="statusTone(record.actorUser.status.key)"
              variant="soft"
            >
              {{ field.value }}
            </BaseBadge>

            <BlockText v-else size="sm" class="audit-detail__value">
              {{ field.value ?? t(`${namespace}.unavailable`) }}
            </BlockText>
          </DataListItem>
        </DataList>
      </FlexBox>

      <TabLayout v-model="activePayload">
        <template #tabs>
          <Tab v-for="payload in payloads" :id="payload.id" :key="payload.id">
            {{ t(`${namespace}.payloads.${payload.id}`) }}
          </Tab>
        </template>

        <template v-for="payload in payloads" :key="payload.id" #[payload.id]>
          <BlockText v-if="payload.value === null" tone="secondary">
            {{ t(`${namespace}.emptyPayload`) }}
          </BlockText>
          <JsonViewer v-else :item="payload.value" />
        </template>
      </TabLayout>
    </template>

    <FlexBox justify-content="flex-end">
      <BaseButton variant="soft" tone="neutral" @click="modal.close()">
        {{ t(`${namespace}.close`) }}
      </BaseButton>
    </FlexBox>
  </FlexBox>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { DialogTitleId } from '@/library/components/dialog'
import { useI18n } from 'vue-i18n'
import FlexBox from '@/library/components/flex/FlexBox.vue'
import BlockText from '@/library/components/text/BlockText.vue'
import BaseBadge from '@/library/components/badges/BaseBadge.vue'
import BaseButton from '@/library/components/buttons/BaseButton.vue'
import DataList from '@/library/components/datalist/DataList.vue'
import DataListItem from '@/library/components/datalist/DataListItem.vue'
import TabLayout from '@/library/components/tabs/TabLayout.vue'
import Tab from '@/library/components/tabs/TabButton.vue'
import JsonViewer from '@/library/components/text/JsonViewer.vue'
import { useModalStore } from '@/shared/stores/modal'
import { useAuditPresentation } from '@/shared/hooks/useAuditPresentation'
import { useReferenceTranslations } from '@/shared/hooks/useReferenceTranslations'
import { useUserPresentation } from '@/shared/hooks/useUserPresentation'
import { useAuditDetail } from '@/views/administration/hooks/useAuditDetail'

const props = defineProps<{ auditId: string }>()
const titleId = inject(DialogTitleId, undefined)
const namespace = 'administration.overview.activity.detail'
const { t } = useI18n()
const modal = useModalStore()
const modalKey = modal.getOptions.key
const { record, error, reload } = useAuditDetail(
  () => props.auditId,
  () => modal.isOpen && modal.getOptions.key === modalKey,
)

function retry(): void {
  modal.open({ ...modal.getOptions, renderKey: crypto.randomUUID() })
}

const { eventLabel, domainTone, formatDateTime } = useAuditPresentation()
const { activityDomainLabel, statusLabel } = useReferenceTranslations()
const { statusTone } = useUserPresentation()
const activePayload = ref('changes')

const sections = computed(() => {
  const item = record.value

  if (!item) return []
  const field = (key: string, value: string | null | undefined) => ({ key, value })

  return [
    {
      id: 'event',
      fields: [
        field('id', item.id),
        field('domain', activityDomainLabel(item.domain)),
        field('event', eventLabel(item.event)),
        field('source', item.source),
        field('reasonCode', item.reasonCode),
        field('occurredAt', formatDateTime(item.occurredAt)),
        field('createdAt', formatDateTime(item.createdAt)),
        field('updatedAt', formatDateTime(item.updatedAt)),
      ],
    },
    {
      id: 'actor',
      fields: [
        field('actorType', item.actorType),
        field('actorId', item.actorId),
        field('actorName', item.actorUser?.name),
        field('actorEmail', item.actorUser?.email),
        field('actorStatus', item.actorUser ? statusLabel(item.actorUser.status) : null),
      ],
    },
    {
      id: 'target',
      fields: [
        field('subjectType', item.subjectType),
        field('subjectId', item.subjectId),
        field('resourceType', item.resourceType),
        field('resourceId', item.resourceId),
      ],
    },
    {
      id: 'request',
      fields: [
        field('requestId', item.requestId),
        field('operationId', item.operationId),
        field('sessionId', item.sessionId),
        field('httpMethod', item.httpMethod),
        field('route', item.route),
        field('ipAddress', item.ipAddress),
        field(
          'location',
          [item.ipLocation.city, item.ipLocation.regionName, item.ipLocation.countryName]
            .filter(Boolean)
            .join(', ') || null,
        ),
        field('browser', [item.browser, item.browserVersion].filter(Boolean).join(' ') || null),
        field('device', item.device),
        field('os', [item.os, item.osVersion].filter(Boolean).join(' ') || null),
        field('userAgent', item.userAgent),
      ],
    },
  ]
})

const payloads = computed(() =>
  record.value
    ? [
        { id: 'changes', value: record.value.changes },
        { id: 'before', value: record.value.before },
        { id: 'after', value: record.value.after },
        { id: 'metadata', value: record.value.metadata },
      ]
    : [],
)

await reload()
</script>

<style scoped lang="scss">
.audit-detail__value {
  overflow-wrap: anywhere;
}
</style>
