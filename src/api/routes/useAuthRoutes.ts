import { JwtResponseDto, type iJwtResponse } from '@/models/token'

import { AxiosService } from '@/helpers/request'

import type { FormValues as SignInValues } from '@/shared/types/forms/sign-in'
import type { FormValues as CreateAccountValues } from '@/shared/types/forms/create-account'

import { instance } from '../useLocalhostAPI'

const { parseResponse, requestConfig } = AxiosService

export interface AuthRoutes {
  register: (payload: CreateAccountValues) => Promise<JwtResponseDto>
  signIn: (csrfToken: string, payload: SignInValues) => Promise<JwtResponseDto>
  signOut: (csrfToken: string) => Promise<void>
  verifyToken: (csrfToken: string) => Promise<JwtResponseDto>
}

export function useAuthRoutes(): AuthRoutes {
  async function verifyToken(csrfToken: string): Promise<JwtResponseDto> {
    return instance
      .get<iJwtResponse>(
        'authentication/refresh',
        requestConfig({ withCredentials: true, csrfToken }),
      )
      .then(parseResponse(JwtResponseDto))
  }

  async function register(payload: CreateAccountValues): Promise<JwtResponseDto> {
    return instance
      .put<iJwtResponse>('authentication/register', payload)
      .then(parseResponse(JwtResponseDto))
  }

  async function signIn(csrfToken: string, payload: SignInValues): Promise<JwtResponseDto> {
    return instance
      .post<iJwtResponse>(
        'authentication/sign-in',
        payload,
        requestConfig({ withCredentials: true, csrfToken }),
      )
      .then(parseResponse(JwtResponseDto))
  }

  async function signOut(csrfToken: string): Promise<void> {
    await instance.post<void>(
      'authentication/sign-out',
      {},
      requestConfig({ withCredentials: true, csrfToken }),
    )
  }

  return {
    verifyToken,
    signIn,
    register,
    signOut,
  }
}
