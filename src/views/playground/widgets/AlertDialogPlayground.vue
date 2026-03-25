<template>
  <FlexBox :gap="3">
    <BaseButton tone="primary" @click="openConfirmDialog">Submit</BaseButton>
    <BaseButton tone="warning" @click="openRevokeAccessDialog">Revoke</BaseButton>
  </FlexBox>
</template>

<script setup lang="ts">
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import ConfirmAction from '@/shared/forms/confirm-action/ConfirmAction.vue'
import RevokeAccessDialog from '@/shared/widgets/modals/RevokeAccessDialog.vue'
import { useModalStore } from '@/stores/modal'

const { openModal, closeModal } = useModalStore()

function openConfirmDialog() {
  openModal({
    view: ConfirmAction,
    size: 'sm',
    props: {
      callbackCancel: closeModal,
      callbackSubmit: async () => {
        closeModal()
      },
    },
  })
}

function openRevokeAccessDialog() {
  openModal({
    view: RevokeAccessDialog,
    size: 'sm',
    props: {
      callbackCancel: closeModal,
      callbackSubmit: async () => {
        closeModal()
      },
    },
  })
}
</script>
