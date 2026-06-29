<template>
  <FlexBox class="form__layout" direction="column" :gap="6">
    <slot name="header"></slot>

    <Transition name="form-error">
      <FlexBox v-if="$slots.errors" direction="column" shrink>
        <CalloutComponent variant="danger">
          <FlexBox align-items="center" :gap="3">
            <CircleAlert class="alert__icon" :strokeWidth="2.75" />

            <FlexBox direction="column">
              <BlockText element="h6" tone="inherit">
                <InlineText element="strong">{{ $t('errors.submitError.title') }}</InlineText>
              </BlockText>
              <BlockText element="p" size="sm">
                <slot name="errors"></slot>
              </BlockText>
            </FlexBox>
          </FlexBox>
        </CalloutComponent>
      </FlexBox>
    </Transition>

    <FlexBox direction="column" :gap="4" grow>
      <slot name="content"></slot>
    </FlexBox>

    <FlexBox v-if="$slots.actions" justify-content="flex-end" :gap="3">
      <slot name="actions"></slot>
    </FlexBox>
  </FlexBox>
</template>

<script setup lang="ts">
import { CircleAlert } from 'lucide-vue-next'

import FlexBox from '@/shared/components/flex/FlexBox.vue'

import CalloutComponent from '../components/text/CalloutComponent.vue'
import BlockText from '../components/text/BlockText.vue'
import InlineText from '../components/text/InlineText.vue'
</script>

<style lang="scss" scoped>
.form__layout {
  flex: grow;
  height: 100%;
}

.alert__icon {
  width: 1.4em;
  height: 1.4em;
}
</style>
