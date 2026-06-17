<template>
  <BaseButton variant="soft" @click="handleClick">
    {{ $t('auth.createAccount.actions.createAccount') }}
  </BaseButton>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'

import { useAppActions } from '@/app/hooks/useAppActions'

type MaybePromise<T> = T | Promise<T>

const props = defineProps<{ onCreateAccount?: () => MaybePromise<void> }>()

const { t } = useI18n()
const { register } = useAppActions(t)

async function handleClick(): Promise<void> {
  const registerHandler = props.onCreateAccount ?? register

  await Promise.resolve(registerHandler())
}
</script>
