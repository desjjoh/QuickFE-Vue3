<template>
  <Form @submit="onSubmit" :validation-schema="validationSchema">
    <FormLayout>
      <template #header>
        <BlockText element="h3">
          {{ $t('auth.confirmation.title') }}
        </BlockText>
      </template>

      <template #content>
        <BlockText>
          {{ $t('auth.confirmation.description') }}
        </BlockText>
      </template>

      <template #actions>
        <BaseButton tone="neutral" variant="soft">
          {{ $t('auth.confirmation.actions.cancel') }}
        </BaseButton>

        <BaseButton type="submit" :loading="loading">
          {{ $t('auth.confirmation.actions.confirm') }}
        </BaseButton>
      </template>
    </FormLayout>
  </Form>
</template>

<script setup lang="ts">
import { Form } from 'vee-validate'
import { ref } from 'vue'

import { useFormUtil } from '@/helpers/forms'

import BlockText from '@/shared/components/text/BlockText.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import FormLayout from '@/shared/layouts/FormLayout.vue'

import { validationSchema, type proptype } from './types'

const { callback } = defineProps<proptype>()
const { getSubmitFn } = useFormUtil()

const loading = ref<boolean>(false)
const onSubmit = getSubmitFn(validationSchema, async () => {
  loading.value = true
  callback().finally(() => {
    loading.value = false
  })
})
</script>
