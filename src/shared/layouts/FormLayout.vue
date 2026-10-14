<template>
  <FlexBox class="form__layout" direction="column" :gap="6">
    <BlockText :id="titleId" element="h3" class="form__layout-header" truncate>
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

    <FlexBox
      v-if="$slots.actions"
      class="form__layout-actions"
      :class="{ 'is-block': blockActions }"
      :direction="blockActions ? 'column' : 'row'"
      justify-content="flex-end"
      :gap="3"
    >
      <slot name="actions"></slot>
    </FlexBox>
  </FlexBox>
</template>

<script setup lang="ts">
import { CircleAlert } from '@lucide/vue'
import { inject } from 'vue'
import { DialogTitleId } from '@/library/components/dialog'

const titleId = inject(DialogTitleId, undefined)

import FlexBox from '@/library/components/flex/FlexBox.vue'

import CalloutComponent from '@/library/components/text/CalloutComponent.vue'
import BlockText from '@/library/components/text/BlockText.vue'

withDefaults(defineProps<{ title: string; blockActions?: boolean }>(), {
  blockActions: false,
})
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

.form__layout-actions.is-block > :deep(*) {
  width: 100%;
}

.alert__icon {
  flex: none;
  width: 1.4em;
  height: 1.4em;
}
</style>
