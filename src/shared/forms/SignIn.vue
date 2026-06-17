<template>
  <Form @submit="onSubmit" :validation-schema="validationSchema" v-slot="{ errors }">
    <FormLayout>
      <template #header>
        <BlockText element="h3">{{ $t('auth.signIn.title') }}</BlockText>
      </template>

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
            data-autofocus
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

            <AppLink :href="{ name: 'auth-password-reset-token' }" external>
              {{ $t('auth.signIn.password.forgot') }}
            </AppLink>
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
                <AppLink :href="{ name: 'auth-resend-verification-email' }" external>
                  {{ $t('auth.signIn.verification.resend.link') }}
                </AppLink>
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
import type { AxiosError } from 'axios'
import { Form } from 'vee-validate'
import { ref, useId } from 'vue'

import { useFormUtil } from '@/shared/hooks/useForm'

import BlockText from '@/shared/components/text/BlockText.vue'
import TextField from '@/shared/components/inputs/TextField.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import AppLink from '@/shared/components/links/AppLink.vue'

import FormLayout from '@/shared/layouts/FormLayout.vue'
import FormField from '@/shared/layouts/FormField.vue'

import { validationSchema, type FormValues, type proptype } from '@/shared/types/forms/sign-in'
import FormLabel from '@/shared/components/text/FormLabel.vue'
import PasswordInput from '../components/inputs/PasswordInput.vue'

const { callbackSubmit, callback } = defineProps<proptype>()
const { getSubmitFn } = useFormUtil()

const submitError = ref<string | null>(null)

const loading = ref<boolean>(false)
const formId = useId()

const onSubmit = getSubmitFn(validationSchema, async (values: FormValues) => {
  loading.value = true
  callbackSubmit(values)
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
})
</script>
