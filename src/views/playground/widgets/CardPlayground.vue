<template>
  <PlaygroundShowcase>
    <GridBox :columns="3">
      <GridCell>
        <BaseCard>
          <CardMedia src="/assets/stock/600x400/img-78.jpg" alt="card-head" :size="50" />
          <CardBody>
            <FlexBox direction="column" :gap="3">
              <FlexBox direction="column" :gap="2">
                <FlexBox :gap="2">
                  <BaseBadge variant="soft">technology</BaseBadge>
                  <BaseBadge tone="neutral" variant="soft">design</BaseBadge>
                </FlexBox>

                <BlockText>
                  <InlineText element="strong">Typography</InlineText> is the art and technique of
                  arranging type to make written language legible, readable and appealing when
                  displayed.
                </BlockText>
              </FlexBox>

              <FlexBox :gap="3" align-items="center">
                <AvatarItem src="/assets/avatars/300-20.jpg" alt="user-avatar" />
                <FlexBox direction="column" overflow="hidden" grow>
                  <BlockText element="h5">Emily Adams</BlockText>
                  <BlockText truncate>
                    <InlineText element="i">emily.adams@example.com</InlineText>
                  </BlockText>
                </FlexBox>
              </FlexBox>
            </FlexBox>
          </CardBody>
        </BaseCard>
      </GridCell>

      <GridCell>
        <BaseCard>
          <CardMedia src="/assets/stock/600x400/img-80.jpg" alt="card-head" :size="50" />
          <CardBody>
            <FlexBox direction="column" :gap="3">
              <FlexBox direction="column" :gap="2">
                <FlexBox :gap="2">
                  <BaseBadge tone="warning" variant="soft">technology</BaseBadge>
                  <BaseBadge tone="neutral" variant="soft">design</BaseBadge>
                </FlexBox>
                <BlockText>
                  <InlineText element="strong">Typography</InlineText> is the art and technique of
                  arranging type to make written language legible, readable and appealing when
                  displayed.
                </BlockText>
              </FlexBox>

              <FlexBox :gap="3" align-items="center">
                <AvatarItem variant="soft">EA</AvatarItem>
                <FlexBox direction="column" overflow="hidden" grow>
                  <BlockText element="h5">Emily Adams</BlockText>
                  <BlockText truncate>
                    <InlineText element="i">emily.adams@example.com</InlineText>
                  </BlockText>
                </FlexBox>
              </FlexBox>
            </FlexBox>
          </CardBody>
        </BaseCard>
      </GridCell>

      <GridCell>
        <BaseCard>
          <CardMedia src="/assets/stock/600x400/img-76.jpg" alt="card-head" :size="50" />
          <CardBody>
            <FlexBox direction="column" :gap="3">
              <FlexBox direction="column" :gap="2">
                <FlexBox :gap="2">
                  <BaseBadge tone="success" variant="soft">technology</BaseBadge>
                  <BaseBadge tone="neutral" variant="soft">design</BaseBadge>
                </FlexBox>
                <BlockText>
                  <InlineText element="strong">Typography</InlineText> is the art and technique of
                  arranging type to make written language legible, readable and appealing when
                  displayed.
                </BlockText>
              </FlexBox>

              <FlexBox :gap="3" align-items="center">
                <AvatarItem variant="soft" />
                <FlexBox direction="column" overflow="hidden" grow>
                  <BlockText element="h5">Emily Adams</BlockText>
                  <BlockText truncate>
                    <InlineText element="i">emily.adams@example.com</InlineText>
                  </BlockText>
                </FlexBox>
              </FlexBox>
            </FlexBox>
          </CardBody>
        </BaseCard>
      </GridCell>
    </GridBox>
  </PlaygroundShowcase>
</template>

<script setup lang="ts">
import BlockText from '@/shared/components/text/BlockText.vue'

import BaseCard from '@/shared/components/card/BaseCard.vue'
import CardBody from '@/shared/components/card/CardBody.vue'

import PlaygroundShowcase from '../layouts/PlaygroundShowcase.vue'
import CardMedia from '@/shared/components/card/CardMedia.vue'
import InlineText from '@/shared/components/text/InlineText.vue'

import GridCell from '@/shared/components/grid/GridCell.vue'
import GridBox from '@/shared/components/grid/GridBox.vue'
import FlexBox from '@/shared/components/flex/FlexBox.vue'
import AvatarItem from '@/shared/components/avatars/AvatarItem.vue'
import BaseBadge from '@/shared/components/badges/BaseBadge.vue'
</script>
