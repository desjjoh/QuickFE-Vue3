<template>
  <FlexBox :gap="2">
    <BaseButton variant="soft" tone="primary" @click="primaryToast">Primary</BaseButton>
    <BaseButton variant="soft" tone="success" @click="successToast">Success</BaseButton>
    <BaseButton variant="soft" tone="warning" @click="warningToast">Warning</BaseButton>
    <BaseButton variant="soft" tone="danger" @click="dangerToast">Danger</BaseButton>
    <BaseButton variant="soft" tone="info" @click="infoToast">Info</BaseButton>
  </FlexBox>
</template>

<script setup lang="ts">
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import { useToastStore, type ToastStore } from '@/stores/toasts'

const toastStore: ToastStore = useToastStore()

function primaryToast() {
  toastStore.addToast({
    message: 'A new version is ready. Refresh to apply the latest changes.',
    tone: 'primary',
  })
}

function successToast() {
  toastStore.addToast({
    message: 'Your settings were updated successfully.',
    tone: 'success',
  })
}

function warningToast() {
  toastStore.addToast({
    message: 'You have unsaved edits. Leaving now will discard them.',
    tone: 'warning',
  })
}

function dangerToast() {
  toastStore.addToast({
    message: 'We couldn’t complete your request. Please try again.',
    tone: 'danger',
  })
}

function infoToast() {
  toastStore.addToast({
    message: 'This feature is still in beta and may change.',
    tone: 'info',
  })
}
</script>
