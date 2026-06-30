<template>
  <FullContainer>
    <GridBox class="confirm-email-page">
      <div class="confirm-email" :data-status="status">
        <template v-if="status === 'success'">
          <FlexBox direction="column" :gap="6">
            <FlexBox direction="column" :gap="2">
              <BlockText element="p" tone="inherit">
                <InlineText class="confirm-email__eyebrow" size="sm" weight="semibold">
                  {{ $t(`auth.confirmEmail.${i18nKey}.success.eyebrow`) }}
                </InlineText>
              </BlockText>

              <FlexBox direction="column" :gap="1">
                <BlockText element="h3">{{
                  $t(`auth.confirmEmail.${i18nKey}.success.title`)
                }}</BlockText>
                <BlockText element="p">{{
                  $t(`auth.confirmEmail.${i18nKey}.success.message`)
                }}</BlockText>
              </FlexBox>
            </FlexBox>

            <FlexBox justify-content="flex-end">
              <AppLink :href="{ name: 'root' }">
                {{ $t('auth.confirmEmail.actions.backToHome') }}
              </AppLink>
            </FlexBox>
          </FlexBox>
        </template>

        <template v-else-if="status === 'error'">
          <FlexBox direction="column" :gap="6">
            <FlexBox direction="column" :gap="2">
              <BlockText element="p" tone="inherit">
                <InlineText class="confirm-email__eyebrow" size="sm" weight="semibold">
                  {{ $t(`auth.confirmEmail.${i18nKey}.error.eyebrow`) }}
                </InlineText>
              </BlockText>

              <FlexBox direction="column" :gap="1">
                <BlockText element="h3">{{
                  $t(`auth.confirmEmail.${i18nKey}.error.title`)
                }}</BlockText>
                <BlockText element="p">{{
                  $t(`auth.confirmEmail.${i18nKey}.error.message`)
                }}</BlockText>
              </FlexBox>
            </FlexBox>

            <FlexBox justify-content="flex-end" :gap="2" wrap="wrap">
              <AppLink :href="{ name: 'root' }">
                {{ $t('auth.confirmEmail.actions.backToHome') }}
              </AppLink>
            </FlexBox>
          </FlexBox>
        </template>

        <VerifyEmail v-else :kind="i18nKey" :callback-submit="submitVerificationCode" />
      </div>
    </GridBox>
  </FullContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useLocalHostAPI } from '@/api/useLocalhostAPI'

import FullContainer from '@/shared/components/container/FullContainer.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import InlineText from '@/shared/components/text/InlineText.vue'
import AppLink from '@/shared/components/links/AppLink.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'

import VerifyEmail, { type VerifyEmailKind } from '@/shared/forms/VerifyEmail.vue'
import type { FormValues } from '@/library/types/forms/verify-email'

import { useAuthStore } from '@/stores/auth'
import type { VerifyEmailType } from '@/helpers/routes'

type ConfirmationStatus = 'loading' | 'ready' | 'success' | 'error'

const route = useRoute()
const router = useRouter()
const api = useLocalHostAPI()
const authStore = useAuthStore()

const status = ref<ConfirmationStatus>('loading')

const token = route.query.token as string
const tokenId = route.query.token_id as string
const verificationType = route.query.type as VerifyEmailType
const i18nKey = computed<VerifyEmailKind>(() =>
  verificationType === 'email-change' ? 'emailChange' : 'register',
)

const routeActions = {
  register: api.authentication.registration,
  'email-change': api.authentication.emailVerification,
} as const

await router.replace({
  name: route.name ?? undefined,
  params: route.params,
  query: {},
})

try {
  const csrfToken = await authStore.getValidCsrfToken()

  await routeActions[verificationType].validate(csrfToken, tokenId, { token })

  authStore.purgeStore()
  status.value = 'ready'
} catch {
  status.value = 'error'
}

async function submitVerificationCode(values: FormValues): Promise<void> {
  try {
    const csrfToken = await authStore.getValidCsrfToken()

    await routeActions[verificationType].confirm(csrfToken, tokenId, { token, code: values.code })

    authStore.purgeStore()
    status.value = 'success'
  } catch {
    status.value = 'error'
  }
}
</script>

<style scoped lang="scss">
.confirm-email-page {
  width: 100%;
  max-width: token($modal-sizes, md);
  margin-inline: auto;
}

.confirm-email {
  --eyebrow-color: #{color(text, secondary)};

  width: 100%;
  min-width: 0;

  &[data-status='success'] {
    --eyebrow-color: #{color(theme, success, theme-alpha, 11)};
  }

  &[data-status='error'] {
    --eyebrow-color: #{color(theme, danger, theme-alpha, 11)};
  }

  .confirm-email__content {
    width: 100%;
    min-width: 0;
  }

  .confirm-email__eyebrow {
    color: var(--eyebrow-color);
    letter-spacing: $letter-spaced;
    text-transform: uppercase;
  }
}
</style>
