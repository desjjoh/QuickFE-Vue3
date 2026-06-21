<template>
  <SettingsLayout>
    <SettingsSection title="Profile media">
      <SettingsListItem
        :key="`${ref_id}-profile-picture`"
        :icon="Camera"
        title="Profile picture"
        description="Upload or update the image used for your account profile."
      >
        <!-- <BaseButton :variant="$variant" tone="primary">Upload a photo</BaseButton> -->
        <IconButton :icon="Plus" :variant="$variant" tone="success" />
        <IconButton :icon="Edit" :variant="$variant" tone="warning" />
        <IconButton :icon="Trash2" :variant="$variant" tone="danger" />
      </SettingsListItem>
    </SettingsSection>

    <SettingsSection title="Personal information">
      <SettingsListItem
        :key="`${ref_id}-profile-details`"
        :icon="Contact"
        title="Profile details"
        description="Manage your name, gender, date of birth, and bio."
      >
        <BaseButton :variant="$variant" tone="primary">Edit profile</BaseButton>
      </SettingsListItem>
    </SettingsSection>

    <SettingsSection title="Contact information">
      <SettingsListItem
        :key="`${ref_id}-phone`"
        :icon="Phone"
        title="Phone number"
        description="Manage the primary phone number associated with your account."
      >
        <IconButton :icon="Plus" :variant="$variant" tone="success" />
        <IconButton :icon="Edit" :variant="$variant" tone="warning" />
        <IconButton :icon="Trash2" :variant="$variant" tone="danger" />
      </SettingsListItem>

      <SettingsListItem
        :key="`${ref_id}-alt-phone`"
        :icon="PhoneForwarded"
        title="Alternate phone number"
        description="Add a backup phone number for contact and recovery options."
      >
        <IconButton :icon="Plus" :variant="$variant" tone="success" />
        <IconButton :icon="Edit" :variant="$variant" tone="warning" />
        <IconButton :icon="Trash2" :variant="$variant" tone="danger" />
      </SettingsListItem>

      <SettingsListItem
        :key="`${ref_id}-address`"
        :icon="MapPinHouse"
        title="Address"
        description="Manage your address and regional account information."
      >
        <IconButton :icon="Plus" :variant="$variant" tone="success" />
        <IconButton :icon="Edit" :variant="$variant" tone="warning" />
        <IconButton :icon="Trash2" :variant="$variant" tone="danger" />
      </SettingsListItem>
    </SettingsSection>
  </SettingsLayout>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import {
  Trash2,
  Camera,
  Contact,
  Phone,
  PhoneForwarded,
  MapPinHouse,
  Edit,
  Plus,
} from 'lucide-vue-next'

import BaseButton from '@/shared/components/buttons/BaseButton.vue'
import IconButton from '@/shared/components/buttons/IconButton.vue'

import { $variant } from '../config/settings.ts'

import SettingsLayout from '../layouts/SettingsLayout.vue'
import SettingsSection from '../layouts/SettingsSection.vue'
import SettingsListItem from '../widgets/SettingsListItem.vue'

const ref_id = useId()
</script>
