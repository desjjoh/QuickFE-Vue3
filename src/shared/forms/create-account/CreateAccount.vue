<template>
  <Form @submit="onSubmit" :validation-schema="validationSchema" v-slot="{ errors }">
    <FormLayout>
      <template #header>
        <BlockText element="h3">
          {{ $t('auth.createAccount.title') }}
        </BlockText>
      </template>

      <template #content>
        <GridBox :gap="4" :columns="2" :gap-y="2">
          <GridCell :span="2">
            <FormLabel :for="`${formId}-first-name`">
              {{ $t('auth.createAccount.name.label') }}
            </FormLabel>
          </GridCell>

          <!-- FIRST NAME -->
          <GridCell>
            <FormField>
              <TextField
                :id="`${formId}-first-name`"
                name="firstName"
                autocomplete="given-name"
                :placeholder="$t('auth.createAccount.name.first.placeholder')"
                :disabled="loading"
              />

              <template #footer>
                <FormLabel :for="`${formId}-first-name`" size="sm">
                  {{ $t('auth.createAccount.name.first.label') }}
                </FormLabel>
              </template>

              <template #error v-if="errors.firstName">
                {{ $t(errors.firstName) }}
              </template>
            </FormField>
          </GridCell>

          <!-- LAST NAME -->
          <GridCell>
            <FormField>
              <TextField
                :id="`${formId}-last-name`"
                name="lastName"
                autocomplete="family-name"
                :placeholder="$t('auth.createAccount.name.last.placeholder')"
                :disabled="loading"
              />

              <template #footer>
                <FormLabel :for="`${formId}-last-name`" size="sm">
                  {{ $t('auth.createAccount.name.last.label') }}
                </FormLabel>
              </template>

              <template #error v-if="errors.lastName">
                {{ $t(errors.lastName) }}
              </template>
            </FormField>
          </GridCell>
        </GridBox>

        <!-- EMAIL -->
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

        <!-- PASSWORD -->
        <FormField>
          <template #header>
            <FormLabel :for="`${formId}-password`">
              {{ $t('auth.signIn.password.label') }}
            </FormLabel>
          </template>

          <TextField
            :id="`${formId}-password`"
            name="password"
            type="password"
            autocomplete="current-password"
            :placeholder="$t('auth.createAccount.password.placeholder')"
            :disabled="loading"
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

        <!-- TERMS + PRIVACY -->
        <BlockText>
          <i18n-t keypath="auth.createAccount.legal.base" tag="span" scope="global">
            <InlineText element="q">
              {{ $t('auth.createAccount.actions.createAccount') }}
            </InlineText>
            <BaseLink href="#">
              {{ $t('auth.createAccount.legal.terms') }}
            </BaseLink>
            <BaseLink href="#">
              {{ $t('auth.createAccount.legal.privacy') }}
            </BaseLink>
          </i18n-t>
        </BlockText>
      </template>

      <template #actions>
        <BaseButton type="submit" :loading="loading">
          {{ $t('auth.createAccount.actions.createAccount') }}
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
import InlineText from '@/shared/components/text/InlineText.vue'
import FormLabel from '@/shared/components/text/FormLabel.vue'

import FormLayout from '@/shared/layouts/FormLayout.vue'
import FormField from '@/shared/layouts/FormField.vue'

import FlexBox from '@/shared/components/flex/FlexBox.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'
import GridCell from '@/shared/components/grid/GridCell.vue'

import { validationSchema, type FormValues, type proptype } from './types'

const { callbackSubmit } = defineProps<proptype>()
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
