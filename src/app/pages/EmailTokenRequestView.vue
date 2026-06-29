<template>
  <FullContainer>
    <GridBox class="auth-request-page" :data-status="status" size="lg">
      <template v-if="status === 'success'">
        <FlexBox class="auth-request-page__card" direction="column" :gap="6">
          <FlexBox direction="column" :gap="2">
            <BlockText
              element="p"
              tone="inherit"
              class="auth-request-page__eyebrow"
              size="sm"
              weight="semibold"
            >
              {{ $t(`auth.${config.kind}.success.eyebrow`) }}
            </BlockText>

            <FlexBox direction="column" :gap="1">
              <BlockText element="h3">
                {{ $t(`auth.${config.kind}.success.title`) }}
              </BlockText>
              <BlockText element="p">
                {{ $t(`auth.${config.kind}.success.message`) }}
              </BlockText>
            </FlexBox>
          </FlexBox>

          <FlexBox justify-content="flex-end">
            <AppLink :href="{ name: 'root' }">
              {{ $t(`auth.${config.kind}.actions.backToHome`) }}
            </AppLink>
          </FlexBox>
        </FlexBox>
      </template>

      <template v-else-if="status === 'error'">
        <FlexBox class="auth-request-page__card" direction="column" :gap="6">
          <FlexBox direction="column" :gap="2">
            <BlockText
              element="p"
              tone="inherit"
              class="auth-request-page__eyebrow"
              size="sm"
              weight="semibold"
            >
              {{ $t(`auth.${config.kind}.error.eyebrow`) }}
            </BlockText>

            <FlexBox direction="column" :gap="1">
              <BlockText element="h3">
                {{ $t(`auth.${config.kind}.error.title`) }}
              </BlockText>
              <BlockText element="p">
                {{ $t(`auth.${config.kind}.error.message`) }}
              </BlockText>
            </FlexBox>
          </FlexBox>

          <FlexBox justify-content="flex-end" :gap="2" wrap="wrap">
            <AppLink :href="{ name: 'root' }">
              {{ $t(`auth.${config.kind}.actions.backToHome`) }}
            </AppLink>

            <BaseButton type="button" variant="soft" @click="status = 'ready'">
              {{ $t(`auth.${config.kind}.actions.tryAgain`) }}
            </BaseButton>
          </FlexBox>
        </FlexBox>
      </template>

      <EmailTokenRequest
        v-else
        class="auth-request-page__card"
        :kind="config.kind"
        :callback-submit="submitRequest"
      />
    </GridBox>
  </FullContainer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, type RouteLocationNormalizedLoadedGeneric } from 'vue-router'

import type {
  EmailTokenRequestRouteConfig,
  FormValues,
} from '@/library/types/forms/email-token-request'

import AppLink from '@/shared/components/links/AppLink.vue'
import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import BlockText from '@/shared/components/text/BlockText.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import FullContainer from '@/shared/components/container/FullContainer.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'
import EmailTokenRequest from '@/shared/forms/EmailTokenRequest.vue'
import { useAppActions } from '@/app/hooks/useAppActions'

type AuthRequestStatus = 'ready' | 'success' | 'error'

const route = useRoute()
const { t } = useI18n()
const actions = useAppActions(t)

const status = ref<AuthRequestStatus>('ready')
const config = computed<EmailTokenRequestRouteConfig>(() => getAuthRoute(route))

watch(
  () => route.name,
  () => {
    status.value = 'ready'
  },
)

function getAuthRoute(route: RouteLocationNormalizedLoadedGeneric): EmailTokenRequestRouteConfig {
  const config = route.meta.emailTokenRequest

  if (!config) throw new Error('Missing email token request route config')

  return config
}

async function submitRequest(values: FormValues): Promise<void> {
  try {
    await actions[config.value.action](values)
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
