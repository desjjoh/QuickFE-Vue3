<template>
  <div class="about">
    <h1>This is an about page</h1>
    <DropdownMenu>
      <template #trigger="{ toggle, triggerAttrs }">
        <button type="button" :style="triggerAttrs" @click="toggle">Actions</button>
      </template>

      <button role="menuitem" type="button" @click="doThing('Edit')">Edit</button>
      <button role="menuitem" type="button" @click="doThing('Duplicate')">Duplicate</button>
      <hr />
      <button role="menuitem" type="button" @click="doThing('Delete')">Delete</button>
    </DropdownMenu>
  </div>
</template>

<script setup lang="ts">
import DropdownMenu from '@/shared/components/DropdownMenu.vue'

function doThing(name: string): void {
  console.log('clicked', name)
}
</script>

<style scoped lang="scss">
@media (min-width: 1024px) {
  .about {
    display: flex;
    align-items: center;
  }
}
</style>
