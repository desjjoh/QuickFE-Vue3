<template>
  <Form @submit="onSubmit" :validation-schema="validationSchema" v-slot="{ errors }">
    <FormLayout :title="$t('auth.createAccount.title')">
      <template #content>
        <FormSection :title="$t('auth.createAccount.sections.personal.title')">
          <GridBox :gap="4" :columns="gridLayout">
            <!-- FIRST NAME -->
            <GridCell>
              <FormField>
                <template #header>
                  <FormLabel :for="`${formId}-first-name`">
                    {{ $t('auth.createAccount.name.first.label') }}
                  </FormLabel>
                </template>

                <TextField
                  :id="`${formId}-first-name`"
                  name="firstName"
                  autocomplete="given-name"
                  :placeholder="$t('auth.createAccount.name.first.placeholder')"
                  :disabled="loading"
                  autofocus
                />

                <template #error v-if="errors.firstName">
                  {{ $t(errors.firstName) }}
                </template>
              </FormField>
            </GridCell>

            <!-- LAST NAME -->
            <GridCell>
              <FormField>
                <template #header>
                  <FormLabel :for="`${formId}-last-name`">
                    {{ $t('auth.createAccount.name.last.label') }}
                  </FormLabel>
                </template>

                <TextField
                  :id="`${formId}-last-name`"
                  name="lastName"
                  autocomplete="family-name"
                  :placeholder="$t('auth.createAccount.name.last.placeholder')"
                  :disabled="loading"
                />

                <template #error v-if="errors.lastName">
                  {{ $t(errors.lastName) }}
                </template>
              </FormField>
            </GridCell>
          </GridBox>

          <GridBox :gap="4">
            <!-- GENDER -->
            <GridCell>
              <FormField>
                <template #header>
                  <FormLabel :for="`${formId}-gender`">
                    {{ $t('common.gender') }}
                  </FormLabel>
                </template>

                <SelectInput
                  :id="`${formId}-gender`"
                  name="gender"
                  :options="genders"
                  :get-label="genderLabel"
                  :get-key="(gender: GenderDto) => gender.id"
                  :disabled="loading"
                />

                <template #error v-if="errors.gender">
                  {{ $t(errors.gender) }}
                </template>
              </FormField>
            </GridCell>

            <!-- DATE OF BIRTH -->
            <GridCell>
              <FormField>
                <template #header>
                  <FormLabel :for="`${formId}-dob`">
                    {{ $t('common.dob') }}
                  </FormLabel>
                </template>

                <DateInput :id="`${formId}-dob`" name="dob" :disabled="loading" />

                <template #error v-if="errors.dob">
                  {{ $t(errors.dob) }}
                </template>
              </FormField>
            </GridCell>
          </GridBox>
        </FormSection>

        <FormSection :title="$t('auth.createAccount.sections.regional.title')">
          <GridBox :gap="4">
            <!-- COUNTRY -->
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
                  :get-label="countryLabel"
                  :get-key="(country: CountryDto) => country.id"
                  :disabled="loading"
                  autocomplete="country-name"
                />

                <template #error v-if="errors.country">
                  {{ $t(errors.country) }}
                </template>
              </FormField>
            </GridCell>

            <!-- TIMEZONE -->
            <GridCell>
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

                <template #error v-if="errors.timezone">
                  {{ $t(errors.timezone) }}
                </template>
              </FormField>
            </GridCell>
          </GridBox>
        </FormSection>

        <FormSection :title="$t('auth.createAccount.sections.account.title')">
          <!-- EMAIL -->
          <FormField>
            <template #header>
              <FormLabel :for="`${formId}-email`">
                {{ $t('auth.signIn.email.label') }}
              </FormLabel>
            </template>

            <TextField
              :id="`${formId}-email`"
              name="email"
              type="email"
              autocomplete="email"
              :placeholder="$t('auth.signIn.email.placeholder')"
              :disabled="loading"
            />

            <template #error v-if="errors.email">
              {{ $t(errors.email) }}
            </template>
          </FormField>

          <!-- PASSWORD -->
          <FormField>
            <template #header>
              <FormLabel :for="`${formId}-password`">
                {{ $t('auth.signIn.password.label') }}
              </FormLabel>
            </template>

            <PasswordInput
              :id="`${formId}-password`"
              name="password"
              type="password"
              autocomplete="current-password"
              :placeholder="$t('auth.createAccount.password.placeholder')"
              :disabled="loading"
            />

            <template #footer>
              <FlexBox direction="column">
                <BlockText size="sm">
                  {{ $t('auth.createAccount.password.validation.label') }}
                </BlockText>
                <ul style="list-style-type: circle">
                  <li v-for="idx in 4" :key="idx">
                    <BlockText size="sm">
                      {{ $t(`auth.createAccount.password.validation.contains.${idx}`) }}
                    </BlockText>
                  </li>
                </ul>
              </FlexBox>
            </template>

            <template #error v-if="errors.password">
              {{ $t(errors.password) }}
            </template>
          </FormField>

          <!-- TERMS + PRIVACY -->
          <BlockText>
            <i18n-t keypath="auth.createAccount.legal.base" tag="span" scope="global">
              <InlineText element="q">
                {{ $t('auth.createAccount.actions.createAccount') }}
              </InlineText>
              <AppLink href="#" external>
                {{ $t('auth.createAccount.legal.terms') }}
              </AppLink>
              <AppLink href="#" external>
                {{ $t('auth.createAccount.legal.privacy') }}
              </AppLink>
            </i18n-t>
          </BlockText>
        </FormSection>
      </template>

      <template #errors v-if="!!submitError">
        {{ submitError }}
      </template>

      <template #actions>
        <BaseButton variant="soft" @click="callback">
          {{ $t('auth.signIn.actions.submit') }}
        </BaseButton>

        <BaseButton type="submit" :loading="loading">
          {{ $t('auth.createAccount.actions.createAccount') }}
        </BaseButton>
      </template>
    </FormLayout>
  </Form>
</template>

<script setup lang="ts">
import type { AxiosError } from 'axios'

import { Form } from 'vee-validate'
import { computed, ref, useId, type ComputedRef, type Ref } from 'vue'

import FormSection from '@/shared/layouts/FormSection.vue'

import { useViewport } from '@/shared/hooks/useViewport'
import { useFormUtil } from '@/shared/hooks/useForm'

import BlockText from '@/shared/components/text/BlockText.vue'
import TextField from '@/shared/components/inputs/TextField.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import AppLink from '@/shared/components/links/AppLink.vue'
import InlineText from '@/shared/components/text/InlineText.vue'
import FormLabel from '@/shared/components/text/FormLabel.vue'

import FormLayout from '@/shared/layouts/FormLayout.vue'
import FormField from '@/shared/layouts/FormField.vue'

import FlexBox from '@/shared/components/flex/FlexBox.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'
import GridCell from '@/shared/components/grid/GridCell.vue'
import SelectInput from '@/shared/components/inputs/SelectInput.vue'

import {
  validationSchema,
  type FormValues,
  type proptype,
} from '@/library/types/forms/create-account'
import { useLibraryStore, type LibraryStore } from '@/stores/library.ts'
import type { CountryDto, GenderDto, TimezoneDto } from '@/library/models/reference.ts'
import DateInput from '@/shared/components/inputs/DateInput.vue'
import PasswordInput from '@/shared/components/inputs/PasswordInput.vue'
import { useReferenceTranslations } from '@/shared/hooks/useReferenceTranslations.ts'
import { sortTimezonesByOffset } from '@/helpers/time-zone.ts'
import { useErrorMessage } from '@/shared/hooks/useErrorMessage.ts'

const { countryLabel, genderLabel, timezoneLabel } = useReferenceTranslations()
const { callbackSubmit, callback } = defineProps<proptype>()
const { getSubmitFn } = useFormUtil()

const { getErrorMessage } = useErrorMessage()

const { isMobile } = useViewport()

const submitError: Ref<string | null, string | null> = ref<string | null>(null)
const loading: Ref<boolean, boolean> = ref<boolean>(false)

const formId: string = useId()
const libraryStore: LibraryStore = useLibraryStore()

const genders: ComputedRef<GenderDto[]> = computed<GenderDto[]>(() => libraryStore.genders)
const countries: ComputedRef<CountryDto[]> = computed<CountryDto[]>(() => libraryStore.countries)
const timezones: ComputedRef<TimezoneDto[]> = computed<TimezoneDto[]>((): TimezoneDto[] => {
  return sortTimezonesByOffset(libraryStore.timezones)
})

const gridLayout: ComputedRef<number> = computed<number>(() => {
  return isMobile.value ? 1 : 2
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
