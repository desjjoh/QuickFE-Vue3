<template>
  <Form
    @submit="onSubmit"
    :validation-schema="validationSchema"
    :initial-values="initialValues"
    v-slot="{ errors }"
  >
    <FormLayout :title="$t('settings.uploadAvatar.title')">
      <template #content>
        <FormField>
          <template #header>
            <FormLabel :for="`${formId}-avatar`">
              {{ $t('settings.uploadAvatar.form.image') }}
            </FormLabel>
          </template>

          <FileInput
            :id="`${formId}-avatar`"
            name="avatar"
            accept="image/png,image/jpeg,image/jpg,image/gif"
            :disabled="loading"
            autofocus
          />

          <template #footer>
            <BlockText size="sm">
              {{ $t('settings.uploadAvatar.form.helper') }}
            </BlockText>
          </template>

          <template #error v-if="errors.avatar">
            {{ $t(errors.avatar) }}
          </template>
        </FormField>
      </template>

      <template #errors v-if="!!submitError">
        {{ submitError }}
      </template>

      <template #actions>
        <BaseButton v-if="callback" variant="soft" tone="neutral" @click="callback">
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
import { ref, useId, type Ref } from 'vue'
import { Form } from 'vee-validate'
import type { AxiosError } from 'axios'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import FileInput from '@/shared/components/inputs/FileInput.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import FormLabel from '@/shared/components/text/FormLabel.vue'
import { useErrorMessage } from '@/shared/hooks/useErrorMessage.ts'
import { useFormUtil } from '@/shared/hooks/useForm.ts'
import FormField from '@/shared/layouts/FormField.vue'
import FormLayout from '@/shared/layouts/FormLayout.vue'
import {
  initialValues,
  validationSchema,
  type FormValues,
  type proptype,
} from '@/library/types/forms/upload-avatar.ts'

const { callbackSubmit, callback } = defineProps<proptype>()

const { getSubmitFn } = useFormUtil()
const { getErrorMessage } = useErrorMessage()

const formId: string = useId()
const loading: Ref<boolean, boolean> = ref<boolean>(false)
const submitError: Ref<string | null, string | null> = ref<string | null>(null)

const onSubmit = getSubmitFn(validationSchema, async (values: FormValues) => {
  if (!values.avatar) return

  loading.value = true
  submitError.value = null

  return callbackSubmit(values.avatar)
    .catch((error: AxiosError) => {
      submitError.value = getErrorMessage(error)
    })
    .finally(() => {
      loading.value = false
    })
})
</script>
