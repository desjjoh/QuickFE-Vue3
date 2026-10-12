<template>
  <CardSection
    :title="$t('profile.cards.activity.title')"
    :subtitle="$t('profile.cards.activity.subtitle')"
  >
    <FlexBox direction="column" :gap="3" grow>
      <FlexBox direction="column" grow>
        <ActivityTimeline :items="activityItems" />
      </FlexBox>

      <ButtonLink :to="{ name: 'settings-activity' }" variant="surface" tone="primary">
        {{ $t('profile.cards.activity.action') }}
      </ButtonLink>
    </FlexBox>
  </CardSection>
</template>

<script setup lang="ts">
import ButtonLink from '@/library/components/links/ButtonLink.vue'
import FlexBox from '@/library/components/flex/FlexBox.vue'
import ActivityTimeline, {
  type ActivityTimelineItemData,
} from '@/library/components/timeline/ActivityTimeline.vue'

import CardSection from '../layouts/CardSection.vue'

defineProps<{ activityItems: ActivityTimelineItemData[] }>()
</script>
