<template>
  <ManagerLayout>
    <!-- CLIENT HEADER -->
    <template #header>
      <ClientHeader />
    </template>

    <!-- QUICK STATS -->
    <template #stats>
      <template v-for="stats in statsCards" :key="stats.id">
        <StatCard v-bind="stats" />
      </template>
    </template>

    <!-- Progress Over Time -->
    <template #progress>
      <SectionCard title="Progress Over Time">
        <div class="wip">
          <BlockText text-align="center">
            Multi-Line Chart: Distance, Session Duration, Pain Scores, Engagement over 12 weeks
          </BlockText>
        </div>
      </SectionCard>
    </template>

    <!-- CURRENT GOALS -->
    <template #goals>
      <SectionCard title="Current Goals">
        <FlexBox direction="column" justify-content="space-between" :gap="4" grow>
          <FlexBox direction="column" :gap="2">
            <RouterLink
              v-for="goal in currentGoals"
              :key="goal.id"
              :to="{ name: 'root' }"
              class="note__row"
            >
              <FlexBox direction="column" :gap="2">
                <FlexBox
                  :gap="4"
                  :gap-y="2"
                  align-items="flex-start"
                  justify-content="space-between"
                  wrap="wrap"
                >
                  <FlexBox direction="column">
                    <BlockText element="h6" truncate>{{ goal.title }}</BlockText>
                    <BlockText tone="tertiary">{{ goal.date }}</BlockText>
                  </FlexBox>

                  <BaseBadge variant="soft" :tone="goal.tone">{{ goal.status }}</BaseBadge>
                </FlexBox>

                <FlexBox direction="column" :gap="1">
                  <BlockText>{{ goal.description }}</BlockText>
                  <ProgressBar :value="goal.completion" :tone="goal.tone" />
                </FlexBox>
              </FlexBox>
            </RouterLink>
          </FlexBox>

          <FlexBox justify-content="flex-end">
            <AppLink :href="{ name: 'root' }">View goals</AppLink>
          </FlexBox>
        </FlexBox>
      </SectionCard>
    </template>

    <!-- RECENT NOTES -->
    <template #notes>
      <SectionCard title="Recent Session Notes">
        <FlexBox direction="column" justify-content="space-between" :gap="4" grow>
          <FlexBox direction="column" :gap="2">
            <RouterLink
              v-for="note in recentSessionNotes"
              :key="note.id"
              :to="{ name: 'root' }"
              class="note__row"
            >
              <FlexBox direction="column" :gap="1">
                <BlockText element="h6">Session №{{ note.sessionNumber }} </BlockText>

                <BlockText :clamp="2">
                  {{ note.summary }}
                </BlockText>

                <BlockText tone="tertiary">
                  {{ note.date }}
                </BlockText>
              </FlexBox>
            </RouterLink>
          </FlexBox>

          <FlexBox justify-content="flex-end">
            <AppLink :href="{ name: 'root' }">View session notes</AppLink>
          </FlexBox>
        </FlexBox>
      </SectionCard>
    </template>
  </ManagerLayout>
</template>

<script setup lang="ts">
import BaseBadge from '@/shared/components/badges/BaseBadge.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'

import BlockText from '@/shared/components/text/BlockText.vue'

import type { StatCard as Stats } from '@/views/dashboard/shared/types/statscard'
import SectionCard from '../../shared/layouts/SectionCard.vue'
import AppLink from '@/shared/components/links/AppLink.vue'
import StatCard from '@/views/dashboard/shared/widgets/StatCard.vue'
import ProgressBar from '@/shared/components/progress/ProgressBar.vue'
import ManagerLayout from './layouts/ManagerLayout.vue'
import ClientHeader from './widgets/ClientHeader.vue'

const statsCards: Stats[] = [
  {
    id: 'total-distance',
    title: 'Total Distance',
    value: '342km',
    footerText: '15% vs last month',
    trend: 'up',
  },
  {
    id: 'session-count',
    title: 'Session Count',
    value: '47',
    footerText: '22% vs last week',
    trend: 'up',
  },
  {
    id: 'adherence-rate',
    title: 'Adherence Rate',
    value: '89%',
    footerText: '9% above target',
    trend: 'up',
  },
  {
    id: 'pain-score',
    title: 'Pain Score',
    value: '2.1',
    footerText: 'Down from 4.5 baseline',
  },
]

const recentSessionNotes: {
  id: string
  date: string
  sessionNumber: number
  summary: string
}[] = [
  {
    id: 'session-47',
    date: 'Feb 7, 2026',
    sessionNumber: 47,
    summary:
      'Significant improvement in ROM. Client reports minimal discomfort during activity. Increased resistance to level 6 without pain response. Parent reports improved mood and confidence.',
  },
  {
    id: 'session-46',
    date: 'Feb 5, 2026',
    sessionNumber: 46,
    summary:
      'Completed 45min session. Good engagement with VR environment. Maintained heart rate in target zone (140–155bpm). Discussed return-to-sport timeline with client and parent.',
  },
  {
    id: 'session-45',
    date: 'Feb 3, 2026',
    sessionNumber: 45,
    summary:
      'Client mentioned some anxiety about upcoming school PE class. Used session to practice movements similar to PE activities. Discussed coping strategies.',
  },
]

const currentGoals: {
  id: string
  title: string
  date: string
  description: string
  completion: number
  tone: 'primary' | 'success'
  status: 'complete' | 'in progress'
}[] = [
  {
    id: '3-sessions-per-week',
    title: 'Complete 3 sessions per week',
    date: 'Nov 15, 2025',
    description: '12/12 weeks achieved',
    completion: 100,
    tone: 'success',
    status: 'complete',
  },
  {
    id: '50k-total-distance',
    title: 'Reach 50km total distance',
    date: 'Feb 1, 2026',
    description: '42.3/50.0 kms travelled',
    completion: 85,
    tone: 'primary',
    status: 'in progress',
  },
  {
    id: 'reduce-pain-score',
    title: 'Reduce pain score below 2.0',
    date: 'Feb 10, 2026',
    description: 'Current: 2.1',
    completion: 92,
    tone: 'primary',
    status: 'in progress',
  },
]
</script>

<style scoped lang="scss">
.wip {
  padding: space(10) space(8);

  color: color(text, secondary);
  background: palette(white, 1);
  border-radius: border-radius(md);
  border: 0.2rem dashed color(theme, neutral, dark-alpha, 7);
}

.note__row {
  --metrics-row-bg: #{color(theme, neutral, dark-alpha, 2)};
  --metrics-row-border: #{color(theme, primary, dark-alpha, 6)};
  --metrics-row-bg-focus: #{color(theme, neutral, dark-alpha, 3)};

  display: block;

  color: inherit;
  text-decoration: none;

  padding: space(2) space(4);

  border-left: solid space(1) var(--metrics-row-border);
  border-radius: border-radius(md);

  background-color: var(--metrics-row-bg);

  @media (hover: hover) {
    &:hover {
      --metrics-row-bg: var(--metrics-row-bg-focus);
    }
  }
}
</style>
