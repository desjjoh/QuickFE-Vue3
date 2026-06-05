<template>
  <BaseButton @click="signIn">
    {{ $t('auth.signIn.actions.submit') }}
  </BaseButton>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'

import { useAppActions } from '../../hooks/useAppActions'

const { t } = useI18n()
const { signIn } = useAppActions(t)
</script>
