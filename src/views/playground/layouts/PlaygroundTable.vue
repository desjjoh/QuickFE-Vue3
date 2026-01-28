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

  /* slotted header + body cells */
  :slotted(th),
  :slotted(td) {
    padding: space(2);
  }

  /* first column */
  :slotted(th:first-child),
  :slotted(td:first-child) {
    width: space(25);
    max-width: space(25);
    min-width: space(25);

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* header alignment */
  :slotted(th) {
    text-align: center;
    font-weight: font-weight(normal);
  }

  /* utility cell wrapper */
  :slotted(.cell) {
    display: flex;
    justify-content: flex-start;
  }
}
</style>
