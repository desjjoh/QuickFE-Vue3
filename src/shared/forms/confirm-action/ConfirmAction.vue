<template>
  <Form @submit="onSubmit" :validation-schema="validationSchema">
    <FormLayout>
      <template #header>
        <BlockText element="h3">
          <template v-if="props.title"> {{ props.title }} </template>
          <template v-else> {{ $t('auth.confirmation.title') }} </template>
        </BlockText>
      </template>

      <template #content>
        <template v-if="$slots.content">
          <slot name="content"></slot>
        </template>

        <BlockText v-else>
          {{ $t('auth.confirmation.description') }}
        </BlockText>
      </template>

      <template #actions>
        <BaseButton tone="neutral" variant="soft" @click="callbackCancel">
          {{ $t('auth.confirmation.actions.cancel') }}
        </BaseButton>

        <BaseButton type="submit" :tone="tone" :loading="loading">
          {{ $t('auth.confirmation.actions.confirm') }}
        </BaseButton>
      </template>
    </FormLayout>
  </Form>
</template>

<script setup lang="ts">
import { Form } from 'vee-validate'
import { ref } from 'vue'
import * as Yup from 'yup'

import { useFormUtil } from '@/helpers/forms'

import BlockText from '@/shared/components/text/BlockText.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import FormLayout from '@/shared/layouts/FormLayout.vue'

import type { Tone } from '@/shared/components/buttons/types'

type proptype = {
  title?: string

  tone?: Tone

  callbackSubmit: () => Promise<void>
  callbackCancel?: () => void
}

const { getSubmitFn } = useFormUtil()

const props = withDefaults(defineProps<proptype>(), { tone: 'primary' })
const loading = ref<boolean>(false)

const validationSchema = Yup.object()
const onSubmit = getSubmitFn(validationSchema, async () => {
  loading.value = true
  props.callbackSubmit().finally(() => {
    loading.value = false
  })
})
</script>
