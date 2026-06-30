import type { RouteLocationNormalized, LocationQueryValue } from 'vue-router'

const VALID_VERIFY_EMAIL_TYPES = ['register', 'email-change'] as const
type VerifyEmailType = (typeof VALID_VERIFY_EMAIL_TYPES)[number]

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

export function isValidVerifyEmailType(value: unknown): value is VerifyEmailType {
  return typeof value === 'string' && VALID_VERIFY_EMAIL_TYPES.includes(value as VerifyEmailType)
}
