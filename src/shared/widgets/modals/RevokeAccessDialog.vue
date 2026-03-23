<template>
  <ConfirmAction
    tone="warning"
    title="Revoke access"
    submit="Revoke"
    :callback-submit="callbackSubmit"
    :callback-cancel="closeModal"
  >
    <template #content>
      <BlockText>
        Are you sure? This application will no longer be accessible and any existing sessions will
        be expired.
      </BlockText>
    </template>
  </ConfirmAction>
</template>

<script setup lang="ts">
import BlockText from '@/shared/components/text/BlockText.vue'
import ConfirmAction from '@/shared/forms/confirm-action/ConfirmAction.vue'
import { useModalStore } from '@/stores/modal'

type proptype = {
  callbackSubmit: () => Promise<void>
}

const { closeModal } = useModalStore()
const { callbackSubmit } = defineProps<proptype>()
</script>
