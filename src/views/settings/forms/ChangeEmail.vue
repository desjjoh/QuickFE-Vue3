<template>
  <Form @submit="onSubmit" :validation-schema="validationSchema" v-slot="{ errors }">
    <FormLayout>
      <template #header>
        <BlockText element="h3">
          {{ $t('settings.changeEmail.title') }}
        </BlockText>
      </template>

      <template #content>
        <FormSection>
          <input
            v-show="false"
            type="text"
            name="username"
            autocomplete="username"
            readonly
            aria-hidden="true"
          />

          <FormField>
            <template #header>
              <FormLabel :for="`${formId}-confirm`">
                {{ $t('settings.changeEmail.form.currentPassword') }}
              </FormLabel>
            </template>

            <PasswordInput
              :id="`${formId}-password`"
              name="password"
              autocomplete="current-password"
              :placeholder="$t('confirmation.passwordVerification.placeholder')"
              :disabled="loading"
              data-autofocus
            />

            <template #footer>
              <BlockText size="sm">
                {{ $t('confirmation.passwordVerification.helper') }}
              </BlockText>
            </template>

            <template #error v-if="errors.password">
              {{ $t(errors.password) }}
            </template>
          </FormField>
        </FormSection>

        <FormSection>
          <FormField>
            <template #header>
              <FormLabel :for="`${formId}-email`">
                {{ $t('settings.changeEmail.form.newEmail') }}
              </FormLabel>
            </template>

            <TextField
              :id="`${formId}-email`"
              name="email"
              type="email"
              autocomplete="email"
              :placeholder="$t('settings.changeEmail.form.newEmailPlaceholder')"
              :disabled="loading"
              data-autofocus
            />

            <template #error v-if="errors.email">
              {{ $t(errors.email) }}
            </template>
          </FormField>

          <FormField>
            <template #header>
              <FormLabel :for="`${formId}-confirm`">
                {{ $t('settings.changeEmail.form.confirmEmail') }}
              </FormLabel>
            </template>

            <TextField
              :id="`${formId}-confirm`"
              name="confirm"
              type="email"
              autocomplete="email"
              :placeholder="$t('settings.changeEmail.form.confirmEmailPlaceholder')"
              :disabled="loading"
            />

            <template #footer>
              <BlockText size="sm">
                {{ $t('settings.changeEmail.form.helper') }}
              </BlockText>
            </template>

            <template #error v-if="errors.confirm">
              {{ $t(errors.confirm) }}
            </template>
          </FormField>
        </FormSection>
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
import type { AxiosError } from 'axios'
import { Form } from 'vee-validate'
import { ref, useId } from 'vue'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import TextField from '@/shared/components/inputs/TextField.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import FormLabel from '@/shared/components/text/FormLabel.vue'
import { useFormUtil } from '@/shared/hooks/useForm'
import FormField from '@/shared/layouts/FormField.vue'
import FormLayout from '@/shared/layouts/FormLayout.vue'
import {
  validationSchema,
  type ChangeEmailFormProps,
  type ChangeEmailPayload,
} from '@/library/types/forms/change-email'
import PasswordInput from '@/shared/components/inputs/PasswordInput.vue'
import FormSection from '@/shared/layouts/FormSection.vue'
import { useErrorMessage } from '@/shared/hooks/useErrorMessage.ts'

const { callbackSubmit, callbackCancel } = defineProps<ChangeEmailFormProps>()
const { getSubmitFn } = useFormUtil()
const { getErrorMessage } = useErrorMessage()

const formId = useId()
const loading = ref<boolean>(false)
const submitError = ref<string | null>(null)

const onSubmit = getSubmitFn(validationSchema, async (values: ChangeEmailPayload) => {
  loading.value = true
  callbackSubmit(values)
    .catch((error: AxiosError) => {
      submitError.value = getErrorMessage(error)
    })
    .finally(() => {
      loading.value = false
    })
})
</script>
