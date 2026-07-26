<template>
  <Form @submit="onSubmit" :validation-schema="validationSchema" v-slot="{ errors }">
    <FormLayout :title="$t('auth.signIn.title')">
      <template #content>
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
            autofocus
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

            <LinkButton type="button" @click="callbackForgotPassword">
              {{ $t('auth.signIn.password.forgot') }}
            </LinkButton>
          </template>

          <PasswordInput
            :id="`${formId}-password`"
            name="password"
            type="password"
            autocomplete="current-password"
            :placeholder="$t('auth.signIn.password.placeholder')"
            :disabled="loading"
          />

          <template #footer>
            <BlockText size="sm">
              <i18n-t keypath="auth.signIn.verification.resend.base" tag="span" scope="global">
                <LinkButton type="button" @click="callbackResendRegistration">
                  {{ $t('auth.signIn.verification.resend.link') }}
                </LinkButton>
              </i18n-t>
            </BlockText>
          </template>

          <template #error v-if="errors.password">
            {{ $t(errors.password) }}
          </template>
        </FormField>
      </template>

      <template #errors v-if="!!submitError">
        {{ submitError }}
      </template>

      <template #actions>
        <BaseButton variant="soft" @click="callback">
          {{ $t('auth.signIn.actions.createAccount') }}
        </BaseButton>

        <BaseButton type="submit" :loading="loading">
          {{ $t('auth.signIn.actions.submit') }}
        </BaseButton>
      </template>
    </FormLayout>
  </Form>
</template>

<script setup lang="ts">
import { Form } from 'vee-validate'
import { ref, useId } from 'vue'

import { useFormUtil } from '@/shared/hooks/useForm'

import BlockText from '@/shared/components/text/BlockText.vue'
import TextField from '@/shared/components/inputs/TextField.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import LinkButton from '@/shared/components/buttons/LinkButton.vue'

import FormLayout from '@/shared/layouts/FormLayout.vue'
import FormField from '@/shared/layouts/FormField.vue'

import { validationSchema, type FormValues, type proptype } from '@/library/types/forms/sign-in'
import FormLabel from '@/shared/components/text/FormLabel.vue'
import PasswordInput from '@/shared/components/inputs/PasswordInput.vue'
import { useErrorMessage } from '@/shared/hooks/useErrorMessage.ts'

const { callbackSubmit, callback, callbackForgotPassword, callbackResendRegistration } =
  defineProps<proptype>()

const { getSubmitFn } = useFormUtil()

const { getErrorMessage } = useErrorMessage()

const submitError = ref<string | null>(null)

const loading = ref<boolean>(false)
const formId = useId()

const onSubmit = getSubmitFn(validationSchema, async (values: FormValues) => {
  loading.value = true
  submitError.value = null

  return callbackSubmit(values)
    .catch((error: unknown) => {
      submitError.value = getErrorMessage(error)
    })
    .finally(() => {
      loading.value = false
    })
})
</script>
