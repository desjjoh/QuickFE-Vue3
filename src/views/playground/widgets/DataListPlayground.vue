<template>
  <PlaygroundShowcase>
    <GridBox :columns="2">
      <GridCell>
        <BaseCard>
          <CardBody>
            <FlexBox direction="column" :gap="3" grow>
              <div class="card-list-item__main">
                <FlexBox direction="column" class="card-list-item__content">
                  <BlockText element="h5">
                    {{ $t('profile.cards.overview.title') }}
                  </BlockText>
                </FlexBox>
              </div>

              <DataList>
                <DataListItem
                  v-for="item in accountDetails"
                  :key="item.id"
                  :label="item.label"
                  :value="item.value"
                />
              </DataList>
            </FlexBox>
          </CardBody>
        </BaseCard>
      </GridCell>
    </GridBox>
  </PlaygroundShowcase>
</template>

<script setup lang="ts">
import { computed, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'

import DataList from '@/shared/components/datalist/DataList.vue'
import DataListItem from '@/shared/components/datalist/DataListItem.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'
import GridCell from '@/shared/components/grid/GridCell.vue'

import PlaygroundShowcase from '../layouts/PlaygroundShowcase.vue'
import BaseCard from '@/shared/components/card/BaseCard.vue'
import CardBody from '@/shared/components/card/CardBody.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'

type AccountDetail = {
  id: string
  label: string
  value: string
}

const { t } = useI18n()

const accountDetails: ComputedRef<AccountDetail[]> = computed<AccountDetail[]>(() => [
  {
    id: 'name',
    label: t('playground.dataList.name.label'),
    value: t('playground.dataList.name.value'),
  },
  {
    id: 'email',
    label: t('playground.dataList.email.label'),
    value: t('playground.dataList.email.value'),
  },
  {
    id: 'role',
    label: t('playground.dataList.role.label'),
    value: t('playground.dataList.role.value'),
  },
])
</script>
