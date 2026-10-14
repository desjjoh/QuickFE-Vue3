import { describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'
import { mountLibrary } from '@test/support/mount'
import { buildUser, buildAudit } from '@test/support/fixtures'
import { UserDto, PhoneDto, AddressDto } from '@/library/models/user'
import { CountryDto } from '@/library/models/reference'
import { AuditDto } from '@/library/models/audit'
import { useLibraryStore } from '@/shared/stores/library'
import { useProfileStore } from '@/views/profile/stores/profile'
import { useFormatter } from '@/shared/hooks/useFormatter'
import { useProfileData } from '@/views/profile/hooks/useProfileData'
import { useProfileActivity } from '@/views/profile/hooks/useProfileActivity'

describe('profile formatting and reactive projections', () => {
  it('handles absent contact details and refreshes formatting when country references arrive', () => {
    let formatter!: ReturnType<typeof useFormatter>
    let library!: ReturnType<typeof useLibraryStore>
    mountLibrary(
      defineComponent({
        setup() {
          formatter = useFormatter()
          library = useLibraryStore()
          return () => null
        },
      }),
    )
    expect(formatter.formatPhoneNumber(null)).toBe('')
    expect(formatter.formatPhoneNumber(undefined)).toBe('')
    expect(formatter.formatAddressLineOne(null)).toBe('')
    expect(formatter.formatAddressLineTwo(null)).toBe('')
    const base = buildUser().profile.region.country
    const phone = new PhoneDto({
      id: 'phone',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      phone_country_id: base.id,
      phone_calling_code: '+1',
      phone_national_number: '4165551234',
      phone_e164: '+14165551234',
    })
    expect(formatter.formatPhoneNumber(phone)).toBe('+1 4165551234')
    library.$countries = [
      new CountryDto({
        ...base,
        phone_format_groups: [3, 3, 4],
        postal_code_format_groups: [3, 3],
        postal_code_format_separator: ' ',
      }),
    ]
    expect(formatter.formatPhoneNumber(phone)).toBe('+1 416 555 1234')
    const address = new AddressDto({
      address_line_1: '1 Main',
      address_line_2: null,
      city: 'Toronto',
      country: 'CA',
      postal_code: 'k1a0b1',
      region: { ...base, key: 'ontario', country: 'CA', code: 'ON', label: 'Ontario' },
    })
    expect(formatter.formatAddressLineOne(address)).toBe('1 Main')
    expect(formatter.formatAddressLineTwo(address)).toBe('Toronto ON K1A 0B1')
  })
  it('updates profile/contact/security projections and clears activity when its source empties', () => {
    const user = ref(new UserDto(buildUser()))
    let data!: ReturnType<typeof useProfileData>
    let activity!: ReturnType<typeof useProfileActivity>
    let store!: ReturnType<typeof useProfileStore>
    mountLibrary(
      defineComponent({
        setup() {
          data = useProfileData(user)
          activity = useProfileActivity()
          store = useProfileStore()
          return () => null
        },
      }),
    )
    expect(data.sessionData.value.find((item) => item.key === 'device')?.value).toBeNull()
    const nextUser = buildUser()
    nextUser.profile.name.preferred = 'Preferred'
    user.value = new UserDto(nextUser)
    expect(data.overviewData.value.find((item) => item.key === 'preferred_name')?.value).toBe(
      'Preferred',
    )
    store.feedActivity = [new AuditDto(buildAudit())]
    expect(activity.activityItems.value).toHaveLength(1)
    store.feedActivity = []
    expect(activity.activityItems.value).toEqual([])
    expect(data.securityData.value.find((item) => item.key === '2fa')?.value).toBeUndefined()
  })
})
