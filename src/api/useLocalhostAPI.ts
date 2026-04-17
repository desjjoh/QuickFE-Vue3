import axios, { type AxiosInstance } from 'axios'

import { AxiosService } from '@/helpers/request'
import { second } from '@/helpers/time'
import { CsrfTokenDto, JwtResponseDto, type iCsrfToken, type iJwtResponse } from '@/models/token'

import type { FormValues as SignInValues } from '@/shared/forms/sign-in/types'
import type { FormValues as CreateAccountValues } from '@/shared/forms/create-account/types'

const instance: AxiosInstance = axios.create({
  baseURL: 'https://localhost:3000/api/authentication/',
  timeout: 10 * second,
  headers: { ['Content-Type']: 'application/json' },
})

const { parseResponse, requestConfig } = AxiosService

export function useLocalHostAPI() {
  async function csrfToken(): Promise<CsrfTokenDto> {
    return instance
      .get<iCsrfToken>('csrf-token', requestConfig({ withCredentials: true }))
      .then(parseResponse(CsrfTokenDto))
  }

  async function verifyToken(csrfToken: string): Promise<JwtResponseDto> {
    return instance
      .get<iJwtResponse>('verify-token', requestConfig({ withCredentials: true, csrfToken }))
      .then(parseResponse(JwtResponseDto))
  }

  async function register(payload: CreateAccountValues): Promise<JwtResponseDto> {
    return instance.put<iJwtResponse>('register', payload).then(parseResponse(JwtResponseDto))
  }

  async function signIn(csrfToken: string, payload: SignInValues): Promise<JwtResponseDto> {
    return instance
      .post<iJwtResponse>('sign-in', payload, requestConfig({ withCredentials: true, csrfToken }))
      .then(parseResponse(JwtResponseDto))
  }

  async function signOut(csrfToken: string): Promise<void> {
    await instance.post<void>('sign-out', {}, requestConfig({ withCredentials: true, csrfToken }))
  }

  return {
    csrfToken,
    verifyToken,
    signIn,
    register,
    signOut,
  }
}
