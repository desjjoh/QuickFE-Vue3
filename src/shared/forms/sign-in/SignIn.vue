<template>
  <Form @submit="onSubmit" :validation-schema="validationSchema">
    <FlexBox direction="column" :gap="6">
      <BlockText element="h3">{{ $t('auth.signIn.title') }}</BlockText>
      <FlexBox direction="column" :gap="4">
        <FlexBox direction="column" :gap="2">
          <FlexBox justify-content="space-between" align-items="center">
            <label for="email">
              <BlockText element="h6" weight="medium">
                {{ $t('auth.signIn.email.label') }}
              </BlockText>
            </label>
          </FlexBox>
          <TextField name="email" autocomplete="email" :disabled="loading" />
        </FlexBox>

        <FlexBox direction="column" :gap="2">
          <FlexBox justify-content="space-between" align-items="center">
            <label for="password">
              <BlockText element="h6" weight="medium">
                {{ $t('auth.signIn.password.label') }}
              </BlockText>
            </label>

            <BaseLink href="#">
              {{ $t('auth.signIn.password.forgot') }}
            </BaseLink>
          </FlexBox>
          <TextField
            name="password"
            type="password"
            autocomplete="current-password"
            :disabled="loading"
          />
        </FlexBox>
      </FlexBox>
      <FlexBox justify-content="flex-end" :gap="3">
        <BaseButton variant="soft">
          {{ $t('auth.signIn.actions.createAccount') }}
        </BaseButton>
        <BaseButton type="submit" :loading="loading">
          {{ $t('auth.signIn.actions.submit') }}
        </BaseButton>
      </FlexBox>
    </FlexBox>
  </Form>
</template>

<script setup lang="ts">
import { Form } from 'vee-validate'
import { ref } from 'vue'

import { useFormUtil } from '@/helpers/forms'

import FlexBox from '@/shared/components/flex/FlexBox.vue'

import BlockText from '@/shared/components/text/BlockText.vue'
import TextField from '@/shared/components/inputs/TextField.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import BaseLink from '@/shared/components/links/BaseLink.vue'

import { validationSchema, type FormValues } from './types'

type proptype = { callback: (values: FormValues) => Promise<void> }

const { callback } = defineProps<proptype>()
const { getSubmitFn } = useFormUtil()

const loading = ref<boolean>(false)
const onSubmit = getSubmitFn(validationSchema, async (values: FormValues) => {
  loading.value = true
  callback(values).finally(() => {
    loading.value = false
  })
})
</script>
