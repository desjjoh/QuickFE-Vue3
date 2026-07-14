<template>
  <li class="card-list-item">
    <slot></slot>
  </li>
</template>

<style scoped lang="scss">
.card-list-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: center;
  gap: space(4);

  width: 100%;
  min-width: 0;
  padding: var(--card-padding);

  &:not(:first-child) {
    border-top: 0.1rem solid color(border, subtle);
  }
}

.card-list-item.has-value,
.card-list-item.has-end {
  grid-template-columns: minmax(0, 5fr) minmax(0, 4fr);
}

.card-list-item__main {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: space(4);

  min-width: 0;
}

.card-list-item:not(.has-start) .card-list-item__main {
  grid-template-columns: minmax(0, 1fr);
}

.card-list-item__meta {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: center;
  gap: space(4);

  min-width: 0;
}

.card-list-item.has-end .card-list-item__meta {
  grid-template-columns: minmax(0, 1fr) max-content;
}

.card-list-item__start {
  display: flex;
  align-items: center;
  justify-content: center;

  min-width: 0;
}

.card-list-item__content {
  display: grid;
  gap: space(1);

  min-width: 0;
}

.card-list-item__value {
  grid-column: 1;

  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: space(3);

  width: 100%;
  min-width: 0;
  max-width: 100%;

  overflow-wrap: anywhere;
}

.card-list-item__value :deep(*) {
  min-width: 0;
}

.card-list-item__end {
  grid-column: 2;

  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: space(3);

  width: max-content;
  min-width: 0;
  max-width: 100%;
}

.card-list-item:not(.has-value) .card-list-item__end {
  grid-column: 2;
}

.card-list-item.has-end:not(.has-value) .card-list-item__meta {
  grid-template-columns: minmax(0, 1fr) max-content;
}

.card-list-item__end :deep(button),
.card-list-item__end :deep(a) {
  white-space: nowrap;
}

/* Tablet layout:
   Row 1: start + content
   Row 2: value left, actions right
*/
.card-list-item.is-tablet.has-value,
.card-list-item.is-tablet.has-end {
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  row-gap: space(6);
}

.card-list-item.is-tablet .card-list-item__main {
  width: 100%;
}

.card-list-item.is-tablet .card-list-item__meta {
  width: 100%;
  min-width: 0;
}

.card-list-item.is-tablet.has-value .card-list-item__meta {
  grid-template-columns: minmax(0, 1fr);
}

.card-list-item.is-tablet.has-end .card-list-item__meta {
  grid-template-columns: minmax(0, 1fr) max-content;
  column-gap: space(4);
}

.card-list-item.is-tablet .card-list-item__value {
  grid-column: 1;
  grid-row: 1;

  align-self: center;
  justify-content: flex-start;
}

.card-list-item.is-tablet .card-list-item__end {
  grid-column: 2;
  grid-row: 1;

  align-self: center;
  justify-content: flex-end;
}

.card-list-item.is-tablet.has-value:not(.has-end) .card-list-item__value {
  grid-column: 1 / -1;
}

.card-list-item.is-tablet.has-end:not(.has-value) .card-list-item__end {
  grid-column: 2;
}

/* Mobile layout:
   Row 1: start + content
   Row 2: value
   Row 3: stacked actions
*/
.card-list-item.is-mobile,
.card-list-item.is-mobile.has-value,
.card-list-item.is-mobile.has-end {
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  column-gap: space(4);
  row-gap: space(6);
}

.card-list-item.is-mobile .card-list-item__main,
.card-list-item.is-mobile .card-list-item__meta {
  display: contents;
}

.card-list-item.is-mobile .card-list-item__start {
  grid-column: 1;
  grid-row: 1;

  align-self: center;
}

.card-list-item.is-mobile .card-list-item__content {
  grid-column: 2;
  grid-row: 1;
  align-self: center;
}

.card-list-item.is-mobile .card-list-item__value {
  grid-column: 1 / -1;
  grid-row: 2;

  width: 100%;
  justify-content: flex-start;
}

.card-list-item.is-mobile .card-list-item__end {
  grid-column: 1 / -1;
  grid-row: 3;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  gap: space(3);

  width: 100%;
}

.card-list-item.is-mobile:not(.has-value) .card-list-item__end {
  grid-row: 2;
}

.card-list-item.is-mobile:not(.has-start) .card-list-item__content {
  grid-column: 1 / -1;
}

.card-list-item.is-mobile .card-list-item__end :deep(button),
.card-list-item.is-mobile .card-list-item__end :deep(a) {
  width: 100%;
  justify-content: center;
  white-space: normal;
}
</style>
