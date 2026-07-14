<template>
  <BaseCard size="lg">
    <CardBody>
      <FlexBox direction="column" :gap="3" grow>
        <FlexBox direction="column">
          <BlockText element="h5">{{ props.title }}</BlockText>
          <BlockText>{{ props.subtitle }}</BlockText>
        </FlexBox>

        <CompactDataList>
          <DataListItem
            v-for="item in data_list"
            :key="item.key"
            small
            :label="item.label"
            :value="item.value"
          />
        </CompactDataList>
      </FlexBox>
    </CardBody>
  </BaseCard>
</template>

<script setup lang="ts">
import DataListItem from '@/shared/components/datalist/DataListItem.vue'
import BaseCard from '@/shared/components/card/BaseCard.vue'
import CardBody from '@/shared/components/card/CardBody.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import CompactDataList from '@/shared/components/datalist/CompactDataList.vue'

type ListItem = {
  key: string
  label: string
  value?: string | null
}

const props = defineProps<{ title: string; subtitle: string; data_list: ListItem[] }>()
</script>

<style scoped lang="scss">
.wip {
  display: grid;
  padding: space(10) space(8);
  flex: 1;

  align-items: center;
  justify-content: center;

  color: color(text, secondary);
  background: palette(white, 1);
  border-radius: border-radius(md);
  border: 0.2rem dashed color(theme, neutral, theme-alpha, 7);
}
</style>
