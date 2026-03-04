<template>
  <Form @submit="onSubmit" :validation-schema="validationSchema" v-slot="{ errors }">
    <FormLayout>
      <template #header>
        <BlockText element="h3">{{ $t('auth.signIn.title') }}</BlockText>
      </template>

      <template #content>
        <FormField>
          <template #header>
            <FormLabel :for="`${formId}-email`">
              {{ $t('auth.signIn.email.label') }}
            </FormLabel>
          </template>

          <TextField
            :id="`${formId}-email`"
            name="email"
            type="email"
            autocomplete="email"
            :placeholder="$t('auth.signIn.email.placeholder')"
            :disabled="loading"
          />

          <template #error v-if="errors.email">
            {{ $t(errors.email) }}
          </template>
        </FormField>

        <FormField>
          <template #header>
            <FormLabel :for="`${formId}-password`">
              {{ $t('auth.signIn.password.label') }}
            </FormLabel>

            <BaseLink href="#">
              {{ $t('auth.signIn.password.forgot') }}
            </BaseLink>
          </template>

          <TextField
            :id="`${formId}-password`"
            name="password"
            type="password"
            autocomplete="current-password"
            :placeholder="$t('auth.signIn.password.placeholder')"
            :disabled="loading"
          />

          <template #error v-if="errors.password">
            {{ $t(errors.password) }}
          </template>
        </FormField>

        <CheckBoxGroup :id="`${formId}-remember`" :label="$t('auth.signIn.remember')">
          <CheckBox :id="`${formId}-remember`" name="remember" />
          <template #error v-if="errors.remember">
            {{ $t(errors.remember) }}
          </template>
        </CheckBoxGroup>
      </template>

      <template #actions>
        <BaseButton variant="soft" @click="callback">
          {{ $t('auth.signIn.actions.createAccount') }}
        </BaseButton>

        <BaseButton type="submit" :loading="loading">
          {{ $t('auth.signIn.actions.submit') }}
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
import BaseLink from '@/shared/components/links/BaseLink.vue'

import FormLayout from '@/shared/layouts/FormLayout.vue'
import FormField from '@/shared/layouts/FormField.vue'

import { validationSchema, type FormValues, type proptype } from './types'
import FormLabel from '@/shared/components/text/FormLabel.vue'
import CheckBox from '@/shared/components/inputs/CheckBox.vue'
import CheckBoxGroup from '@/shared/layouts/CheckBoxGroup.vue'

const { callbackSubmit, callback } = defineProps<proptype>()
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
