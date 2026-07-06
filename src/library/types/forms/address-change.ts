import type { CountryDto, RegionDto } from '@/library/models/reference'
import * as Yup from 'yup'

export type AddressChangeFormProps = {
  callback?: () => void
  callbackSubmit: (values: FormValues) => Promise<void>
  initialValues?: Partial<AddressChangeInitialValues>
}

export type AddressChangeInitialValues = {
  addressLine1: string
  addressLine2: string | null
  city: string
  country: CountryDto | undefined
  region: RegionDto | undefined
  postalCode: string
}

export type FormValues = {
  addressLine1: string
  addressLine2?: string | null
  city: string
  country: CountryDto
  region: RegionDto
  postalCode: string
}

export class AddressChangeDto {
  public readonly address_line_1: string
  public readonly address_line_2: string | null
  public readonly city: string
  public readonly region_id: string
  public readonly postal_code: string
  public readonly country_id: string

  constructor(payload: FormValues) {
    this.address_line_1 = payload.addressLine1
    this.address_line_2 = payload.addressLine2?.trim() || null
    this.city = payload.city
    this.region_id = payload.region.id
    this.postal_code = payload.postalCode
    this.country_id = payload.country.id
  }
}

export const validationSchema = Yup.object().shape({
  addressLine1: Yup.string().required('validation.required'),
  addressLine2: Yup.string().nullable(),
  city: Yup.string().required('validation.required'),
  country: Yup.mixed<CountryDto>().required('validation.required'),
  region: Yup.mixed<RegionDto>()
    .required('validation.required')
    .test('region-country', 'validation.required', function (value) {
      const country = this.parent.country as CountryDto | undefined

      if (!value || !country) return false

      return country.regions.some((region) => region.id === value.id)
    }),
  postalCode: Yup.string()
    .required('validation.required')
    .test('postal-code', 'validation.postalCode', function (value) {
      const country = this.parent.country as CountryDto | undefined
      const postalCode = value?.trim()

      if (!country || !postalCode) return false
      if (!country.postal_code_pattern) return true

      return new RegExp(country.postal_code_pattern, 'i').test(postalCode)
    }),
})
