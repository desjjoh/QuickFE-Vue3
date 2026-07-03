<template>
  <Form
    :validation-schema="validationSchema"
    :initial-values="initialFormValues"
    @submit="onSubmit"
    v-slot="{ errors, values, setFieldValue }"
  >
    <FormLayout>
      <template #header>
        <BlockText element="h3">
          {{ $t('settings.phoneDetails.title') }}
        </BlockText>
      </template>

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
            data-autofocus
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

import FormLayout from '../layouts/FormLayout.vue'
import FormField from '../layouts/FormField.vue'
import FormLabel from '../components/text/FormLabel.vue'
import BlockText from '../components/text/BlockText.vue'
import BaseButton from '../components/buttons/BaseButton.vue'

type UserFormValues = {
  phone: PhoneInputValue | undefined
}

type UpdateUserPayload = {
  phone_country_id: string
  phone_calling_code: string
  phone_national_number: string
  phone_e164: string
}

type PhoneDetailsFormProps = {
  callbackSubmit: (values: UpdateUserPayload) => Promise<void>
  callbackCancel?: () => void
}

type SetFieldValue = FormActions<UserFormValues>['setFieldValue']

const { callbackSubmit, callbackCancel } = defineProps<PhoneDetailsFormProps>()
const loading = ref(false)

const formId = useId()
const libraryStore = useLibraryStore()

const initialFormValues: UserFormValues = {
  phone: undefined,
}

const validationSchema = Yup.object({
  phone: Yup.mixed<PhoneInputValue>()
    .required('validation.required')
    .test('phone-length', 'validation.phone', hasValidPhoneLength),
})

async function onSubmit(formValues: GenericObject): Promise<void> {
  const payload = createPayload(formValues as UserFormValues)
  loading.value = true

  callbackSubmit(payload).finally(() => {
    loading.value = false
  })
}

function onPhoneUpdate(value: PhoneInputValue | undefined, setFieldValue: SetFieldValue): void {
  setFieldValue('phone', value, true)
}

function createPayload(formValues: UserFormValues): UpdateUserPayload {
  if (!formValues.phone) {
    throw new Error('Phone value is required before creating the update payload.')
  }

  return {
    phone_country_id: formValues.phone.phone_country_id,
    phone_calling_code: formValues.phone.phone_calling_code,
    phone_national_number: formValues.phone.phone_national_number,
    phone_e164: formValues.phone.phone_e164,
  }
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
