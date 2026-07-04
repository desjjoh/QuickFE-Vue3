<template>
  <Form @submit="onSubmit" :validation-schema="validationSchema" v-slot="{ errors }">
    <FormLayout>
      <template #header>
        <BlockText element="h3">{{ $t(`auth.confirmEmail.${i18nKey}.title`) }}</BlockText>
      </template>

      <template #content>
        <FormField>
          <template #header>
            <FormLabel :for="`${formId}-code`">
              {{ $t('auth.confirmEmail.code.label') }}
            </FormLabel>
          </template>

          <TextField
            :id="`${formId}-code`"
            name="code"
            type="text"
            autocomplete="one-time-code"
            :placeholder="$t('auth.confirmEmail.code.placeholder')"
            :disabled="loading"
            autofocus
          />

          <template #footer>
            <BlockText size="sm">{{ $t(`auth.confirmEmail.${i18nKey}.description`) }}</BlockText>
          </template>

          <template #error v-if="errors.code">
            {{ $t(errors.code) }}
          </template>
        </FormField>
      </template>

      <template #actions>
        <BaseButton type="submit" :loading="loading">
          {{ $t(`auth.confirmEmail.${i18nKey}.actions.submit`) }}
        </BaseButton>
      </template>
    </FormLayout>
  </Form>
</template>

<script setup lang="ts">
import { Form } from 'vee-validate'
import { ref, useId } from 'vue'

import { useFormUtil } from '@/shared/hooks/useForm'
import { validationSchema, type FormValues } from '@/library/types/forms/verify-email'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import TextField from '@/shared/components/inputs/TextField.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import FormLabel from '@/shared/components/text/FormLabel.vue'
import FormField from '@/shared/layouts/FormField.vue'
import FormLayout from '@/shared/layouts/FormLayout.vue'

export type VerifyEmailKind = 'register' | 'emailChange'

const { callbackSubmit, kind } = defineProps<{
  callbackSubmit: (values: FormValues) => Promise<void>
  kind: VerifyEmailKind
}>()

const { getSubmitFn } = useFormUtil()

const formId = useId()
const loading = ref(false)
const i18nKey = kind

const onSubmit = getSubmitFn(validationSchema, async (values: FormValues) => {
  loading.value = true

  callbackSubmit(values).finally(() => {
    loading.value = false
  })
})
</script>
