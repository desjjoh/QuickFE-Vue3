<template>
  <dl class="compact-data-list">
    <slot></slot>
  </dl>
</template>

<style scoped lang="scss">
.compact-data-list {
  --data-list-row-padding: 0;

  display: grid;
  gap: space(2);
  margin: 0;
  padding: 0;
}

.compact-data-list :deep(.data-list-item:not(:first-child)) {
  border-top: 0;
}
</style>
