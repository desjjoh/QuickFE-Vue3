<script setup lang="ts">
import BlockText from '@/shared/components/text/BlockText.vue'
</script>

<template>
  <div class="item">
    <i>
      <slot name="icon"></slot>
    </i>
    <div class="details">
      <BlockText element="h4">
        <slot name="heading"></slot>
      </BlockText>

      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.item {
  display: flex;
  position: relative;
}

.details {
  flex: 1;
  margin-left: space(2);
}

i {
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

@media (min-width: 1024px) {
  .item {
    margin-top: 0;
    padding: space(1) 0 space(4) space(20);
  }

  i {
    top: calc(50% - space(6));
    left: calc(-1 * space(6));
    position: absolute;
    border: 1px solid color(border, subtle);
    border-radius: border-radius(lg);
    width: space(12);
    height: space(12);
  }

  .item:before {
    content: ' ';
    border-left: 1px solid color(border, subtle);
    position: absolute;
    left: 0;
    bottom: calc(50% + space(6));
    height: calc(50% - space(6));
  }

  .item:after {
    content: ' ';
    border-left: 1px solid color(border, subtle);
    position: absolute;
    left: 0;
    top: calc(50% + space(6));
    height: calc(50% - space(6));
  }

  .item:first-of-type:before {
    display: none;
  }

  .item:last-of-type:after {
    display: none;
  }
}
</style>
