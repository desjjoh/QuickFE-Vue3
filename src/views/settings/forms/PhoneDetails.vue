<template>
  <Form
    :validation-schema="validationSchema"
    :initial-values="initialFormValues"
    @submit="onSubmit"
    v-slot="{ errors, values, setFieldValue }"
  >
    <FormLayout :title="$t('settings.phoneDetails.title')">
      <template #content>
        <FormField>
          <template #header>
            <FormLabel :for="`${formId}-phone`">
              {{ $t('settings.phoneDetails.form.phone') }}
            </FormLabel>
          </template>

          <PhoneInput
            :id="`${formId}-phone`"
            name="phone"
            :value="values.phone"
            :disabled="loading"
            default-country="CA"
            autofocus
            @update="(phone) => onPhoneUpdate(phone, setFieldValue)"
          />

          <template #footer>
            <BlockText size="sm" tone="secondary">
              {{ $t('settings.phoneDetails.form.helper') }}
            </BlockText>
          </template>

          <template #error v-if="errors.phone">
            {{ $t(errors.phone) }}
          </template>
        </FormField>
      </template>

      <template #errors v-if="!!submitError">
        {{ submitError }}
      </template>

      <template #actions>
        <BaseButton v-if="callbackCancel" variant="soft" tone="neutral" @click="callbackCancel">
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
import { Form, type FormActions, type GenericObject } from 'vee-validate'
import * as Yup from 'yup'
import { ref, useId } from 'vue'

import { useLibraryStore } from '@/stores/library'
import PhoneInput, { type PhoneInputValue } from '@/shared/components/inputs/PhoneInput.vue'

import FormLayout from '@/shared/layouts/FormLayout.vue'
import FormField from '@/shared/layouts/FormField.vue'
import FormLabel from '@/shared/components/text/FormLabel.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import { useErrorMessage } from '@/shared/hooks/useErrorMessage.ts'
import {
  PhoneDetailsDto,
  type PhoneDetailsInitialValues,
  type PhonePayload,
} from '@/library/types/forms/phone-details.ts'

type PhoneDetailsFormProps = {
  callbackSubmit: (values: PhonePayload) => Promise<void>
  callbackCancel?: () => void
  initialValues?: Partial<PhoneDetailsInitialValues>
}

type SetFieldValue = FormActions<PhoneDetailsInitialValues>['setFieldValue']

const { callbackSubmit, callbackCancel, initialValues } = defineProps<PhoneDetailsFormProps>()
const loading = ref(false)
const submitError = ref<string | null>(null)

const formId = useId()
const libraryStore = useLibraryStore()
const { getErrorMessage } = useErrorMessage()

const initialFormValues: PhoneDetailsInitialValues = {
  phone: initialValues?.phone,
}

const validationSchema = Yup.object({
  phone: Yup.mixed<PhoneInputValue>()
    .required('validation.required')
    .test('phone-length', 'validation.phone', hasValidPhoneLength),
})

async function onSubmit(formValues: GenericObject): Promise<void> {
  const payload = createPayload(formValues as PhoneDetailsInitialValues)
  loading.value = true
  submitError.value = null

  return callbackSubmit(payload)
    .catch((error: unknown) => {
      submitError.value = getErrorMessage(error)
    })
    .finally(() => {
      loading.value = false
    })
}

function onPhoneUpdate(value: PhoneInputValue | undefined, setFieldValue: SetFieldValue): void {
  setFieldValue('phone', value, true)
}

function createPayload(formValues: PhoneDetailsInitialValues): PhonePayload {
  if (!formValues.phone) {
    throw new Error('Phone value is required before creating the update payload.')
  }

  return new PhoneDetailsDto(formValues.phone)
}

function hasValidPhoneLength(value: unknown): value is PhoneInputValue {
  if (typeof value !== 'object' || value === null) return false

  const candidate = value as Partial<PhoneInputValue>

  if (!candidate.phone_national_number) return false

  const country = libraryStore.countries.find((country) => {
    return country.id === candidate.phone_country_id
  })

  const expectedLength = country
    ? country.phone_format_groups.reduce((total, groupSize) => total + groupSize, 0)
    : 10

  return candidate.phone_national_number.length === expectedLength
}
</script>
