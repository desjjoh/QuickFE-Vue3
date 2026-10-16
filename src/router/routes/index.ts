// DEVELOPMENT ROUTES
import template from './_template'
import playground from './_playground'

// PROTECTED ROUTES
import administration from './_administration'
import settings from './_settings'
import profile from './_profile'

// PUBLIC ROUTES
import home from './_home'

export const routes = [home, profile, settings, administration, template, playground]
