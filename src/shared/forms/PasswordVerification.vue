<template>
  <Form @submit="onSubmit" :validation-schema="validationSchema" v-slot="{ errors }">
    <FormLayout>
      <template #header>
        <BlockText element="h3">{{ $t('confirmation.passwordVerification.title') }}</BlockText>
      </template>

      <template #content>
        <BlockText>
          {{ $t('confirmation.passwordVerification.description') }}
        </BlockText>

        <!-- PASSWORD -->
        <FormField>
          <PasswordInput
            :id="`${formId}-password`"
            name="password"
            autocomplete="off"
            :placeholder="$t('confirmation.passwordVerification.placeholder')"
            :disabled="loading"
            data-autofocus
          />

          <template #footer>
            <BlockText size="sm"> {{ $t('confirmation.passwordVerification.helper') }} </BlockText>
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
        <BaseButton tone="neutral" variant="soft" @callback="callbackCancel">
          {{ $t('confirmation.passwordVerification.actions.cancel') }}
        </BaseButton>

        <BaseButton type="submit" :loading="loading">
          {{ $t('confirmation.passwordVerification.actions.confirm') }}
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
import BaseButton from '@/shared/components/buttons/BaseButton.vue'

import FormLayout from '@/shared/layouts/FormLayout.vue'
import FormField from '@/shared/layouts/FormField.vue'

import {
  validationSchema,
  type FormValues,
  type proptype,
} from '@/shared/types/forms/password-verification'
import type { AxiosError } from 'axios'
import PasswordInput from '../components/inputs/PasswordInput.vue'

const { callbackSubmit, callbackCancel } = defineProps<proptype>()
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
