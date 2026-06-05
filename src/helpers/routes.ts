import type { RouteLocationNormalized, LocationQueryValue } from 'vue-router'

export function isValidRouteParam(
  param: RouteLocationNormalized['params'][string] | undefined,
): param is string {
  return typeof param === 'string' && param.trim().length > 0
}

export function isValidRouteQueryParam(
  param: LocationQueryValue | LocationQueryValue[] | undefined,
): param is string {
  return typeof param === 'string' && param.trim().length > 0
}
