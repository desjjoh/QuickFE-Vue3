import { defineStore } from 'pinia'

import { mockHomeContent } from '../data/mockContent'
import type { Article, FeaturedArticle, Headline, Video } from '../types/content'

export const useHomeStore = defineStore('home', {
  state: () => ({
    featuredArticle: null as FeaturedArticle | null,
    secondaryArticles: [] as Article[],
    headlines: [] as Headline[],
    videos: [] as Video[],
  }),
  actions: {
    loadContent(): void {
      this.featuredArticle = { ...mockHomeContent.featuredArticle }
      this.secondaryArticles = mockHomeContent.secondaryArticles.map((article) => ({ ...article }))
      this.headlines = mockHomeContent.headlines.map((headline) => ({ ...headline }))
      this.videos = mockHomeContent.videos.map((video) => ({ ...video }))
    },
  },
})
