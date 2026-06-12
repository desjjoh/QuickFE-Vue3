<template>
  <Form
    :key="formKey"
    @submit="onSubmit"
    :validation-schema="validationSchema"
    :initial-values="initialFormValues"
    v-slot="{ errors, values, setFieldValue, setFieldError }"
  >
    <FormLayout>
      <template #header>
        <BlockText element="h3">
          {{ $t('settings.addressDetails.title') }}
        </BlockText>
      </template>

      <template #content>
        <FormField>
          <template #header>
            <FormLabel :for="`${formId}-address-line-1`">
              {{ $t('settings.addressDetails.form.line1') }}
            </FormLabel>
          </template>

          <TextField
            :id="`${formId}-address-line-1`"
            name="addressLine1"
            autocomplete="address-line1"
            :placeholder="$t('settings.addressDetails.form.line1Placeholder')"
            :disabled="loading"
            data-autofocus
          />

          <template #error v-if="errors.addressLine1">
            {{ $t(errors.addressLine1) }}
          </template>
        </FormField>

        <FormField>
          <template #header>
            <FormLabel :for="`${formId}-address-line-2`">
              {{ $t('settings.addressDetails.form.line2') }}
            </FormLabel>
          </template>

          <TextField
            :id="`${formId}-address-line-2`"
            name="addressLine2"
            autocomplete="address-line2"
            :placeholder="$t('settings.addressDetails.form.line2Placeholder')"
            :disabled="loading"
          />

          <template #error v-if="errors.addressLine2">
            {{ $t(errors.addressLine2) }}
          </template>
        </FormField>

        <GridBox :columns="gridLayout" :gap="4">
          <GridCell>
            <FormField>
              <template #header>
                <FormLabel :for="`${formId}-country`">
                  {{ $t('common.country') }}
                </FormLabel>
              </template>

              <SelectInput
                :id="`${formId}-country`"
                name="country"
                :options="countries"
                :get-label="(country: CountryDto) => $t(getCountryLabel(country))"
                :get-key="(country: CountryDto) => country.id"
                :disabled="loading"
                @update="
                  (country) => onCountryUpdate(country, values, setFieldValue, setFieldError)
                "
              >
                <template #option="{ option }">
                  <span>{{ $t(getCountryLabel(option)) }}</span>
                </template>
              </SelectInput>

              <template #error v-if="errors.country">
                {{ $t(errors.country) }}
              </template>
            </FormField>
          </GridCell>

          <GridCell>
            <FormField>
              <template #header>
                <FormLabel :for="`${formId}-region`">
                  {{ $t('settings.addressDetails.form.region') }}
                </FormLabel>
              </template>

              <SelectInput
                :id="`${formId}-region`"
                name="region"
                :options="getRegions(values)"
                :get-label="getRegionLabel"
                :get-key="(region: RegionDto) => region.id"
                :disabled="loading || !values.country"
              />

              <template #error v-if="errors.region">
                {{ $t(errors.region) }}
              </template>
            </FormField>
          </GridCell>
        </GridBox>

        <GridBox :columns="gridLayout" :gap="4">
          <GridCell>
            <FormField>
              <template #header>
                <FormLabel :for="`${formId}-city`">
                  {{ $t('settings.addressDetails.form.city') }}
                </FormLabel>
              </template>

              <TextField
                :id="`${formId}-city`"
                name="city"
                autocomplete="address-level2"
                :placeholder="$t('settings.addressDetails.form.cityPlaceholder')"
                :disabled="loading"
              />

              <template #error v-if="errors.city">
                {{ $t(errors.city) }}
              </template>
            </FormField>
          </GridCell>

          <GridCell>
            <FormField>
              <template #header>
                <FormLabel :for="`${formId}-postal-code`">
                  {{ $t('settings.addressDetails.form.postalCode') }}
                </FormLabel>
              </template>

              <TextField
                :id="`${formId}-postal-code`"
                name="postalCode"
                autocomplete="postal-code"
                :placeholder="getPostalCodePlaceholder(values)"
                :disabled="loading || !values.country"
                @update="
                  (postalCode) =>
                    onPostalCodeUpdate(postalCode, values, setFieldValue, setFieldError)
                "
              />

              <template #error v-if="errors.postalCode">
                {{ $t(errors.postalCode) }}
              </template>
            </FormField>
          </GridCell>
        </GridBox>
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
import type { AxiosError } from 'axios'
import { Form, type FormActions, type GenericObject } from 'vee-validate'
import { computed, ref, useId } from 'vue'

import type { CountryDto, RegionDto } from '@/models/reference'
import { useLibraryStore } from '@/stores/library'
import { useViewport } from '@/shared/hooks/useViewport'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import SelectInput from '@/shared/components/inputs/SelectInput.vue'
import TextField from '@/shared/components/inputs/TextField.vue'
import FormLabel from '@/shared/components/text/FormLabel.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'
import GridCell from '@/shared/components/grid/GridCell.vue'
import FormField from '@/shared/layouts/FormField.vue'
import FormLayout from '@/shared/layouts/FormLayout.vue'

import {
  validationSchema,
  type AddressChangeFormProps,
  type AddressChangeInitialValues,
  type FormValues,
} from '@/shared/types/forms/address-change'
import BlockText from '../components/text/BlockText.vue'

type AddressFormValues = Partial<AddressChangeInitialValues>
type SetFieldValue = FormActions<AddressChangeInitialValues>['setFieldValue']
type SetFieldError = FormActions<AddressChangeInitialValues>['setFieldError']

const props = withDefaults(defineProps<AddressChangeFormProps>(), {
  initialValues: undefined,
})

const { isMobile } = useViewport()
const libraryStore = useLibraryStore()

const formId = useId()
const submitError = ref<string | null>(null)
const loading = ref<boolean>(false)

const DEFAULT_COUNTRY_ISO2 = 'CA'

const countries = computed<CountryDto[]>(() => libraryStore.countries)
const gridLayout = computed<number>(() => (isMobile.value ? 1 : 2))

const initialFormValues = computed<AddressChangeInitialValues>(() => {
  const country = props.initialValues?.country ?? getDefaultCountry(countries.value)

  return {
    addressLine1: props.initialValues?.addressLine1 ?? '',
    addressLine2: props.initialValues?.addressLine2 ?? '',
    city: props.initialValues?.city ?? '',
    country,
    region: props.initialValues?.region,
    postalCode: formatPostalCode(props.initialValues?.postalCode ?? '', country),
  }
})

const formKey = computed<string>(() => initialFormValues.value.country?.id ?? 'address-change')

async function onSubmit(formValues: GenericObject): Promise<void> {
  loading.value = true
  props
    .callbackSubmit(formValues as FormValues)
    .catch((error: AxiosError) => {
      const data = error.response?.data as { message?: string | string[] } | undefined
      const message = Array.isArray(data?.message)
        ? (data.message[0] ?? error.message)
        : (data?.message ?? error.message)

      submitError.value = message
    })
    .finally(() => {
      loading.value = false
    })
}

function getCountryLabel(country: CountryDto): string {
  return `library.countries.${country.iso2}`
}

function getRegionLabel(region: RegionDto): string {
  return region.label
}

function getDefaultCountry(countryOptions: CountryDto[]): CountryDto | undefined {
  return (
    countryOptions.find((country) => country.iso2 === DEFAULT_COUNTRY_ISO2) ?? countryOptions[0]
  )
}

function getSelectedCountry(formValues: AddressFormValues): CountryDto | undefined {
  return formValues.country
}

function getRegions(formValues: AddressFormValues): RegionDto[] {
  return getSelectedCountry(formValues)?.regions ?? []
}

function getPostalCodePlaceholder(formValues: AddressFormValues): string | undefined {
  const country = getSelectedCountry(formValues)

  if (!country) return undefined

  return formatPostalCode(country.postal_code_placeholder, country) || undefined
}

function onCountryUpdate(
  country: CountryDto | undefined,
  formValues: AddressFormValues,
  setFieldValue: SetFieldValue,
  setFieldError: SetFieldError,
): void {
  if (!country || !country.regions.some((region) => region.id === formValues.region?.id)) {
    setFieldValue('region', undefined, false)
    setFieldError('region', undefined)
  }

  updatePostalCode(
    formatPostalCode(formValues.postalCode ?? '', country),
    formValues,
    setFieldValue,
    setFieldError,
  )
}

function onPostalCodeUpdate(
  postalCode: string | undefined,
  formValues: AddressFormValues,
  setFieldValue: SetFieldValue,
  setFieldError: SetFieldError,
): void {
  updatePostalCode(
    formatPostalCode(postalCode ?? '', getSelectedCountry(formValues)),
    formValues,
    setFieldValue,
    setFieldError,
  )
}

function updatePostalCode(
  postalCode: string,
  formValues: AddressFormValues,
  setFieldValue: SetFieldValue,
  setFieldError: SetFieldError,
): void {
  if (postalCode === formValues.postalCode) return

  setFieldValue('postalCode', postalCode, false)
  setFieldError('postalCode', undefined)
}

function formatPostalCode(postalCode: string, country: CountryDto | undefined): string {
  const normalized = postalCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()

  if (!country?.postal_code_format_groups.length) return normalized

  const maxLength = country.postal_code_format_groups.reduce((total, group) => total + group, 0)
  const trimmed = normalized.slice(0, maxLength)
  const groups: string[] = []
  let cursor = 0

  for (const groupSize of country.postal_code_format_groups) {
    const group = trimmed.slice(cursor, cursor + groupSize)

    if (!group) break

    groups.push(group)
    cursor += groupSize
  }

  return groups.join(country.postal_code_format_separator)
}
</script>
