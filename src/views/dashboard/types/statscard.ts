type StatCard = {
  id: string
  title: string
  value: string
  footerText: string
  trend?: 'up' | 'down'
}

export const statsCards: StatCard[] = [
  {
    id: 'active-clients',
    title: 'Total Active Clients',
    value: '24',
    footerText: '3 new this month',
    trend: 'up',
  },
  {
    id: 'weekly-sessions',
    title: "This Week's Sessions",
    value: '156',
    footerText: '12% vs last week',
    trend: 'up',
  },
  {
    id: 'adherence-rate',
    title: 'Avg. Adherence Rate',
    value: '87%',
    footerText: '5% this month',
    trend: 'up',
  },
  {
    id: 'needs-attention',
    title: 'Clients Needing Attention',
    value: '3',
    footerText: 'Below target activity',
  },
]
