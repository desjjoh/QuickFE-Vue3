<template>
  <Form @submit="onSubmit" :validation-schema="validationSchema" v-slot="{ errors }">
    <FormLayout>
      <template #header>
        <BlockText element="h3">{{ $t('auth.passwordVerification.title') }}</BlockText>
      </template>

      <template #content>
        <BlockText>
          {{ $t('auth.passwordVerification.description') }}
        </BlockText>

        <!-- PASSWORD -->
        <FormField>
          <TextField
            :id="`${formId}-password`"
            name="password"
            type="password"
            autocomplete="off"
            :placeholder="$t('auth.passwordVerification.placeholder')"
            :disabled="loading"
            data-autofocus
          />

          <template #footer>
            <BlockText size="sm"> {{ $t('auth.passwordVerification.helper') }} </BlockText>
          </template>

          <template #error v-if="errors.password">
            {{ $t(errors.password) }}
          </template>
        </FormField>
      </template>

      <template #actions>
        <BaseButton tone="neutral" variant="soft" @callback="callbackCancel">
          {{ $t('auth.passwordVerification.actions.cancel') }}
        </BaseButton>

        <BaseButton type="submit" :loading="loading">
          {{ $t('auth.passwordVerification.actions.confirm') }}
        </BaseButton>
      </template>
    </FormLayout>
  </Form>
</template>

<script setup lang="ts">
import { Form } from 'vee-validate'
import { ref, useId } from 'vue'

import { useFormUtil } from '@/helpers/forms'

import BlockText from '@/shared/components/text/BlockText.vue'
import TextField from '@/shared/components/inputs/TextField.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'

import FormLayout from '@/shared/layouts/FormLayout.vue'
import FormField from '@/shared/layouts/FormField.vue'

import { validationSchema, type FormValues, type proptype } from './types'

const { callbackSubmit, callbackCancel } = defineProps<proptype>()
const { getSubmitFn } = useFormUtil()

const loading = ref<boolean>(false)
const formId = useId()

const onSubmit = getSubmitFn(validationSchema, async (values: FormValues) => {
  loading.value = true
  callbackSubmit(values).finally(() => {
    loading.value = false
  })
})
</script>
