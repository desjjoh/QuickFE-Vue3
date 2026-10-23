<template>
  <form @submit.prevent="apply">
    <FormLayout :title="t(`${namespace}.label`)" block-actions>
      <template #content>
        <BlockText size="sm" tone="secondary">{{ t(`${namespace}.description`) }}</BlockText>

        <FormSection :title="t(`${namespace}.sections.actor`)">
          <FormField>
            <template #header>
              <FormLabel :for="`${id}-actorType`">{{ t(`${namespace}.actorType`) }}</FormLabel>
            </template>
            <SelectInput
              :id="`${id}-actorType`"
              name="actorType"
              :value="draft.actorType"
              :options="actorTypes"
              :get-label="actorLabel"
              :get-key="(value) => value"
              @update="draft.actorType = $event ?? ''"
            />
          </FormField>
          <FormField>
            <template #header>
              <FormLabel :for="`${id}-actorId`">{{ t(`${namespace}.actorId`) }}</FormLabel>
            </template>
            <TextField
              :id="`${id}-actorId`"
              name="actorId"
              :value="draft.actorId"
              :maxlength="255"
              :placeholder="t(`${namespace}.actorIdPlaceholder`)"
              @update="draft.actorId = $event ?? ''"
            />
          </FormField>
        </FormSection>

        <FormSection :title="t(`${namespace}.sections.activity`)">
          <FormField>
            <template #header>
              <FormLabel :for="`${id}-event`">{{ t(`${namespace}.event`) }}</FormLabel>
            </template>
            <SelectInput
              :id="`${id}-event`"
              name="event"
              :value="draft.event"
              :options="events"
              :get-label="eventOptionLabel"
              :get-key="(value) => value"
              @update="draft.event = $event ?? ''"
            />
          </FormField>
        </FormSection>

        <FormSection :title="t(`${namespace}.sections.context`)">
          <FormField>
            <template #header>
              <FormLabel :for="`${id}-domain`">{{ t(`${namespace}.domain`) }}</FormLabel>
            </template>
            <SelectInput
              :id="`${id}-domain`"
              name="domain"
              :value="draft.domain"
              :options="domains"
              :get-label="domainLabel"
              :get-key="(value) => value"
              @update="draft.domain = $event ?? ''"
            />
          </FormField>
        </FormSection>

        <FormSection :title="t(`${namespace}.sections.dateRange`)">
          <FormField v-for="field in dateFields" :key="field.key">
            <template #header>
              <FormLabel :for="`${id}-${field.key}`">{{
                t(`${namespace}.${field.label}`)
              }}</FormLabel>
            </template>
            <DateInput
              :id="`${id}-${field.key}`"
              :name="field.key"
              :value="draft[field.key]"
              @update="draft[field.key] = $event ?? ''"
            />
          </FormField>
        </FormSection>

        <BlockText v-if="error" role="alert">{{ t(`${namespace}.errors.${error}`) }}</BlockText>
      </template>

      <template #actions>
        <BaseButton
          type="button"
          variant="soft"
          tone="warning"
          :disabled="submitting"
          @click="clear"
        >
          {{ t(`${namespace}.clear`) }}
        </BaseButton>

        <BaseButton type="submit" :loading="submitting">{{ t(`${namespace}.apply`) }}</BaseButton>
      </template>
    </FormLayout>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'

import FormLayout from '@/shared/layouts/FormLayout.vue'
import FormSection from '@/shared/layouts/FormSection.vue'
import FormField from '@/shared/layouts/FormField.vue'
import BlockText from '@/library/components/text/BlockText.vue'
import FormLabel from '@/library/components/text/FormLabel.vue'
import SelectInput from '@/library/components/inputs/SelectInput.vue'
import TextField from '@/library/components/inputs/TextField.vue'
import DateInput from '@/library/components/inputs/DateInput.vue'
import BaseButton from '@/library/components/buttons/BaseButton.vue'
import { useOffcanvasSubmit } from '@/shared/hooks/useOffcanvasSubmit'
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

const { handleOffcanvasSubmit } = useOffcanvasSubmit()
const submitAction = handleOffcanvasSubmit((action: () => Promise<void>) => action(), {
  keepOpenOnError: true,
  onError: () => {
    error.value = 'applyFailed'
  },
})

async function submit(action: () => Promise<void>) {
  if (submitting.value) return
  submitting.value = true

  try {
    await submitAction(action)
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
