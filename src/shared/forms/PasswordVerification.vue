<template>
  <Form @submit="onSubmit" :validation-schema="validationSchema" v-slot="{ errors }">
    <FormLayout :title="$t('confirmation.passwordVerification.title')">
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
            autofocus
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
        <BaseButton tone="neutral" variant="soft" @click="callbackCancel">
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
} from '@/library/types/forms/password-verification'
import type { AxiosError } from 'axios'
import PasswordInput from '../components/inputs/PasswordInput.vue'
import { useErrorMessage } from '../hooks/useErrorMessage.ts'

const { callbackSubmit, callbackCancel } = defineProps<proptype>()

const { getSubmitFn } = useFormUtil()
const { getErrorMessage } = useErrorMessage()

const submitError = ref<string | null>(null)

const loading = ref<boolean>(false)
const formId = useId()

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
