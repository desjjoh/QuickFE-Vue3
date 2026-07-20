<template>
  <div
    class="item"
    :class="{
      'is-desktop': isDesktop,
    }"
  >
    <i class="item__icon">
      <slot name="icon"></slot>
    </i>

    <div class="item__details">
      <BlockText element="h4">
        <slot name="heading"></slot>
      </BlockText>

      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useViewport } from '@/shared/hooks/useViewport'

import BlockText from '@/shared/components/text/BlockText.vue'

const { isDesktop } = useViewport()
</script>

<style scoped lang="scss">
.item {
  position: relative;

  display: flex;

  padding-bottom: space(4);
}

.item__details {
  flex: 1;
  min-width: 0;
  margin-left: space(2);
}

.item__icon {
  display: flex;
  place-items: center;
  place-content: center;

  width: space(8);
  height: space(8);

  color: color(text, primary);
}

h4 {
  margin-bottom: space(1);
  color: color(text, primary);
}

.item.is-desktop {
  margin-top: 0;
  padding: space(1) 0 space(4) space(20);

  .item__icon {
    position: absolute;
    top: calc(50% - space(6));
    left: calc(-1 * space(6));

    width: space(12);
    height: space(12);

    border: 1px solid color(border, subtle);
    border-radius: border-radius(lg);
  }

  &::before {
    content: ' ';
    position: absolute;
    left: 0;
    bottom: calc(50% + space(6));

    height: calc(50% - space(6));

    border-left: 1px solid color(border, subtle);
  }

  &::after {
    content: ' ';
    position: absolute;
    left: 0;
    top: calc(50% + space(6));

    height: calc(50% - space(6));

    border-left: 1px solid color(border, subtle);
  }

  &:first-of-type::before {
    display: none;
  }

  &:last-of-type::after {
    display: none;
  }
}
</style>
