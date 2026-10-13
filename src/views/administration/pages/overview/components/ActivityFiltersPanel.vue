<template>
  <form @submit.prevent="apply">
    <FormLayout :title="t(`${namespace}.label`)">
      <template #content>
        <BlockText size="sm" tone="secondary">{{ t(`${namespace}.description`) }}</BlockText>
        <FlexBox direction="column" :gap="2">
          <FormLabel :for="`${id}-domain`">{{ t(`${namespace}.domain`) }}</FormLabel>
          <SelectInput
            :id="`${id}-domain`"
            name="domain"
            :value="draft.domain"
            :options="domains"
            :get-label="domainLabel"
            :get-key="(value) => value"
            @update="draft.domain = $event ?? ''"
          />
        </FlexBox>
        <FlexBox direction="column" :gap="2">
          <FormLabel :for="`${id}-event`">{{ t(`${namespace}.event`) }}</FormLabel>
          <SelectInput
            :id="`${id}-event`"
            name="event"
            :value="draft.event"
            :options="events"
            :get-label="eventOptionLabel"
            :get-key="(value) => value"
            @update="draft.event = $event ?? ''"
          />
        </FlexBox>
        <FlexBox direction="column" :gap="2">
          <FormLabel :for="`${id}-actorType`">{{ t(`${namespace}.actorType`) }}</FormLabel>
          <SelectInput
            :id="`${id}-actorType`"
            name="actorType"
            :value="draft.actorType"
            :options="actorTypes"
            :get-label="actorLabel"
            :get-key="(value) => value"
            @update="draft.actorType = $event ?? ''"
          />
        </FlexBox>
        <FlexBox direction="column" :gap="2">
          <FormLabel :for="`${id}-actorId`">{{ t(`${namespace}.actorId`) }}</FormLabel>
          <TextField
            :id="`${id}-actorId`"
            name="actorId"
            :value="draft.actorId"
            :maxlength="255"
            :placeholder="t(`${namespace}.actorIdPlaceholder`)"
            @update="draft.actorId = $event ?? ''"
          />
        </FlexBox>
        <FlexBox v-for="field in dateFields" :key="field.key" direction="column" :gap="2">
          <FormLabel :for="`${id}-${field.key}`">{{ t(`${namespace}.${field.label}`) }}</FormLabel>
          <DateInput
            :id="`${id}-${field.key}`"
            :name="field.key"
            :value="draft[field.key]"
            @update="draft[field.key] = $event ?? ''"
          />
        </FlexBox>
        <BlockText size="sm" tone="secondary">{{ t(`${namespace}.dateHint`) }}</BlockText>
        <BlockText v-if="error" role="alert">{{ t(`${namespace}.errors.${error}`) }}</BlockText>
        <BaseButton
          type="button"
          tone="neutral"
          variant="ghost"
          :disabled="submitting"
          @click="clear"
          >{{ t(`${namespace}.clear`) }}</BaseButton
        >
      </template>
      <template #actions>
        <BaseButton
          type="button"
          variant="soft"
          tone="neutral"
          :disabled="submitting"
          @click="offcanvas.close()"
          >{{ t(`${namespace}.cancel`) }}</BaseButton
        >
        <BaseButton type="submit" :loading="submitting">{{ t(`${namespace}.apply`) }}</BaseButton>
      </template>
    </FormLayout>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'

import FormLayout from '@/shared/layouts/FormLayout.vue'
import FlexBox from '@/library/components/flex/FlexBox.vue'
import BlockText from '@/library/components/text/BlockText.vue'
import FormLabel from '@/library/components/text/FormLabel.vue'
import SelectInput from '@/library/components/inputs/SelectInput.vue'
import TextField from '@/library/components/inputs/TextField.vue'
import DateInput from '@/library/components/inputs/DateInput.vue'
import BaseButton from '@/library/components/buttons/BaseButton.vue'
import { useOffcanvas } from '@/shared/stores/offcanvas'
import { useReferenceTranslations } from '@/shared/hooks/useReferenceTranslations'
import { useAuditPresentation } from '@/shared/hooks/useAuditPresentation'
import { AUDIT_EVENTS } from '@/config/audit-events'
import {
  auditActorTypes,
  validateActivityFilters,
  type ActivityFilterDraft,
  type ActivityFilterError,
} from '@/views/administration/helpers/activity-filters'

const props = defineProps<{
  initialFilters: ActivityFilterDraft
  onApply: (filters: ActivityFilterDraft) => Promise<void>
  onClear: () => Promise<void>
}>()

const namespace = 'administration.overview.activity.filters'

const { t } = useI18n()
const { activityDomainLabel } = useReferenceTranslations()
const { eventLabel } = useAuditPresentation()

const offcanvas = useOffcanvas()
const id = useId()
const draft = reactive({ ...props.initialFilters })
const submitting = ref(false)
const error = ref<ActivityFilterError | 'applyFailed' | null>(null)
const domains = computed(() => [...new Set(['', 'identity', 'articles', draft.domain])])
const events = computed(() => [...new Set(['', ...AUDIT_EVENTS, draft.event])])
const actorTypes = computed(() => [...new Set(['', ...auditActorTypes, draft.actorType])])
const dateFields = [
  { key: 'occurredFrom', label: 'dateFrom' },
  { key: 'occurredTo', label: 'dateTo' },
] as const

const domainLabel = (value: string) =>
  value ? activityDomainLabel(value) : t(`${namespace}.anyDomain`)
const eventOptionLabel = (value: string) => (value ? eventLabel(value) : t(`${namespace}.anyEvent`))
const actorLabel = (value: string) =>
  value
    ? (auditActorTypes as readonly string[]).includes(value)
      ? t(`${namespace}.actorTypes.${value}`)
      : value
    : t(`${namespace}.anyActor`)

async function submit(action: () => Promise<void>) {
  if (submitting.value) return
  submitting.value = true
  try {
    await action()
  } catch {
    error.value = 'applyFailed'
  } finally {
    submitting.value = false
  }
}

async function apply() {
  error.value = validateActivityFilters(draft)
  if (!error.value) await submit(() => props.onApply({ ...draft }))
}

async function clear() {
  error.value = null
  await submit(props.onClear)
}
</script>
