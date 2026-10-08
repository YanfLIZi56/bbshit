<script setup>
import { PhX } from '@phosphor-icons/vue'

defineProps({
  open: Boolean,
  title: String,
})

defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
        <div class="absolute inset-0 bg-cocoa-900/35 backdrop-blur-[2px]" @click="$emit('close')"></div>
        <div
          class="modal-panel relative max-h-[86vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-lift sm:max-w-md sm:rounded-3xl"
        >
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-black text-cocoa-900">{{ title }}</h3>
            <button
              class="grid h-8 w-8 place-items-center rounded-full bg-cream text-cocoa-500 transition-colors hover:bg-blush-100 hover:text-blush-600"
              @click="$emit('close')"
            >
              <PhX :size="16" weight="bold" />
            </button>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
