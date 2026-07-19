<template>
  <StackedLayout scroll-to-top>
    <PlaygroundContent>
      <!-- ALERT DIALOGS -->
      <PlaygroundSection :title="$t('playground.header.sections.alertDialog')">
        <template #body>
          <AlertDialogPlayground />
        </template>
      </PlaygroundSection>

      <!-- AVATARS -->
      <PlaygroundSection :title="$t('playground.header.sections.avatar')">
        <template #body>
          <AvatarPlayground />
        </template>
      </PlaygroundSection>

      <!-- BADGES -->
      <PlaygroundSection :title="$t('playground.header.sections.badge')">
        <template #body>
          <BadgePlayground />
        </template>
      </PlaygroundSection>

      <!-- BLOCKQUOTES -->
      <PlaygroundSection :title="$t('playground.header.sections.blockquote')">
        <template #body>
          <BlockquotePlayground />
        </template>
      </PlaygroundSection>

      <!-- BUTTONS -->
      <PlaygroundSection :title="$t('playground.header.sections.button')">
        <template #body>
          <ButtonPlayground />
        </template>
      </PlaygroundSection>

      <!-- BUTTON LINKS -->
      <PlaygroundSection :title="$t('playground.header.sections.buttonLinks')">
        <template #body>
          <ButtonLinkPlayground />
        </template>
      </PlaygroundSection>

      <!-- CALLOUTS -->
      <PlaygroundSection :title="$t('playground.header.sections.callout')">
        <template #body>
          <CalloutPlayground />
        </template>
      </PlaygroundSection>

      <!-- CARDS -->
      <PlaygroundSection :title="$t('playground.header.sections.card')">
        <template #body>
          <CardPlayground />
        </template>
      </PlaygroundSection>

      <!-- CHECKBOX -->
      <PlaygroundSection :title="$t('playground.header.sections.checkbox')">
        <template #body>
          <CheckboxPlayground />
        </template>
      </PlaygroundSection>

      <!-- COLORS -->
      <PlaygroundSection :title="$t('playground.header.sections.color')">
        <template #body>
          <ColorPlayground />
        </template>
      </PlaygroundSection>

      <!-- DATA LISTS -->
      <PlaygroundSection :title="$t('playground.header.sections.dataList')">
        <template #body>
          <DataListPlayground />
        </template>
      </PlaygroundSection>

      <!-- DATE INPUT -->
      <PlaygroundSection :title="$t('playground.header.sections.dateField')">
        <template #body>
          <DateFieldPlayground />
        </template>
      </PlaygroundSection>

      <!-- DROPDOWNS -->
      <PlaygroundSection :title="$t('playground.header.sections.dropdownMenu')">
        <template #body>
          <DropdownPlayground />
        </template>
      </PlaygroundSection>

      <!-- FORMS -->
      <PlaygroundSection :title="$t('playground.header.sections.forms')">
        <template #body>
          <FormsPlayground />
        </template>
      </PlaygroundSection>

      <!-- ICON BUTTON -->
      <PlaygroundSection :title="$t('playground.header.sections.iconButton')">
        <template #body>
          <IconButtonPlayground />
        </template>
      </PlaygroundSection>

      <!-- IMAGE BUTTONS -->
      <PlaygroundSection :title="$t('playground.header.sections.imageButton')">
        <template #body>
          <ImageButtonPlayground />
        </template>
      </PlaygroundSection>

      <!-- LINKS -->
      <PlaygroundSection :title="$t('playground.header.sections.link')">
        <template #body>
          <LinkPlayground />
        </template>
      </PlaygroundSection>

      <!-- LINK BUTTONS -->
      <PlaygroundSection :title="$t('playground.header.sections.linkButton')">
        <template #body>
          <LinkButtonPlayground />
        </template>
      </PlaygroundSection>

      <!-- OFFCANVAS -->
      <PlaygroundSection :title="$t('playground.header.sections.offcanvas')">
        <template #body>
          <OffcanvasPlayground />
        </template>
      </PlaygroundSection>

      <!-- PASSWORD INPUT -->
      <PlaygroundSection :title="$t('playground.header.sections.passwordInput')">
        <template #body>
          <PasswordInputPlayground />
        </template>
      </PlaygroundSection>

      <!-- PHONE INPUT -->
      <PlaygroundSection :title="$t('playground.header.sections.phoneInput')">
        <template #body>
          <PhoneInputPlayground />
        </template>
      </PlaygroundSection>

      <!-- PROGRESS BAR -->
      <PlaygroundSection :title="$t('playground.header.sections.progressBar')">
        <template #body>
          <ProgressBarPlayground />
        </template>
      </PlaygroundSection>

      <!-- SEARCH INPUT -->
      <PlaygroundSection :title="$t('playground.header.sections.searchInput')">
        <template #body>
          <SearchInputPlayground />
        </template>
      </PlaygroundSection>

      <!-- SELECT -->
      <PlaygroundSection :title="$t('playground.header.sections.select')">
        <template #body>
          <SelectPlayground />
        </template>
      </PlaygroundSection>

      <!-- TABS -->
      <PlaygroundSection :title="$t('playground.header.sections.tabs')">
        <template #body>
          <TabsPlayground />
        </template>
      </PlaygroundSection>

      <!-- TEXT AREAS -->
      <PlaygroundSection :title="$t('playground.header.sections.textArea')">
        <template #body>
          <TextAreaPlayground />
        </template>
      </PlaygroundSection>

      <!-- TEXT FIELDS -->
      <PlaygroundSection :title="$t('playground.header.sections.textField')">
        <template #body>
          <TextFieldPlayground />
        </template>
      </PlaygroundSection>

      <!-- TIMELINES -->
      <PlaygroundSection :title="$t('playground.header.sections.timeline')">
        <template #body>
          <TimelinePlayground />
        </template>
      </PlaygroundSection>

      <!-- TOASTS -->
      <PlaygroundSection :title="$t('playground.header.sections.toasts')">
        <template #body>
          <ToastPlayground />
        </template>
      </PlaygroundSection>

      <!-- TOOLTIPS -->
      <PlaygroundSection :title="$t('playground.header.sections.tooltip')">
        <template #body>
          <TooltipPlayground />
        </template>
      </PlaygroundSection>

      <!-- TYPOGRAPHY -->
      <PlaygroundSection :title="$t('playground.header.sections.typography')">
        <template #body>
          <TypographyPlayground />
        </template>
      </PlaygroundSection>
    </PlaygroundContent>
  </StackedLayout>
</template>

<script setup lang="ts">
import StackedLayout from '@/shared/layouts/StackedLayout.vue'

import PlaygroundSection from './layouts/PlaygroundSection.vue'
import PlaygroundContent from './layouts/PlaygroundContent.vue'

import ButtonPlayground from './widgets/ButtonPlayground.vue'
import TypographyPlayground from './widgets/TypographyPlayground.vue'
import LinkPlayground from './widgets/LinkPlayground.vue'
import BadgePlayground from './widgets/BadgePlayground.vue'
import BlockquotePlayground from './widgets/BlockquotePlayground.vue'
import AvatarPlayground from './widgets/AvatarPlayground.vue'
import CalloutPlayground from './widgets/CalloutPlayground.vue'
import IconButtonPlayground from './widgets/IconButtonPlayground.vue'
import CardPlayground from './widgets/CardPlayground.vue'
import TabsPlayground from './widgets/TabsPlayground.vue'
import ColorPlayground from './widgets/ColorPlayground.vue'
import TextFieldPlayground from './widgets/TextFieldPlayground.vue'
import FormsPlayground from './widgets/FormsPlayground.vue'
import CheckboxPlayground from './widgets/CheckboxPlayground.vue'
import TextAreaPlayground from './widgets/TextAreaPlayground.vue'
import DropdownPlayground from './widgets/DropdownPlayground.vue'
import TooltipPlayground from './widgets/TooltipPlayground.vue'
import AlertDialogPlayground from './widgets/AlertDialogPlayground.vue'
import ToastPlayground from './widgets/ToastPlayground.vue'
import OffcanvasPlayground from './widgets/OffcanvasPlayground.vue'
import SelectPlayground from './widgets/SelectPlayground.vue'
import ProgressBarPlayground from './widgets/ProgressBarPlayground.vue'
import DateFieldPlayground from './widgets/DateFieldPlayground.vue'
import ButtonLinkPlayground from './widgets/ButtonLinkPlayground.vue'
import LinkButtonPlayground from './widgets/LinkButtonPlayground.vue'
import SearchInputPlayground from './widgets/SearchInputPlayground.vue'
import PasswordInputPlayground from './widgets/PasswordInputPlayground.vue'
import ImageButtonPlayground from './widgets/ImageButtonPlayground.vue'
import PhoneInputPlayground from './widgets/PhoneInputPlayground.vue'
import TimelinePlayground from './widgets/TimelinePlayground.vue'
import DataListPlayground from './widgets/DataListPlayground.vue'
</script>
