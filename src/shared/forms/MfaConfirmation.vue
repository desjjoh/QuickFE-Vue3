<template>
  <Form :validation-schema="validationSchema" @submit="onSubmit" v-slot="{ errors }">
    <FormLayout :title="$t(`auth.mfa.${context}.title`)">
      <template #content>
        <BlockText>
          {{ $t(`auth.mfa.${context}.description`) }}
        </BlockText>

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
            <BlockText size="sm"> {{ $t('auth.mfa.code.footer') }} </BlockText>
          </template>

          <template v-if="errors.code" #error>
            {{ $t(errors.code) }}
          </template>
        </FormField>
      </template>

      <template v-if="submitError" #errors>
        {{ submitError }}
      </template>

      <template #actions>
        <BaseButton type="button" tone="neutral" variant="soft" @click="callbackCancel">
          {{ $t('common.cancel') }}
        </BaseButton>

        <BaseButton type="submit" :loading="loading">
          {{ $t('auth.mfa.actions.verify') }}
        </BaseButton>
      </template>
    </FormLayout>
  </Form>
</template>

<script setup lang="ts">
import { nextTick, ref, useId } from 'vue'
import { Form } from 'vee-validate'
import { useI18n } from 'vue-i18n'

import FormLayout from '@/shared/layouts/FormLayout.vue'
import FormField from '@/shared/layouts/FormField.vue'
import FormLabel from '@/shared/components/text/FormLabel.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import TextField from '@/shared/components/inputs/TextField.vue'
import { useFormUtil } from '@/shared/hooks/useForm'
import {
  validationSchema,
  type FormValues,
  type MfaVerificationProps,
} from '@/library/types/forms/mfa-verification'

const { context, callbackSubmit, callbackCancel } = defineProps<MfaVerificationProps>()

const { t } = useI18n()
const { getSubmitFn } = useFormUtil()

const formId = useId()

const loading = ref<boolean>(false)
const submitError = ref<string | null>(null)

const onSubmit = getSubmitFn(validationSchema, async (values: FormValues) => {
  loading.value = true
  submitError.value = null

  try {
    await callbackSubmit(values.code)
  } catch (error: unknown) {
    submitError.value = error instanceof Error ? error.message : t('auth.mfa.error')

    await nextTick()

    const input = document.getElementById(`${formId}-code`) as HTMLInputElement | null

    if (input) {
      input.value = ''
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.focus()
    }
  } finally {
    loading.value = false
  }
})
</script>
