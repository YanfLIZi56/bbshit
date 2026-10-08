<script setup>
import { computed } from 'vue'
import { PhCheckCircle, PhClockCounterClockwise } from '@phosphor-icons/vue'
import { store, toggleOrderStatus, fmtTime } from '@/store'

const pendingCount = computed(() => store.orders.filter((o) => o.status === 'pending').length)
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-black text-cocoa-900">全部订单</h2>
      <p class="text-xs font-bold text-cocoa-500">
        共 {{ store.orders.length }} 单 · 待开饭
        <span class="text-blush-600">{{ pendingCount }}</span> 单
      </p>
    </div>

    <div v-if="store.orders.length" class="mt-3 space-y-3">
      <article v-for="order in store.orders" :key="order.id" class="rounded-3xl bg-white p-4 shadow-soft">
        <div class="flex items-center justify-between">
          <p class="flex items-center gap-1.5 text-xs font-bold text-cocoa-300">
            <PhClockCounterClockwise :size="12" />
            {{ fmtTime(order.createdAt) }}
          </p>
          <span
            class="rounded-full px-2.5 py-0.5 text-[10px] font-black"
            :class="order.status === 'pending' ? 'bg-peach-100 text-peach-500' : 'bg-[#e5f6ec] text-[#3cab63]'"
          >
            {{ order.status === 'pending' ? '待开饭' : '已完成' }}
          </span>
        </div>
        <div class="mt-2.5 space-y-1">
          <p v-for="item in order.items" :key="item.dishId" class="flex justify-between text-sm text-cocoa-700">
            <span>{{ item.emoji }} {{ item.name }} <span class="text-cocoa-300">× {{ item.qty }}</span></span>
            <span class="text-cocoa-500">{{ item.price * item.qty }} mk</span>
          </p>
        </div>
        <div class="mt-3 flex items-center justify-between border-t border-dashed border-blush-100 pt-3">
          <p class="text-sm text-cocoa-500">
            合计 <b class="text-lg font-black text-blush-600">{{ order.total }}</b> mk
          </p>
          <button
            class="rounded-full px-4 py-1.5 text-xs font-bold transition-all active:scale-95"
            :class="
              order.status === 'pending'
                ? 'bg-blush-500 text-white shadow-soft hover:bg-blush-600'
                : 'bg-cream text-cocoa-500 hover:bg-blush-100 hover:text-blush-600'
            "
            @click="toggleOrderStatus(order.id)"
          >
            <span v-if="order.status === 'pending'" class="flex items-center gap-1">
              <PhCheckCircle :size="12" weight="bold" /> 做好啦,标记完成
            </span>
            <span v-else>撤回为待开饭</span>
          </button>
        </div>
      </article>
    </div>

    <div v-else class="mt-10 rounded-3xl bg-white p-10 text-center shadow-soft">
      <div class="text-5xl">🍽️</div>
      <p class="mt-3 font-bold text-cocoa-700">还没有订单</p>
      <p class="mt-1 text-sm text-cocoa-500">快去点第一单美味吧</p>
    </div>
  </div>
</template>
