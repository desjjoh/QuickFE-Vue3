<template>
  <CardSection :title="props.title" :subtitle="props.subtitle">
    <DataList>
      <DataListItem
        v-for="item in data_list"
        :key="item.key"
        :label="item.label"
        :value="item.value"
        :empty-label="item.emptyLabel"
      />
    </DataList>

    <template #end>
      <slot name="end"></slot>
    </template>
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
  emptyLabel?: string
}

const props = defineProps<{
  title: string
  subtitle: string
  data_list: ListItem[]
}>()
</script>
