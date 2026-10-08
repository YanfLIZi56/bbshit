<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { getOrder, store } from '@/store'

const router = useRouter()

const order = computed(() => (store.lastOrderId ? getOrder(store.lastOrderId) : null))

if (!order.value) {
  router.replace('/')
}

function backToOrder() {
  router.push('/')
}
</script>

<template>
  <div v-if="order" class="mt-8 flex flex-col items-center rounded-3xl bg-white px-6 py-12 text-center shadow-soft">
    <div
      class="animate-pop grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-[#ffe9d2] to-[#ffd9e5] text-6xl"
    >
      🎉
    </div>
    <h1 class="mt-5 text-2xl font-black text-cocoa-900">下单成功!</h1>
    <p class="mt-1 text-sm text-cocoa-500">宝宝食堂收到订单啦,马上开火 🔥</p>

    <div class="mt-6 w-full max-w-xs rounded-2xl bg-cream p-4">
      <p class="text-xs text-cocoa-500">共 {{ order.items.reduce((n, i) => n + i.qty, 0) }} 件 · 支付</p>
      <p class="mt-1 text-3xl font-black text-blush-600">
        {{ order.total }} <span class="text-base">mk</span>
      </p>
      <div class="mt-3 space-y-1 border-t border-dashed border-blush-200 pt-3 text-left">
        <p v-for="item in order.items" :key="item.dishId" class="flex justify-between text-xs text-cocoa-500">
          <span>{{ item.emoji }} {{ item.name }} × {{ item.qty }}</span>
          <span>{{ item.price * item.qty }} mk</span>
        </p>
      </div>
    </div>

    <button
      class="mt-8 rounded-full bg-blush-500 px-12 py-3 font-bold text-white shadow-soft transition-all hover:bg-blush-600 active:scale-95"
      @click="backToOrder"
    >
      返回点餐
    </button>
  </div>
</template>
