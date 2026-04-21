<template>
  <ConfirmAction
    tone="warning"
    :title="$t('auth.signOut.title')"
    :submit="$t('auth.signOut.actions.submit')"
    :cancel="$t('auth.signOut.actions.cancel')"
    :callback-submit="callbackSubmit"
    :callback-cancel="callbackCancel"
  >
    <template #content>
      <BlockText>
        {{ $t('auth.signOut.description') }}
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
