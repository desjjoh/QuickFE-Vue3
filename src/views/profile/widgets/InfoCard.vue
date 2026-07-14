<template>
  <CardSection :title="props.title" :subtitle="props.subtitle">
    <DataList>
      <DataListItem
        v-for="item in data_list"
        :key="item.key"
        :label="item.label"
        :value="item.value"
      />
    </DataList>
  </CardSection>
</template>

<script setup lang="ts">
import CardSection from '../layouts/CardSection.vue'
import DataListItem from '@/shared/components/datalist/DataListItem.vue'
import DataList from '@/shared/components/datalist/DataList.vue'

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
