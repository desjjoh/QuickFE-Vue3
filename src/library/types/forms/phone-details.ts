import type { PhoneInputValue } from '@/shared/components/inputs/PhoneInput.vue'

export type PhoneDetailsInitialValues = {
  phone: PhoneInputValue | undefined
}

export type PhonePayload = {
  phone_country_id: string
  phone_calling_code: string
  phone_national_number: string
  phone_e164: string
}

export class PhoneDetailsDto implements PhonePayload {
  public readonly phone_country_id: string
  public readonly phone_calling_code: string
  public readonly phone_national_number: string
  public readonly phone_e164: string

  public constructor(phone: PhoneInputValue) {
    this.phone_country_id = phone.phone_country_id
    this.phone_calling_code = phone.phone_calling_code
    this.phone_national_number = phone.phone_national_number
    this.phone_e164 = phone.phone_e164
  }
}
