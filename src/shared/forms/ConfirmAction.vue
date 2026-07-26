<template>
  <Form @submit="onSubmit" :validation-schema="validationSchema">
    <FormLayout :title="props.title ?? $t('confirmation.default.title')">
      <template #content>
        <template v-if="$slots.content">
          <slot name="content"></slot>
        </template>

        <BlockText v-else>
          {{ $t('confirmation.default.description') }}
        </BlockText>
      </template>

      <template #errors v-if="!!submitError">
        {{ submitError }}
      </template>

      <template #actions>
        <BaseButton tone="neutral" variant="soft" @click="props.callbackCancel">
          <template v-if="props.cancel"> {{ props.cancel }} </template>
          <template v-else> {{ $t('confirmation.default.actions.cancel') }}</template>
        </BaseButton>

        <BaseButton type="submit" :tone="tone" :loading="loading">
          <template v-if="props.submit"> {{ props.submit }} </template>
          <template v-else> {{ $t('confirmation.default.actions.confirm') }}</template>
        </BaseButton>
      </template>
    </FormLayout>
  </Form>
</template>

<script setup lang="ts">
import { Form } from 'vee-validate'
import { ref } from 'vue'
import * as Yup from 'yup'

import { useFormUtil } from '@/shared/hooks/useForm'

import BlockText from '@/shared/components/text/BlockText.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import FormLayout from '@/shared/layouts/FormLayout.vue'
import type { proptype } from '@/library/types/forms/confirm-action'
import type { AxiosError } from 'axios'
import { useErrorMessage } from '../hooks/useErrorMessage'

const { getSubmitFn } = useFormUtil()

const submitError = ref<string | null>(null)

const props = withDefaults(defineProps<proptype>(), { tone: 'primary' })
const loading = ref<boolean>(false)

const { getErrorMessage } = useErrorMessage()

const validationSchema = Yup.object()
const onSubmit = getSubmitFn(validationSchema, async () => {
  loading.value = true
  submitError.value = null

  return props
    .callbackSubmit()
    .catch((error: AxiosError) => {
      submitError.value = getErrorMessage(error)
    })
    .finally(() => {
      loading.value = false
    })
})
</script>
