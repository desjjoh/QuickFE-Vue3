<template>
  <FlexBox direction="column" :gap="6">
    <slot name="header"></slot>

    <Transition name="form-error">
      <FlexBox v-if="$slots.errors" direction="column" shrink>
        <CalloutComponent variant="danger">
          <slot name="errors"></slot>
        </CalloutComponent>
      </FlexBox>
    </Transition>

    <FlexBox direction="column" :gap="4" grow>
      <slot name="content"></slot>
    </FlexBox>

    <FlexBox justify-content="flex-end" :gap="3" shrink>
      <slot name="actions"></slot>
    </FlexBox>
  </FlexBox>
</template>

<script setup lang="ts">
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import CalloutComponent from '../components/text/CalloutComponent.vue'
</script>
