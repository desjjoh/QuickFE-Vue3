<template>
  <Form @submit="onSubmit" :validation-schema="validationSchema" v-slot="{ errors }">
    <FormLayout :title="$t(`auth.${i18nKey}.title`)">
      <template #content>
        <FormField>
          <template #header>
            <FormLabel :for="`${formId}-email`">
              {{ $t('auth.createAccount.email.label') }}
            </FormLabel>
          </template>

          <TextField
            :id="`${formId}-email`"
            name="email"
            type="email"
            autocomplete="email"
            :placeholder="$t('auth.createAccount.email.placeholder')"
            :disabled="loading || isSuccess"
            autofocus
          />

          <template #footer>
            <BlockText size="sm">{{ $t(`auth.${i18nKey}.description`) }}</BlockText>
          </template>

          <template #error v-if="errors.email">
            {{ $t(errors.email) }}
          </template>
        </FormField>
      </template>

      <template #errors v-if="!!submitError">
        {{ submitError }}
      </template>

      <template #actions>
        <BaseButton
          v-if="callbackCancel"
          type="button"
          tone="neutral"
          variant="soft"
          @click="callbackCancel"
        >
          {{ $t('common.cancel') }}
        </BaseButton>

        <BaseButton type="submit" :loading="loading" :disabled="isSuccess">
          {{ $t('common.continue') }}
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
import { validationSchema, type FormValues } from '@/library/types/forms/email-token-request'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import TextField from '@/shared/components/inputs/TextField.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import FormLabel from '@/shared/components/text/FormLabel.vue'
import FormField from '@/shared/layouts/FormField.vue'
import FormLayout from '@/shared/layouts/FormLayout.vue'
import { useErrorMessage } from '@/shared/hooks/useErrorMessage'

type EmailTokenRequestKind = 'resendVerificationEmail' | 'passwordResetFlow.request'

const { callbackSubmit, callbackCancel, kind } = defineProps<{
  callbackSubmit: (values: FormValues) => Promise<void>
  callbackCancel?: () => void
  kind: EmailTokenRequestKind
}>()

const { getSubmitFn } = useFormUtil()
const { getErrorMessage } = useErrorMessage()

const formId = useId()
const loading = ref(false)
const isSuccess = ref(false)
const submitError = ref<string | null>(null)

const i18nKey = kind

const onSubmit = getSubmitFn(validationSchema, async (values: FormValues) => {
  loading.value = true
  submitError.value = null

  return callbackSubmit(values)
    .then(() => {
      isSuccess.value = true
    })
    .catch((error: AxiosError) => {
      submitError.value = getErrorMessage(error)
    })
    .finally(() => {
      loading.value = false
    })
})
</script>

<style scoped lang="scss">
.email-token-request__success {
  margin-top: space(4);
}
</style>
