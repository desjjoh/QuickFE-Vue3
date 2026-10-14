import { describe, expect, it, vi } from 'vitest'
import { AxiosService } from '@/shared/helpers/request'
import { createIdempotentActionOptions } from '@/shared/helpers/idempotency'

describe('request and operation identity', () => {
  it('omits absent options and retains explicit configuration without mutating inputs', () => {
    expect(AxiosService.requestConfig({})).toEqual({})
    const params = Object.freeze({ take: 5 })
    const data = Object.freeze({ value: false })
    expect(
      AxiosService.requestConfig({
        token: 'access',
        csrfToken: 'csrf',
        contentType: 'application/json',
        idempotencyKey: 'key',
        params,
        data,
        withCredentials: true,
        preserveSessionOnUnauthorized: true,
      }),
    ).toMatchObject({
      headers: {
        Authorization: 'Bearer access',
        'X-CSRF-Token': 'csrf',
        'Content-Type': 'application/json',
        'Idempotency-Key': 'key',
      },
      params,
      data,
      withCredentials: true,
      __quickfePreserveSessionOnUnauthorized: true,
    })
  })
  it.each(['', ' ', 'a,b', 'a\nb', 'é', 'x'.repeat(129)])(
    'rejects malformed idempotency key %j',
    (key) =>
      expect(() => AxiosService.requestConfig({ idempotencyKey: key })).toThrow('Idempotency-Key'),
  )
  it('accepts the exact key boundary and generates only when omitted', () => {
    expect(AxiosService.requestConfig({ idempotencyKey: 'x'.repeat(128) }).headers).toMatchObject({
      'Idempotency-Key': 'x'.repeat(128),
    })
    const uuid = vi.spyOn(crypto, 'randomUUID')
    AxiosService.idempotentRequestConfig({ idempotencyKey: 'supplied' })
    expect(uuid).not.toHaveBeenCalled()
    expect(AxiosService.idempotentRequestConfig({}).headers).toHaveProperty('Idempotency-Key')
    expect(uuid).toHaveBeenCalledOnce()
  })
  it('hydrates response payloads and propagates constructor failures', () => {
    class Dto {
      constructor(public value: unknown) {
        if (value === null) throw new Error('invalid')
      }
    }
    expect(AxiosService.parseResponse(Dto)({ data: 1 } as never)).toEqual(new Dto(1))
    expect(AxiosService.parseArrayResponse(Dto)({ data: [1, 2] } as never)).toEqual([
      new Dto(1),
      new Dto(2),
    ])
    expect(AxiosService.parseArrayResponse(Dto)({ data: [] } as never)).toEqual([])
    expect(() => AxiosService.parseResponse(Dto)({ data: null } as never)).toThrow('invalid')
  })
  it('reuses canonical retries, rotates edited payloads/files, and isolates forms', () => {
    const options = createIdempotentActionOptions()
    const payload = Object.freeze({ b: [1, 2], a: { z: true, y: null } })
    const first = options(payload).idempotencyKey
    expect(options({ a: { y: null, z: true }, b: [1, 2] }).idempotencyKey).toBe(first)
    expect(options({ ...payload, b: [2, 1] }).idempotencyKey).not.toBe(first)
    const file = new File(['x'], 'a.txt')
    const uploaded = options(payload, file).idempotencyKey
    expect(options(payload, file).idempotencyKey).toBe(uploaded)
    expect(options(payload, new File(['x'], 'a.txt')).idempotencyKey).not.toBe(uploaded)
    expect(createIdempotentActionOptions()(payload).idempotencyKey).not.toBe(first)
  })
  it('does not replace the previous operation when serialization fails', () => {
    const options = createIdempotentActionOptions()
    const key = options({ value: 1 }).idempotencyKey
    expect(() => options({ value: 1n })).toThrow()
    expect(options({ value: 1 }).idempotencyKey).toBe(key)
  })
  it('treats changed Date payloads as distinct operations', () => {
    const options = createIdempotentActionOptions()
    const first = options({ date: new Date('2026-01-01') }).idempotencyKey
    expect(options({ date: new Date('2026-01-01') }).idempotencyKey).toBe(first)
    expect(options({ date: new Date('2026-01-02') }).idempotencyKey).not.toBe(first)
  })
})
