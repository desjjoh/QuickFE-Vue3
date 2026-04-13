<template>
  <FlexBox :gap="3">
    <BaseButton tone="primary" @click="openConfirmDialog">Submit</BaseButton>
    <BaseButton tone="warning" @click="openRevokeAccessDialog">Revoke</BaseButton>
  </FlexBox>
</template>

<script setup lang="ts">
import { useModalStore } from '@/stores/modal'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import ConfirmAction from '@/shared/forms/confirm-action/ConfirmAction.vue'

import RevokeAccessDialog from '../components/RevokeAccessDialog.vue'

const modalStore = useModalStore()

function openConfirmDialog() {
  modalStore.open({
    view: ConfirmAction,
    size: 'sm',
    props: {
      callbackCancel: modalStore.close,
      callbackSubmit: async () => {
        modalStore.close()
      },
    },
  })
}

function openRevokeAccessDialog() {
  modalStore.open({
    view: RevokeAccessDialog,
    size: 'sm',
    props: {
      callbackCancel: modalStore.close,
      callbackSubmit: async () => {
        modalStore.close()
      },
    },
  })
}
</script>
