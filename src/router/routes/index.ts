// DEVELOPMENT ROUTES
import template from './_template'
import playground from './_playground'

// PROTECTED ROUTES
import administration from './_administration'
import settings from './_settings'
import profile from './_profile'

// PUBLIC ROUTES
import home from './_home'
import news from './_news'
import videos from './_videos'
import forums from './_forums'
import shop from './_shop'

export const routes = [
  home,
  news,
  videos,
  forums,
  shop,
  profile,
  settings,
  administration,
  template,
  playground,
]
