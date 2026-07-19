<template>
  <PlaygroundShowcase>
    <GridBox :columns="3">
      <GridCell :span="2">
        <BaseCard>
          <CardBody>
            <FlexBox direction="column" :gap="3" grow>
              <BlockText element="h3">
                {{ $t('profile.cards.activity.title') }}
              </BlockText>

              <ActivityTimeline :items="activityItems" />
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

import { formatLocalizedDateTime } from '@/helpers/date.ts'
import ActivityTimeline, {
  type ActivityTimelineItemData,
} from '@/shared/components/timeline/ActivityTimeline.vue'

import PlaygroundShowcase from '../layouts/PlaygroundShowcase.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'
import GridCell from '@/shared/components/grid/GridCell.vue'
import BaseCard from '@/shared/components/card/BaseCard.vue'
import CardBody from '@/shared/components/card/CardBody.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import BlockText from '@/shared/components/text/BlockText.vue'

const { t, locale } = useI18n()

const activityItems: ComputedRef<ActivityTimelineItemData[]> = computed<ActivityTimelineItemData[]>(
  () => [
    {
      id: 'report-shared',
      title: t('playground.timeline.reportShared.title'),
      description: t('playground.timeline.reportShared.description'),
      timestamp: formatLocalizedDateTime(new Date(2026, 4, 14, 10, 24), locale.value),
    },
    {
      id: 'team-member-added',
      title: t('playground.timeline.teamMemberAdded.title'),
      description: t('playground.timeline.teamMemberAdded.description'),
      timestamp: formatLocalizedDateTime(new Date(2026, 4, 13, 15, 40), locale.value),
    },
    {
      id: 'workspace-created',
      title: t('playground.timeline.workspaceCreated.title'),
      description: t('playground.timeline.workspaceCreated.description'),
      timestamp: formatLocalizedDateTime(new Date(2026, 4, 12, 9, 15), locale.value),
    },
  ],
)
</script>
