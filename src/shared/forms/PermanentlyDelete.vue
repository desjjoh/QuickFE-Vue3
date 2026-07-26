<template>
  <Form @submit="onSubmit" :validation-schema="validationSchema" v-slot="{ errors }">
    <FormLayout :title="$t('confirmation.permanentlyDelete.title')">
      <template #content>
        <BlockText>
          <i18n-t keypath="confirmation.permanentlyDelete.description" tag="span" scope="global">
            <InlineText element="q">{{ $string }}</InlineText>
          </i18n-t>
        </BlockText>

        <!-- PERMANENTLY DELETE -->
        <FormField>
          <TextField
            :id="`${formId}-permanently-delete`"
            name="permanently-delete"
            autocomplete="off"
            :placeholder="$string"
            :disabled="loading"
            autofocus
          />

          <template #footer>
            <BlockText size="sm"> {{ $t('confirmation.permanentlyDelete.helper') }} </BlockText>
          </template>

          <template #error v-if="errors['permanently-delete']">
            <i18n-t :keypath="errors['permanently-delete']" tag="span" scope="global">
              <InlineText element="q">{{ $string }}</InlineText>
            </i18n-t>
          </template>
        </FormField>
      </template>

      <template #errors v-if="!!submitError">
        {{ submitError }}
      </template>

      <template #actions>
        <BaseButton tone="neutral" variant="soft" @click="callbackCancel">
          {{ $t('confirmation.permanentlyDelete.actions.cancel') }}
        </BaseButton>

        <BaseButton type="submit" tone="danger" :loading="loading">
          {{ $t('confirmation.permanentlyDelete.actions.confirm') }}
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

import FormLayout from '@/shared/layouts/FormLayout.vue'
import FormField from '@/shared/layouts/FormField.vue'

import InlineText from '@/shared/components/text/InlineText.vue'

import * as Yup from 'yup'
import type { AxiosError } from 'axios'
import { useErrorMessage } from '../hooks/useErrorMessage'

const $string: string = 'permanently delete'

type proptype = { callbackSubmit: () => Promise<void>; callbackCancel?: () => void }

const validationSchema = Yup.object().shape({
  'permanently-delete': Yup.string()
    .required('validation.required')
    .oneOf([$string], 'validation.delete'),
})

const { callbackSubmit, callbackCancel } = defineProps<proptype>()
const { getSubmitFn } = useFormUtil()
const { getErrorMessage } = useErrorMessage()

const submitError = ref<string | null>(null)
const loading = ref<boolean>(false)
const formId = useId()

const onSubmit = getSubmitFn(validationSchema, async () => {
  loading.value = true
  submitError.value = null

  return callbackSubmit()
    .catch((error: AxiosError) => {
      submitError.value = getErrorMessage(error)
    })
    .finally(() => {
      loading.value = false
    })
})
</script>
