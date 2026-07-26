<template>
  <Form
    @submit="onSubmit"
    :validation-schema="validationSchema"
    :initial-values="$initialValues"
    v-slot="{ errors }"
  >
    <FormLayout :title="$t('settings.regionTimeZone.title')">
      <template #content>
        <FormField>
          <template #header>
            <FormLabel :for="`${formId}-timezone`">
              {{ $t('common.timezone') }}
            </FormLabel>
          </template>

          <SelectInput
            :id="`${formId}-timezone`"
            name="timezone"
            :options="timezones"
            :get-label="timezoneLabel"
            :get-key="(timezone: TimezoneDto) => timezone.key"
            :disabled="loading"
          />

          <template #footer>
            <BlockText size="sm">
              {{ $t('settings.regionTimeZone.form.helper') }}
            </BlockText>
          </template>

          <template #error v-if="errors.timezone">
            {{ $t(errors.timezone) }}
          </template>
        </FormField>
      </template>

      <template #errors v-if="!!submitError">
        {{ submitError }}
      </template>

      <template #actions>
        <BaseButton v-if="callback" variant="soft" tone="neutral" @click="callback">
          {{ $t('common.cancel') }}
        </BaseButton>

        <BaseButton type="submit" :loading="loading">
          {{ $t('common.save') }}
        </BaseButton>
      </template>
    </FormLayout>
  </Form>
</template>

<script setup lang="ts">
import { type ComputedRef, type Ref, computed, ref, useId } from 'vue'
import { Form } from 'vee-validate'
import type { AxiosError } from 'axios'

import { useLibraryStore, type LibraryStore } from '@/stores/library'
import { sortTimezonesByOffset } from '@/helpers/time-zone'
import type { TimezoneDto } from '@/library/models/reference'

import { useReferenceTranslations } from '@/shared/hooks/useReferenceTranslations'

import FormLayout from '@/shared/layouts/FormLayout.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import FormField from '@/shared/layouts/FormField.vue'
import { useFormUtil } from '@/shared/hooks/useForm.ts'
import {
  validationSchema,
  type FormValues,
  type proptype,
} from '@/library/types/forms/update-timezone.ts'

import { useErrorMessage } from '@/shared/hooks/useErrorMessage.ts'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import SelectInput from '@/shared/components/inputs/SelectInput.vue'
import FormLabel from '@/shared/components/text/FormLabel.vue'

const { callbackSubmit, callback, initialValues } = defineProps<proptype>()

const { timezoneLabel } = useReferenceTranslations()
const { getSubmitFn } = useFormUtil()
const { getErrorMessage } = useErrorMessage()

const loading: Ref<boolean, boolean> = ref<boolean>(false)
const submitError: Ref<string | null, string | null> = ref<string | null>(null)

const formId: string = useId()
const libraryStore: LibraryStore = useLibraryStore()

const $initialValues = computed(() => initialValues ?? {})

const timezones: ComputedRef<TimezoneDto[]> = computed<TimezoneDto[]>((): TimezoneDto[] => {
  return sortTimezonesByOffset(libraryStore.timezones)
})

const onSubmit = getSubmitFn(validationSchema, async (values: FormValues) => {
  loading.value = true
  submitError.value = null

  return callbackSubmit(values)
    .catch((error: AxiosError) => {
      submitError.value = getErrorMessage(error)
    })
    .finally(() => {
      loading.value = false
    })
})
</script>
