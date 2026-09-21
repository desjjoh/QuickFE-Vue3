<template>
  <BaseCard size="lg">
    <CardBody>
      <FlexBox direction="column" :gap="3" grow>
        <div class="card-list-item__main">
          <FlexBox direction="column">
            <BlockText element="h5">{{ props.title }}</BlockText>
            <BlockText truncate size="sm">{{ props.subtitle }}</BlockText>
          </FlexBox>
        </div>

        <CompactDataList class="compact__datalist">
          <DataListItem
            v-for="item in data_list"
            :key="item.key"
            small
            :label="item.label"
            :value="item.value"
            :empty-label="item.emptyLabel"
          />
        </CompactDataList>
      </FlexBox>
    </CardBody>
  </BaseCard>
</template>

<script setup lang="ts">
import DataListItem from '@/library/components/datalist/DataListItem.vue'
import BaseCard from '@/library/components/card/BaseCard.vue'
import CardBody from '@/library/components/card/CardBody.vue'
import FlexBox from '@/library/components/flex/FlexBox.vue'
import BlockText from '@/library/components/text/BlockText.vue'

import CompactDataList from '@/library/components/datalist/CompactDataList.vue'

type ListItem = {
  key: string
  label: string
  value?: string | null
  emptyLabel?: string
}

const props = defineProps<{ title: string; subtitle: string; data_list: ListItem[] }>()
</script>

<style scoped lang="scss">
.compact__datalist {
  padding-inline-start: space(3);
  border-left: 0.2rem solid color(theme, primary, theme-alpha, 10);
}

.card-list-item__main {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: flex-start;
  gap: space(4);

  min-width: 0;
  max-width: 100%;
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
</style>
