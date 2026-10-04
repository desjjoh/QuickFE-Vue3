import type { iArticleSummary, iFeaturedArticle } from '../models/content'

export const MOCK_FEATURED: iFeaturedArticle = {
  id: '1',
  createdAt: new Date('2026-10-01T19:33:44.215327Z'),
  updatedAt: new Date('2026-10-01T19:33:44.215327Z'),

  kicker: "'I STILL LOVE THE GAME'",
  title: 'Ovechkin set to start 22nd NHL season with another Capitals Cup run on his mind',
  description: 'All-time goal-scorer says, ‘I still love the game’ ahead of opener at Hurricanes ',
  image:
    'https://media.d3.nhle.com/image/private/t_ratio16_9-size30/dpr_3.0/f_auto/v1790868459/prd/y3tpzybopre7x46wzrth.jpg',
  imageAlt: 'Alex Ovechkin celebrating with Washington Capitals teammates',

  slug: 'ovechkin-still-loves-the-game',
  href: '/content/ovechkin',

  publishedAt: new Date('2026-10-01T19:33:44.215327Z'),
}

export const MOCK_ARTICLES: iArticleSummary[] = []
