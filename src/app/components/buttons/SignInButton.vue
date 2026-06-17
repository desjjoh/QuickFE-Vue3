<template>
  <BaseButton @click="handleClick">
    {{ $t('auth.signIn.actions.submit') }}
  </BaseButton>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'

import { useAppActions } from '@/app/hooks/useAppActions'

type MaybePromise<T> = T | Promise<T>
const props = defineProps<{ onSignIn?: () => MaybePromise<void> }>()

const { t } = useI18n()
const { signIn } = useAppActions(t)

async function handleClick(): Promise<void> {
  const signInHandler = props.onSignIn ?? signIn

  await Promise.resolve(signInHandler())
}
</script>
