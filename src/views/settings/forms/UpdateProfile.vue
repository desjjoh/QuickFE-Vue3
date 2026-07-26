<template>
  <Form
    @submit="onSubmit"
    :validation-schema="validationSchema"
    :initial-values="$initialValues"
    v-slot="{ errors }"
  >
    <FormLayout :title="$t('settings.profileInformation.title')">
      <template #content>
        <FormSection>
          <GridBox :gap="4" :columns="gridLayout">
            <!-- FIRST NAME -->
            <GridCell>
              <FormField>
                <template #header>
                  <FormLabel :for="`${formId}-first-name`">
                    {{ $t('settings.profileInformation.form.firstName') }}
                  </FormLabel>
                </template>

                <TextField
                  :id="`${formId}-first-name`"
                  name="firstName"
                  autocomplete="given-name"
                  :placeholder="$t('settings.profileInformation.form.firstNamePlaceholder')"
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
                    {{ $t('settings.profileInformation.form.lastName') }}
                  </FormLabel>
                </template>

                <TextField
                  :id="`${formId}-last-name`"
                  name="lastName"
                  autocomplete="family-name"
                  :placeholder="$t('settings.profileInformation.form.lastNamePlaceholder')"
                  :disabled="loading"
                />

                <template #error v-if="errors.lastName">
                  {{ $t(errors.lastName) }}
                </template>
              </FormField>
            </GridCell>

            <GridCell :span="gridLayout">
              <FormField>
                <template #header>
                  <FormLabel :for="`${formId}-preferred-name`">
                    {{ $t('settings.profileInformation.form.preferredName') }}
                  </FormLabel>
                </template>

                <TextField
                  :id="`${formId}-preferred-name`"
                  name="preferredName"
                  autocomplete="additional-name"
                  :placeholder="$t('settings.profileInformation.form.preferredNamePlaceholder')"
                  :disabled="loading"
                />

                <template #footer>
                  <BlockText size="sm">
                    {{ $t('settings.profileInformation.form.preferredNameHelper') }}
                  </BlockText>
                </template>

                <template #error v-if="errors.preferredName">
                  {{ $t(errors.preferredName) }}
                </template>
              </FormField>
            </GridCell>
          </GridBox>
        </FormSection>

        <FormSection>
          <GridBox :gap="4" :columns="gridLayout">
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

            <GridCell :span="gridLayout">
              <FormField>
                <template #header>
                  <FormLabel :for="`${formId}-bio`">
                    {{ $t('settings.profileInformation.form.bio') }}
                  </FormLabel>
                </template>

                <TextArea
                  :id="`${formId}-bio`"
                  name="bio"
                  :rows="4"
                  :placeholder="$t('settings.profileInformation.form.bioPlaceholder')"
                  :disabled="loading"
                />

                <template #error v-if="errors.bio">
                  {{ $t(errors.bio) }}
                </template>
              </FormField>
            </GridCell>
          </GridBox>
        </FormSection>
      </template>

      <template #errors v-if="!!submitError">
        {{ submitError }}
      </template>

      <template #actions>
        <BaseButton variant="soft" tone="neutral" @click="callback">
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

import { Form } from 'vee-validate'
import { computed, ref, useId, type ComputedRef, type Ref } from 'vue'

import {
  validationSchema,
  type FormValues,
  type proptype,
} from '@/library/types/forms/update-profile'

import { useLibraryStore, type LibraryStore } from '@/stores/library.ts'
import type { GenderDto } from '@/library/models/reference.ts'

import { useReferenceTranslations } from '@/shared/hooks/useReferenceTranslations.ts'
import { useViewport } from '@/shared/hooks/useViewport'
import { useFormUtil } from '@/shared/hooks/useForm'
import { useErrorMessage } from '@/shared/hooks/useErrorMessage.ts'

import BlockText from '@/shared/components/text/BlockText.vue'
import TextField from '@/shared/components/inputs/TextField.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import FormLabel from '@/shared/components/text/FormLabel.vue'
import DateInput from '@/shared/components/inputs/DateInput.vue'
import FormLayout from '@/shared/layouts/FormLayout.vue'
import FormField from '@/shared/layouts/FormField.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'
import GridCell from '@/shared/components/grid/GridCell.vue'
import SelectInput from '@/shared/components/inputs/SelectInput.vue'
import FormSection from '@/shared/layouts/FormSection.vue'
import TextArea from '@/shared/components/inputs/TextArea.vue'

const { genderLabel } = useReferenceTranslations()
const { callbackSubmit, callback, initialValues } = defineProps<proptype>()
const { getSubmitFn } = useFormUtil()

const { getErrorMessage } = useErrorMessage()

const { isMobile } = useViewport()

const formId: string = useId()
const libraryStore: LibraryStore = useLibraryStore()

const submitError: Ref<string | null, string | null> = ref<string | null>(null)
const loading: Ref<boolean, boolean> = ref<boolean>(false)

const $initialValues = computed(() => initialValues ?? {})

const genders: ComputedRef<GenderDto[]> = computed<GenderDto[]>(() => libraryStore.genders)
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
