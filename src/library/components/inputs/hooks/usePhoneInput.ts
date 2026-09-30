import { computed, ref, watch, type Ref } from 'vue'
import type { CountryDto } from '@/library/models/reference'
import {
  buildPhoneValue,
  extractPhoneDigits,
  findCountryByE164,
  getCountryKey,
  getMaxNationalDigits,
  parseNationalNumber,
  phoneValuesEqual,
  resolveCountry,
  type PhoneInputValue,
} from './phoneInputUtils'

type Options = {
  countries: Ref<CountryDto[]>
  externalValue: () => PhoneInputValue | undefined
  defaultCountry: () => string | undefined
  fieldValue: Ref<PhoneInputValue | undefined>
  setValue: (value: PhoneInputValue | undefined, shouldValidate?: boolean) => void
  emitUpdate: (value: PhoneInputValue | undefined) => void
}

export function usePhoneInput(options: Options) {
  const selectedCountryKey = ref('')
  const nationalNumber = ref('')
  const selectedCountry = computed(() =>
    options.countries.value.find((country) => getCountryKey(country) === selectedCountryKey.value),
  )
  const maxNationalDigits = computed(() =>
    selectedCountry.value ? getMaxNationalDigits(selectedCountry.value) : 15,
  )

  function selectCountry(country: CountryDto | undefined): void {
    selectedCountryKey.value = country ? getCountryKey(country) : ''
  }

  function syncPhoneValue(): void {
    const nextValue = buildPhoneValue(selectedCountry.value, nationalNumber.value)
    options.setValue(nextValue, false)
    options.emitUpdate(nextValue)
  }

  function syncFromValue(phoneValue: PhoneInputValue | undefined): void {
    const country = resolveCountry(options.countries.value, phoneValue, options.defaultCountry())
    selectCountry(country)
    nationalNumber.value = parseNationalNumber(phoneValue, country)
    options.setValue(phoneValue, false)
  }

  function onCountryUpdate(country: CountryDto | undefined): void {
    selectCountry(country)
    if (country) nationalNumber.value = nationalNumber.value.slice(0, getMaxNationalDigits(country))
    if (!nationalNumber.value) {
      options.setValue(undefined, false)
      return
    }
    syncPhoneValue()
  }

  function onNumberInput(event: Event): void {
    const target = event.target as HTMLInputElement
    const international = target.value.trim().startsWith('+')
    if (international) {
      selectCountry(
        findCountryByE164(options.countries.value, target.value, options.defaultCountry()),
      )
    }
    const digits = international
      ? parseNationalNumber(
          {
            phone_country_id: selectedCountry.value?.id ?? '',
            phone_calling_code: '',
            phone_national_number: '',
            phone_e164: target.value,
          },
          selectedCountry.value,
        )
      : extractPhoneDigits(target.value).slice(0, maxNationalDigits.value)
    nationalNumber.value = digits
    syncPhoneValue()
  }

  watch(options.countries, () => syncFromValue(options.externalValue()), { immediate: true })
  watch(options.externalValue, (phoneValue) => {
    if (!phoneValuesEqual(phoneValue, options.fieldValue.value)) syncFromValue(phoneValue)
  })

  return {
    selectedCountry,
    nationalNumber,
    maxNationalDigits,
    onCountryUpdate,
    onNumberInput,
  }
}
