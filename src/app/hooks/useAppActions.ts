import type { FormValues as SignInValues } from '../types/sign-in'
import type { FormValues as EmailTokenRequestValues } from '../types/email-token-request'
import { RegisterDto, type FormValues as CreateAccountValues } from '../types/create-account'
import type { FormValues as ResetPasswordValues } from '../types/reset-password'

import SignIn from '../forms/SignIn.vue'
import CreateAccount from '../forms/CreateAccount.vue'
import EmailTokenRequest from '../forms/EmailTokenRequest.vue'
import ResetPassword from '../forms/ResetPassword.vue'

import { useModalStore, type ModalOptions } from '@/shared/stores/modal'
import { useLocalHostAPI } from '@/shared/api/useLocalhostAPI'
import { useAuthStore } from '@/shared/stores/auth'
import { useToastStore } from '@/shared/stores/toasts'
import { useModalSubmit } from '@/shared/hooks/useModalSubmit.ts'

import type { PasswordResetAuthorization } from '@/shared/api/routes/useAuthRoutes'
import EmailOtpChallenge from '@/shared/forms/EmailOtpChallenge.vue'

import LogOutDialog from '@/app/widgets/dialogs/LogOutDialog.vue'

import { isMfaChallenge } from '@/library/models/mfa'
import type {
  EmailOtpChallenge as EmailOtpChallengeModel,
  RegistrationChallenge,
  VerifyEmailOtpInput,
} from '@/library/models/email-otp'

import { createAuthWorkflow, type AuthWorkflow } from '@/shared/helpers/auth-workflow'
import { SessionChangedError } from '@/shared/helpers/session-scope'

export interface AppActions {
  signIn: () => void
  signOut: () => void
  register: () => void
  forgotPassword: () => void
  resendRegistration: () => void
  requestPasswordReset: (values: EmailTokenRequestValues) => Promise<void>
}

export function useAppActions(t: (key: string) => string): AppActions {
  const modalStore = useModalStore()
  const toastStore = useToastStore()
  const authStore = useAuthStore()
  const api = useLocalHostAPI()
  const { handleModalSubmit } = useModalSubmit()

  function openStage(
    options: ModalOptions,
    build: (flow: AuthWorkflow) => Record<string, unknown>,
  ) {
    const props: Record<string, unknown> = {}
    modalStore.open({ ...options, props })
    Object.assign(props, build(createAuthWorkflow(authStore, modalStore)))
  }

  // Forms that display their own errors still propagate ordinary API failures.
  async function cancelObsolete(action: () => Promise<void>): Promise<void> {
    try {
      await action()
    } catch (error) {
      if (!(error instanceof SessionChangedError)) throw error
    }
  }

  function authenticated(
    flow: AuthWorkflow,
    response: Parameters<typeof authStore.authenticate>[0],
    message: string,
  ) {
    flow.complete(() => {
      authStore.authenticate(response, { newSession: true })
      toastStore.addToast({ message: t(message), tone: 'success' })
    })
  }

  function openSignInMfa(
    challenge: Extract<
      Awaited<ReturnType<typeof api.authentication.signIn>>,
      { mfa_required: true }
    >,
  ): void {
    openStage({ view: EmailOtpChallenge, key: 'modal-signin-mfa', persistent: true }, (flow) => ({
      challenge,
      title: t('auth.mfa.signIn.title'),
      description: t('auth.mfa.signIn.description'),
      onCancel: flow.cancel,
      verify: (input: VerifyEmailOtpInput) =>
        flow.request((token) => api.authentication.verifyMfa(token, input)),
      onSuccess: (response: Awaited<ReturnType<typeof api.authentication.verifyMfa>>) =>
        authenticated(flow, response, 'auth.signIn.success'),
    }))
  }

  function signIn(): void {
    openStage({ view: SignIn, size: 'md', key: 'modal-signin' }, (flow) => ({
      callbackForgotPassword: () => flow.transition(forgotPassword),
      callbackResendRegistration: () => flow.transition(resendRegistration),
      callback: () => flow.transition(register),
      callbackSubmit: handleModalSubmit(
        async (values: SignInValues) => {
          const response = await flow.request((token) => api.authentication.signIn(token, values))
          if (isMfaChallenge(response)) await flow.transition(() => openSignInMfa(response))
          else authenticated(flow, response, 'auth.signIn.success')
        },
        { session: flow },
      ),
    }))
  }

  function signOut(): void {
    openStage({ view: LogOutDialog, size: 'sm', key: 'modal-signout' }, (flow) => ({
      callbackCancel: flow.cancel,
      callbackSubmit: handleModalSubmit(
        async () => {
          await flow.request((token) => api.authentication.signOut(token))
          flow.complete(() => {
            authStore.purgeStore()
            toastStore.addToast({ message: t('auth.signOut.success'), tone: 'warning' })
          })
        },
        { session: flow },
      ),
    }))
  }

  function register(): void {
    openStage({ view: CreateAccount, size: 'md', key: 'modal-register' }, (flow) => ({
      callback: () => flow.transition(signIn),
      callbackSubmit: handleModalSubmit(
        async (values: CreateAccountValues) => {
          const challenge = await flow.request((token) =>
            api.authentication.registration.request(token, new RegisterDto(values)),
          )
          await flow.transition(() => openRegistrationOtp(challenge))
        },
        { session: flow },
      ),
    }))
  }

  function openRegistrationOtp(challenge: RegistrationChallenge): void {
    openStage(
      {
        view: EmailOtpChallenge,
        persistent: true,
        key: `registration-otp-${challenge.challenge_id}`,
      },
      (flow) => ({
        challenge,
        email: challenge.email,
        title: t('auth.mfa.registration.title'),
        description: t('auth.mfa.registration.description'),
        onCancel: flow.cancel,
        restart: () => flow.transition(register),
        resend: (): Promise<EmailOtpChallengeModel> =>
          flow.request((token) =>
            api.authentication.registration.resend(token, { email: challenge.email }),
          ),
        verify: (input: VerifyEmailOtpInput) =>
          flow.request((token) => api.authentication.registration.confirm(token, input)),
        onSuccess: (
          response: Awaited<ReturnType<typeof api.authentication.registration.confirm>>,
        ) => authenticated(flow, response, 'auth.createAccount.success'),
      }),
    )
  }

  function forgotPassword(): void {
    openStage({ view: EmailTokenRequest, key: 'modal-password-reset-email' }, (flow) => ({
      kind: 'passwordResetFlow.request',
      callbackSubmit: (values: EmailTokenRequestValues) =>
        cancelObsolete(() => requestReset(values, flow)),
      callbackCancel: () => flow.transition(signIn),
    }))
  }

  function openPasswordResetOtp(email: string): void {
    openStage(
      { view: EmailOtpChallenge, key: 'modal-password-reset-otp', persistent: true },
      (flow) => ({
        email,
        title: t('auth.passwordResetFlow.otp.title'),
        description: t('auth.passwordResetFlow.otp.description'),
        onCancel: flow.cancel,
        verify: ({ code }: VerifyEmailOtpInput) =>
          flow.request((token) => api.authentication.passwordReset.verify(token, { email, code })),
        onSuccess: (authorization: PasswordResetAuthorization) =>
          flow.transition(() => openNewPassword(authorization)),
      }),
    )
  }

  function openNewPassword(authorization: PasswordResetAuthorization): void {
    openStage(
      { view: ResetPassword, key: 'modal-password-reset-password', persistent: true },
      (flow) => ({
        callbackCancel: flow.cancel,
        callbackSubmit: (values: ResetPasswordValues) =>
          cancelObsolete(async () => {
            // Cancellation, replacement, or completion makes this authorization unusable locally.
            if (!flow.isCurrent()) return
            await flow.request((token) =>
              api.authentication.passwordReset.confirm(token, authorization.challenge_id, {
                authorization: authorization.authorization,
                password: values.password,
                confirm: values.confirmPassword,
              }),
            )
            await flow.transition(signIn)
          }),
      }),
    )
  }

  function resendRegistration(): void {
    openStage({ view: EmailTokenRequest, key: 'modal-resend-registration' }, (flow) => ({
      kind: 'resendVerificationEmail',
      callbackSubmit: (values: EmailTokenRequestValues) =>
        cancelObsolete(async () => {
          const challenge = await flow.request((token) =>
            api.authentication.registration.resend(token, values),
          )
          await flow.transition(() => openRegistrationOtp(challenge))
        }),
    }))
  }

  async function requestReset(values: EmailTokenRequestValues, flow: AuthWorkflow): Promise<void> {
    const email = values.email.trim()
    await flow.request((token) => api.authentication.passwordReset.request(token, { email }))
    await flow.transition(() => openPasswordResetOtp(email))
  }

  function requestPasswordReset(values: EmailTokenRequestValues): Promise<void> {
    return cancelObsolete(() => requestReset(values, createAuthWorkflow(authStore, modalStore)))
  }

  return { signIn, signOut, register, forgotPassword, resendRegistration, requestPasswordReset }
}
