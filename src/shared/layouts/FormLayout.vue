<template>
  <FlexBox class="form__layout" direction="column" :gap="6">
    <BlockText element="h3" class="form__layout-header" truncate>
      {{ title }}
    </BlockText>

    <Transition name="form-error">
      <FlexBox v-if="$slots.errors" direction="column" shrink>
        <CalloutComponent variant="danger">
          <FlexBox align-items="center" :gap="3">
            <CircleAlert class="alert__icon" :strokeWidth="2.75" />

            <FlexBox direction="column">
              <BlockText element="h6" tone="inherit" weight="semibold">
                {{ $t('errors.submitError.title') }}
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

defineProps<{ title: string }>()
</script>

<style lang="scss" scoped>
.form__layout {
  flex: 1 1 auto;

  width: 100%;
  max-width: 100%;
  min-width: 0;
  height: 100%;
}

.form__layout-header {
  width: 100%;
  max-width: 100%;
  min-width: 0;

  padding-inline-end: var(--form-layout-header-end-offset, 0);
}

.alert__icon {
  flex: none;
  width: 1.4em;
  height: 1.4em;
}
</style>
