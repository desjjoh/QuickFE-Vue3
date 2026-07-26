<template>
  <Form @submit="onSubmit" :validation-schema="validationSchema" v-slot="{ errors }">
    <FormLayout :title="$t('settings.changePassword.title')">
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
                {{ $t('settings.changePassword.form.currentPassword') }}
              </FormLabel>
            </template>

            <PasswordInput
              :id="`${formId}-password`"
              name="password"
              autocomplete="current-password"
              :placeholder="$t('confirmation.passwordVerification.placeholder')"
              :disabled="loading"
              autofocus
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
              <FormLabel :for="`${formId}-new_password`">
                {{ $t('settings.changePassword.form.newPassword') }}
              </FormLabel>
            </template>

            <PasswordInput
              :id="`${formId}-new_password`"
              name="new_password"
              autocomplete="new-password"
              :placeholder="$t('settings.changePassword.form.newPasswordPlaceholder')"
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

            <template #error v-if="errors.new_password">
              {{ $t(errors.new_password) }}
            </template>
          </FormField>

          <FormField>
            <template #header>
              <FormLabel :for="`${formId}-confirm`">
                {{ $t('settings.changePassword.form.confirmPassword') }}
              </FormLabel>
            </template>

            <PasswordInput
              :id="`${formId}-confirm`"
              name="confirm"
              autocomplete="off"
              :placeholder="$t('settings.changePassword.form.confirmPasswordPlaceholder')"
              :disabled="loading"
            />

            <template #footer>
              <BlockText element="p" size="sm">
                {{ $t('settings.changePassword.form.helper') }}
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

import { useFormUtil } from '@/shared/hooks/useForm'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import FormLabel from '@/shared/components/text/FormLabel.vue'
import FormField from '@/shared/layouts/FormField.vue'
import FormLayout from '@/shared/layouts/FormLayout.vue'

import {
  validationSchema,
  type ChangePasswordFormProps,
  type ChangePasswordPayload,
} from '@/library/types/forms/change-password.ts'

import PasswordInput from '@/shared/components/inputs/PasswordInput.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import FormSection from '@/shared/layouts/FormSection.vue'
import { useErrorMessage } from '@/shared/hooks/useErrorMessage.ts'

const { callbackSubmit, callbackCancel } = defineProps<ChangePasswordFormProps>()
const { getSubmitFn } = useFormUtil()
const { getErrorMessage } = useErrorMessage()

const formId = useId()
const loading = ref<boolean>(false)
const submitError = ref<string | null>(null)

const onSubmit = getSubmitFn(validationSchema, async (values: ChangePasswordPayload) => {
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
