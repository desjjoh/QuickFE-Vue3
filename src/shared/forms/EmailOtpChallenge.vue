<template>
  <Form :key="formKey" :validation-schema="validationSchema" @submit="onSubmit" v-slot="{ errors }">
    <FormLayout :title="title">
      <template #content>
        <BlockText>{{ description }}</BlockText>

        <FormField>
          <template #header>
            <FormLabel :for="`${formId}-code`">
              {{ $t('auth.mfa.code.label') }}
            </FormLabel>
          </template>

          <TextField
            :id="`${formId}-code`"
            name="code"
            autocomplete="one-time-code"
            inputmode="numeric"
            :maxlength="6"
            :placeholder="$t('auth.mfa.code.placeholder')"
            :disabled="loading"
            autofocus
          />

          <template #footer>
            <BlockText size="sm">
              <BlockText size="sm"> {{ $t('auth.mfa.code.footer') }} </BlockText>
            </BlockText>
          </template>

          <template v-if="errors.code" #error>{{ errors.code }}</template>
        </FormField>
      </template>

      <template v-if="submitError" #errors>
        <span role="alert">{{ submitError }}</span>
      </template>

      <template #actions>
        <BaseButton type="button" tone="neutral" variant="soft" @click="onCancel">
          {{ $t('common.cancel') }}
        </BaseButton>

        <BaseButton type="submit" :loading="loading" :disabled="loading">
          {{ $t('auth.mfa.actions.verify') }}
        </BaseButton>
      </template>
    </FormLayout>
  </Form>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue'
import { Form } from 'vee-validate'
import type { EmailOtpChallenge, EmailOtpModalProps } from '@/library/models/email-otp'
import { validationSchema, type FormValues } from '@/library/types/forms/mfa-verification'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import TextField from '@/shared/components/inputs/TextField.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import FormLabel from '@/shared/components/text/FormLabel.vue'
import FormField from '@/shared/layouts/FormField.vue'
import FormLayout from '@/shared/layouts/FormLayout.vue'
import { useErrorMessage } from '@/shared/hooks/useErrorMessage'
import { useFormUtil } from '@/shared/hooks/useForm'

const props = defineProps<EmailOtpModalProps>()
const currentChallenge = ref<EmailOtpChallenge>({ ...props.challenge })
const submitError = ref<string | null>(null)
const loading = ref(false)

const formKey = ref(0)
const formId = useId()
const { getErrorMessage } = useErrorMessage()
const { getSubmitFn } = useFormUtil()

const onSubmit = getSubmitFn(validationSchema, async (values: FormValues) => {
  loading.value = true
  submitError.value = null

  await props
    .verify({
      challenge_id: currentChallenge.value.challenge_id,
      code: values.code,
    })
    .then((result) => {
      props.onSuccess(result)
    })
    .catch((error) => {
      submitError.value = getErrorMessage(error)
    })
    .finally(() => {
      loading.value = false
    })
})
</script>
