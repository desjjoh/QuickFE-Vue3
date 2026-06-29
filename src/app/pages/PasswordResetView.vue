<template>
  <FullContainer>
    <GridBox class="reset-password" :data-status="status" size="lg">
      <template v-if="status === 'success'">
        <FlexBox class="auth-request-page__card" direction="column" :gap="6">
          <FlexBox direction="column" :gap="2">
            <BlockText element="p" tone="inherit">
              <InlineText class="reset-password__eyebrow" size="sm" weight="semibold">
                {{ $t('auth.resetPassword.success.eyebrow') }}
              </InlineText>
            </BlockText>

            <FlexBox direction="column" :gap="1">
              <BlockText element="h3">{{ $t('auth.resetPassword.success.title') }}</BlockText>
              <BlockText element="p">{{ $t('auth.resetPassword.success.message') }}</BlockText>
            </FlexBox>
          </FlexBox>

          <FlexBox justify-content="flex-end">
            <AppLink :href="{ name: 'root' }">
              {{ $t('auth.resetPassword.actions.backToHome') }}
            </AppLink>
          </FlexBox>
        </FlexBox>
      </template>

      <template v-else-if="status === 'error'">
        <FlexBox class="auth-request-page__card" direction="column" :gap="6">
          <FlexBox direction="column" :gap="2">
            <BlockText element="p" tone="inherit">
              <InlineText class="reset-password__eyebrow" size="sm" weight="semibold">
                {{ $t('auth.resetPassword.error.eyebrow') }}
              </InlineText>
            </BlockText>

            <FlexBox direction="column" :gap="1">
              <BlockText element="h3">{{ $t('auth.resetPassword.error.title') }}</BlockText>
              <BlockText element="p">{{ $t('auth.resetPassword.error.message') }}</BlockText>
            </FlexBox>
          </FlexBox>

          <FlexBox justify-content="flex-end" :gap="2" wrap="wrap">
            <AppLink :href="{ name: 'root' }">
              {{ $t('auth.resetPassword.actions.backToHome') }}
            </AppLink>

            <AppLink :href="{ name: 'auth-password-reset-token' }">
              {{ $t('auth.resetPassword.actions.requestNewToken') }}
            </AppLink>
          </FlexBox>
        </FlexBox>
      </template>

      <ResetPassword
        v-else
        class="auth-request-page__card"
        :callback-submit="submitResetPassword"
      />
    </GridBox>
  </FullContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useLocalHostAPI } from '@/api/useLocalhostAPI'
import AppLink from '@/shared/components/links/AppLink.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import FullContainer from '@/shared/components/container/FullContainer.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'
import InlineText from '@/shared/components/text/InlineText.vue'
import ResetPassword from '@/shared/forms/ResetPassword.vue'
import type { FormValues } from '@/library/types/forms/reset-password'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const api = useLocalHostAPI()
const { purgeStore } = useAuthStore()

const token = route.query.token as string
const tokenId = route.query.token_id as string

const status = ref<'loading' | 'ready' | 'success' | 'error'>('loading')

await router.replace({
  name: route.name ?? undefined,
  params: route.params,
  query: {},
})

try {
  purgeStore()

  await api.security.validatePasswordReset({ token_id: tokenId, token })
} catch {
  status.value = 'error'
}

async function submitResetPassword(values: FormValues): Promise<void> {
  try {
    await api.security.confirmPasswordReset({
      token_id: tokenId,
      token,
      password: values.password,
      confirm: values.confirmPassword,
    })

    status.value = 'success'
  } catch {
    status.value = 'error'
  }
}
</script>

<style scoped lang="scss">
.reset-password {
  --eyebrow-color: #{color(text, secondary)};

  width: 100%;
  max-width: token($modal-sizes, md);
  margin-inline: auto;

  &[data-status='success'] {
    --eyebrow-color: #{color(theme, success, theme-alpha, 11)};
  }

  &[data-status='error'] {
    --eyebrow-color: #{color(theme, danger, theme-alpha, 11)};
  }

  .reset-password__eyebrow {
    color: var(--eyebrow-color);
    letter-spacing: $letter-spaced;
    text-transform: uppercase;
  }
}

.auth-request-page__card {
  width: 100%;
  min-width: 0;
}
</style>
