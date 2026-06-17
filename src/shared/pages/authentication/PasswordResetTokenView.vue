<template>
  <FullContainer>
    <GridBox class="auth-request-page" :data-status="status">
      <template v-if="status === 'success'">
        <FlexBox direction="column" :gap="6">
          <FlexBox class="auth-request-page__card" direction="column" :gap="2">
            <BlockText
              element="p"
              class="auth-request-page__eyebrow"
              tone="inherit"
              size="sm"
              weight="semibold"
            >
              {{ $t('auth.passwordResetToken.success.eyebrow') }}
            </BlockText>

            <FlexBox direction="column" :gap="1">
              <BlockText element="h3">{{ $t('auth.passwordResetToken.success.title') }}</BlockText>
              <BlockText element="p">{{ $t('auth.passwordResetToken.success.message') }}</BlockText>
            </FlexBox>
          </FlexBox>

          <FlexBox justify-content="flex-end">
            <AppLink :href="{ name: 'root' }">
              {{ $t('auth.passwordResetToken.actions.backToHome') }}
            </AppLink>
          </FlexBox>
        </FlexBox>
      </template>

      <template v-else-if="status === 'error'">
        <FlexBox direction="column" :gap="6">
          <FlexBox class="auth-request-page__card" direction="column" :gap="2">
            <BlockText element="p" tone="inherit">
              <InlineText class="auth-request-page__eyebrow" size="sm" weight="semibold">
                {{ $t('auth.passwordResetToken.error.eyebrow') }}
              </InlineText>
            </BlockText>

            <FlexBox direction="column" :gap="1">
              <BlockText element="h3">{{ $t('auth.passwordResetToken.error.title') }}</BlockText>
              <BlockText element="p">{{ $t('auth.passwordResetToken.error.message') }}</BlockText>
            </FlexBox>
          </FlexBox>

          <FlexBox justify-content="flex-end" :gap="2" wrap="wrap">
            <AppLink :href="{ name: 'root' }">
              {{ $t('auth.passwordResetToken.actions.backToHome') }}
            </AppLink>

            <BaseButton type="button" variant="soft" @click="status = 'ready'">
              {{ $t('auth.passwordResetToken.actions.tryAgain') }}
            </BaseButton>
          </FlexBox>
        </FlexBox>
      </template>

      <EmailTokenRequest
        v-else
        class="auth-request-page__card"
        kind="passwordResetToken"
        :callback-submit="submitPasswordResetRequest"
      />
    </GridBox>
  </FullContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import type { FormValues } from '@/shared/types/forms/email-token-request'

import AppLink from '@/shared/components/links/AppLink.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import FullContainer from '@/shared/components/container/FullContainer.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'
import InlineText from '@/shared/components/text/InlineText.vue'
import EmailTokenRequest from '@/shared/forms/EmailTokenRequest.vue'

import { useI18n } from 'vue-i18n'
import { useAppActions } from '@/shared/hooks/useAppActions'

type AuthRequestStatus = 'ready' | 'success' | 'error'

const { t } = useI18n()
const { requestPasswordReset } = useAppActions(t)

const status = ref<AuthRequestStatus>('ready')

async function submitPasswordResetRequest(values: FormValues): Promise<void> {
  try {
    await requestPasswordReset(values)
    status.value = 'success'
  } catch {
    status.value = 'error'
  }
}
</script>

<style scoped lang="scss">
.auth-request-page {
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

  .auth-request-page__eyebrow {
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
