<template>
  <table>
    <thead>
      <slot name="head"> </slot>
    </thead>
    <slot name="body"> </slot>
  </table>
</template>

<style scoped lang="scss">
table {
  border-collapse: separate;
  border-spacing: 0;

  :slotted(th),
  :slotted(td) {
    padding: space(2);
  }

  :slotted(th:first-child) {
    width: space(25);
    max-width: space(25);
    min-width: space(25);

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: font-weight(normal);

    text-align: start;
  }

  thead {
    :slotted(th) {
      text-align: center;
      font-weight: font-weight(normal);
    }
  }

  :slotted(.cell) {
    display: flex;
    justify-content: flex-start;
  }
}
</style>
