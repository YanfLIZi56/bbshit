<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { PhForkKnife, PhReceipt, PhSlidersHorizontal } from '@phosphor-icons/vue'
import { pendingOrderCount } from './store'

const route = useRoute()

const tabs = [
  { to: '/', label: '点餐', icon: PhForkKnife, exact: true },
  { to: '/orders', label: '订单', icon: PhReceipt, badge: pendingOrderCount },
  { to: '/manage', label: '改菜单', icon: PhSlidersHorizontal },
]

const isActive = (tab) => (tab.exact ? route.path === tab.to : route.path.startsWith(tab.to))
const pending = computed(() => pendingOrderCount.value)
</script>

<template>
  <div class="min-h-screen pb-32">
    <header class="sticky top-0 z-30 border-b border-blush-100 bg-cream/90 backdrop-blur">
      <div class="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <RouterLink to="/" class="flex items-center gap-2">
          <span class="animate-floaty text-3xl">🍼</span>
          <span>
            <span class="block text-xl font-black leading-tight tracking-wide text-cocoa-900">宝宝食堂</span>
            <span class="block text-xs text-cocoa-500">今天想吃点什么呢</span>
          </span>
        </RouterLink>
        <nav class="flex items-center gap-1 rounded-full bg-white p-1 shadow-soft">
          <RouterLink
            v-for="tab in tabs"
            :key="tab.to"
            :to="tab.to"
            class="relative flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold transition-colors"
            :class="isActive(tab) ? 'bg-blush-500 text-white' : 'text-cocoa-500 hover:text-blush-600'"
          >
            <component :is="tab.icon" :size="16" weight="bold" />
            {{ tab.label }}
            <span
              v-if="tab.badge && tab.badge.value > 0"
              :key="tab.badge.value"
              class="animate-pop absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-peach-500 px-1 text-[10px] font-black text-white"
            >
              {{ tab.badge.value }}
            </span>
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-3xl px-4 pt-4">
      <RouterView />
    </main>
  </div>
</template>
