<template>
  <Form :validation-schema="validationSchema" v-slot="{ errors }">
    <FormLayout>
      <template #content>
        <FormField>
          <template #header>
            <FormLabel :for="`${formId}-phone`">
              {{ $t('common.phone') }}
            </FormLabel>
          </template>

          <PhoneInput
            :id="`${formId}-phone`"
            name="phone"
            :value="values.phone"
            data-autofocus
            @update="onPhoneUpdate"
          />

          <template #error v-if="errors.phone">
            {{ $t(errors.phone) }}
          </template>
        </FormField>
      </template>
    </FormLayout>
  </Form>
</template>

<script setup lang="ts">
import { Form, useForm } from 'vee-validate'
import * as Yup from 'yup'

import { useLibraryStore } from '@/stores/library'
import PhoneInput, { type PhoneInputValue } from '@/shared/components/inputs/PhoneInput.vue'
import FormLayout from '../layouts/FormLayout.vue'
import FormField from '../layouts/FormField.vue'
import { useId } from 'vue'
import FormLabel from '../components/text/FormLabel.vue'

type UserFormValues = {
  phone: PhoneInputValue | undefined
}

type UpdateUserPayload = {
  phone_country_id: string
  phone_calling_code: string
  phone_national_number: string
  phone_e164: string
}

const formId = useId()
const libraryStore = useLibraryStore()

const existingUserPhone: PhoneInputValue = {
  phone_country_id: 'Hqh7RiyktuiK3gWX',
  phone_calling_code: '+61',
  phone_national_number: '465551234',
  phone_e164: '+61465551234',
}

const validationSchema = Yup.object({
  phone: Yup.mixed<PhoneInputValue>()
    .required('validation.required')
    .test('phone-length', 'validation.phone', hasValidPhoneLength),
})

const { values, handleSubmit, setFieldValue } = useForm<UserFormValues>({
  validationSchema,
  initialValues: {
    phone: existingUserPhone,
  },
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const onSubmit = handleSubmit((formValues: UserFormValues) => {
  const payload = createPayload(formValues)

  console.log(payload)
})

function onPhoneUpdate(value: PhoneInputValue | undefined): void {
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

<style scoped lang="scss">
.phone-form {
  display: grid;
  gap: space(2);
}

.phone-form__error {
  margin: 0;
  color: color(theme, danger, dark-alpha, 11);
}
</style>
