<template>
  <FormLayout :title="$t('playground.copy.offcanvasTitle')">
    <template #content>
      <BlockText>{{ $t('playground.copy.offcanvasDescription') }}</BlockText>
      <BlockText>{{ $t('playground.copy.offcanvasHelper') }}</BlockText>

      <TextField name="example" :placeholder="$t('playground.copy.typeHere')" data-autofocus />
    </template>

    <template #actions>
      <BaseButton variant="soft" tone="neutral">{{ $t('playground.action.cancel') }}</BaseButton>
      <BaseButton>{{ $t('playground.action.save') }}</BaseButton>
    </template>
  </FormLayout>
</template>

<script setup lang="ts">
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import TextField from '@/shared/components/inputs/TextField.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import FormLayout from '@/shared/layouts/FormLayout.vue'
</script>
