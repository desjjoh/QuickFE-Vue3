import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { mountHook } from '@test/support/mount'
import { buildUser } from '@test/support/fixtures'
import { CountryDto } from '@/library/models/reference'
import {
  buildPhoneValue,
  findCountryByE164,
  parseNationalNumber,
  resolveCountry,
  phoneValuesEqual,
  extractPhoneDigits,
} from '@/library/components/inputs/hooks/phoneInputUtils'
import { usePhoneInput } from '@/library/components/inputs/hooks/usePhoneInput'

const country = () =>
  new CountryDto({ ...buildUser().profile.region.country, phone_format_groups: [3, 3, 4] })
describe('phone parsing and reactive input', () => {
  it('handles missing, malformed and oversized numbers without mutating country lists', () => {
    const ca = country()
    const countries = Object.freeze([ca])
    expect(extractPhoneDigits(null)).toBe('')
    expect(extractPhoneDigits('abc+(123)')).toBe('123')
    expect(findCountryByE164([], '+123')).toBeUndefined()
    expect(findCountryByE164(countries, undefined)).toBeUndefined()
    expect(buildPhoneValue(undefined, '123')).toBeUndefined()
    expect(buildPhoneValue(ca, 'letters')).toBeUndefined()
    expect(buildPhoneValue(ca, '123456789012345')?.phone_national_number).toHaveLength(10)
    const phone = buildPhoneValue(ca, '1234567890')!
    expect(parseNationalNumber(phone, ca)).toBe('1234567890')
    expect(parseNationalNumber(undefined, ca)).toBe('')
    expect(resolveCountry(countries, phone)).toBe(ca)
    expect(phoneValuesEqual(phone, { ...phone })).toBe(true)
    expect(phoneValuesEqual(phone, undefined)).toBe(false)
  })
  it('synchronizes external values, international paste and clearing', () => {
    const ca = country()
    const countries = ref([ca])
    const value = ref<ReturnType<typeof buildPhoneValue>>()
    const emitUpdate = vi.fn()
    const setValue = vi.fn((next) => {
      value.value = next
    })
    const { result } = mountHook(() =>
      usePhoneInput({
        countries,
        externalValue: () => value.value,
        defaultCountry: () => 'CA',
        fieldValue: value,
        setValue,
        emitUpdate,
      }),
    )
    const input = document.createElement('input')
    input.value = '+1 (416) 555-1234'
    result.onNumberInput({ target: input } as unknown as Event)
    expect(emitUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ phone_e164: '+14165551234' }),
    )
    input.value = ''
    result.onNumberInput({ target: input } as unknown as Event)
    expect(emitUpdate).toHaveBeenLastCalledWith(undefined)
    result.onCountryUpdate(undefined)
    expect(result.selectedCountry.value).toBeUndefined()
  })
})
