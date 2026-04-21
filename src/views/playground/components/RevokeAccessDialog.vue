<template>
  <ConfirmAction
    tone="warning"
    :title="$t('confirmation.revokeAccess.title')"
    :submit="$t('confirmation.revokeAccess.actions.confirm')"
    :cancel="$t('confirmation.revokeAccess.actions.cancel')"
    :callback-submit="callbackSubmit"
    :callback-cancel="callbackCancel"
  >
    <template #content>
      <BlockText>
        {{ $t('confirmation.revokeAccess.description') }}
      </BlockText>
    </template>
  </ConfirmAction>
</template>

<script setup lang="ts">
import BlockText from '@/shared/components/text/BlockText.vue'
import ConfirmAction from '@/shared/forms/ConfirmAction.vue'

type proptype = {
  callbackSubmit: () => Promise<void>
  callbackCancel: () => void
}

const { callbackSubmit, callbackCancel } = defineProps<proptype>()
</script>
