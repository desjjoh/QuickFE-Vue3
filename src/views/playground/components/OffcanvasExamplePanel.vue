<template>
  <FormLayout>
    <template #header>
      <BlockText element="h3">Offcanvas test panel</BlockText>
    </template>

    <template #content>
      <BlockText>This is a simple offcanvas test panel.</BlockText>
      <BlockText>It helps verify dynamic rendering, focus trap, and close behavior.</BlockText>

      <TextField name="example" placeholder="Type here" data-autofocus />
    </template>

    <template #actions>
      <BaseButton variant="soft" tone="neutral">Cancel</BaseButton>
      <BaseButton>Save</BaseButton>
    </template>
  </FormLayout>
</template>

<script setup lang="ts">
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import TextField from '@/shared/components/inputs/TextField.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import FormLayout from '@/shared/layouts/FormLayout.vue'
</script>
