<template>
  <Form @submit="onSubmit" :validation-schema="validationSchema" v-slot="{ errors }">
    <input
      v-show="false"
      type="text"
      name="username"
      autocomplete="username"
      readonly
      aria-hidden="true"
    />

    <FormLayout>
      <template #header>
        <BlockText element="h3">{{ $t('auth.resetPassword.title') }}</BlockText>
      </template>

      <template #content>
        <FormField>
          <template #header>
            <FormLabel :for="`${formId}-password`">
              {{ $t('auth.resetPassword.password.label') }}
            </FormLabel>
          </template>

          <PasswordInput
            :id="`${formId}-password`"
            name="password"
            type="password"
            autocomplete="new-password"
            :placeholder="$t('auth.resetPassword.password.placeholder')"
            :disabled="loading"
            data-autofocus
          />

          <template #footer>
            <FlexBox direction="column">
              <BlockText size="sm">
                {{ $t('auth.createAccount.password.validation.label') }}
              </BlockText>

              <ul style="list-style-type: circle">
                <li v-for="idx in 4" :key="idx">
                  <BlockText size="sm">
                    {{ $t(`auth.createAccount.password.validation.contains.${idx}`) }}
                  </BlockText>
                </li>
              </ul>
            </FlexBox>
          </template>

          <template #error v-if="errors.password">
            {{ $t(errors.password) }}
          </template>
        </FormField>

        <FormField>
          <template #header>
            <FormLabel :for="`${formId}-confirm-password`">
              {{ $t('auth.resetPassword.confirmPassword.label') }}
            </FormLabel>
          </template>

          <PasswordInput
            :id="`${formId}-confirm-password`"
            name="confirmPassword"
            type="password"
            autocomplete="new-password"
            :placeholder="$t('auth.resetPassword.confirmPassword.placeholder')"
            :disabled="loading"
          />

          <template #footer>
            <BlockText element="p" size="sm">{{ $t('auth.resetPassword.description') }}</BlockText>
          </template>

          <template #error v-if="errors.confirmPassword">
            {{ $t(errors.confirmPassword) }}
          </template>
        </FormField>
      </template>

      <template #actions>
        <BaseButton type="submit" :loading="loading">
          {{ $t('auth.resetPassword.actions.submit') }}
        </BaseButton>
      </template>
    </FormLayout>
  </Form>
</template>

<script setup lang="ts">
import { Form } from 'vee-validate'
import { ref, useId } from 'vue'

import { useFormUtil } from '@/shared/hooks/useForm'
import { validationSchema, type FormValues } from '@/library/types/forms/reset-password'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import FormLabel from '@/shared/components/text/FormLabel.vue'
import PasswordInput from '@/shared/components/inputs/PasswordInput.vue'
import FormField from '@/shared/layouts/FormField.vue'
import FormLayout from '@/shared/layouts/FormLayout.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'

const { callbackSubmit } = defineProps<{
  callbackSubmit: (values: FormValues) => Promise<void>
}>()

const { getSubmitFn } = useFormUtil()

const formId = useId()
const loading = ref(false)

const onSubmit = getSubmitFn(validationSchema, async (values: FormValues) => {
  loading.value = true

  callbackSubmit(values).finally(() => {
    loading.value = false
  })
})
</script>
