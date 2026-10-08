<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PhMinus, PhPlus, PhShoppingCart, PhTrashSimple } from '@phosphor-icons/vue'
import {
  store,
  cartLines,
  cartTotal,
  cartCount,
  addToCart,
  setCartQty,
  clearCart,
  placeOrder,
  cartQtyOf,
} from '@/store'

const router = useRouter()

const activeCat = ref(store.categories[0]?.id ?? '')
const cartOpen = ref(false)

const catDishes = computed(() => store.dishes.filter((d) => d.categoryId === activeCat.value))
const activeCatName = computed(() => store.categories.find((c) => c.id === activeCat.value)?.name ?? '')

const tileGrads = [
  'from-[#ffe9d2] to-[#ffd9e5]',
  'from-[#fff3d6] to-[#ffdcc9]',
  'from-[#ffe0e9] to-[#efe3ff]',
  'from-[#ffeed9] to-[#fff3c9]',
]
const grad = (i) => tileGrads[i % tileGrads.length]

function submitOrder() {
  const order = placeOrder()
  if (order) {
    cartOpen.value = false
    router.push('/success')
  }
}
</script>

<template>
  <div>
    <!-- 分类导航 -->
    <div class="sticky top-[68px] z-20 -mx-4 bg-cream/90 px-4 py-2 backdrop-blur">
      <div class="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        <button
          v-for="cat in store.categories"
          :key="cat.id"
          class="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all"
          :class="
            activeCat === cat.id
              ? 'bg-blush-500 text-white shadow-soft'
              : 'bg-white text-cocoa-500 hover:text-blush-600'
          "
          @click="activeCat = cat.id"
        >
          <span class="text-base">{{ cat.emoji }}</span>
          {{ cat.name }}
        </button>
      </div>
    </div>

    <!-- 菜品列表 -->
    <div v-if="catDishes.length" class="mt-2 grid gap-4 sm:grid-cols-2">
      <article
        v-for="(dish, i) in catDishes"
        :key="dish.id"
        class="flex gap-4 rounded-3xl bg-white p-4 shadow-soft transition-transform hover:-translate-y-0.5"
      >
        <div
          class="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-5xl"
          :class="grad(i)"
        >
          {{ dish.emoji }}
        </div>
        <div class="flex min-w-0 flex-1 flex-col">
          <h3 class="truncate font-black text-cocoa-900">{{ dish.name }}</h3>
          <p class="mt-0.5 line-clamp-2 text-xs leading-relaxed text-cocoa-500">{{ dish.desc }}</p>
          <div class="mt-auto flex items-end justify-between pt-2">
            <div>
              <span class="rounded-full bg-peach-100 px-2 py-0.5 text-[10px] font-bold text-peach-500">
                已售 {{ dish.sold }} 份
              </span>
              <div class="mt-1 text-lg font-black text-blush-600">
                {{ dish.price }} <span class="text-xs">mk</span>
              </div>
            </div>
            <button
              v-if="cartQtyOf(dish.id) === 0"
              class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blush-500 text-white shadow-soft transition-transform hover:scale-110 active:scale-95"
              aria-label="加入购物车"
              @click="addToCart(dish.id)"
            >
              <PhPlus :size="18" weight="bold" />
            </button>
            <div v-else class="flex shrink-0 items-center gap-1 rounded-full bg-blush-50 p-1">
              <button
                class="grid h-7 w-7 place-items-center rounded-full bg-white text-blush-600 shadow-soft"
                aria-label="减少一份"
                @click="setCartQty(dish.id, cartQtyOf(dish.id) - 1)"
              >
                <PhMinus :size="12" weight="bold" />
              </button>
              <span :key="cartQtyOf(dish.id)" class="animate-pop w-6 text-center text-sm font-black text-blush-600">
                {{ cartQtyOf(dish.id) }}
              </span>
              <button
                class="grid h-7 w-7 place-items-center rounded-full bg-blush-500 text-white"
                aria-label="增加一份"
                @click="addToCart(dish.id)"
              >
                <PhPlus :size="12" weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="mt-10 rounded-3xl bg-white p-10 text-center shadow-soft">
      <div class="text-5xl">🍳</div>
      <p class="mt-3 font-bold text-cocoa-700">「{{ activeCatName }}」还是空的</p>
      <p class="mt-1 text-sm text-cocoa-500">去「改菜单」加上第一道菜吧</p>
    </div>

    <!-- 购物车 -->
    <div class="fixed inset-x-0 bottom-0 z-40">
      <Transition name="sheet">
        <div v-if="cartOpen" class="mx-auto max-w-3xl px-4">
          <div class="rounded-t-3xl border border-b-0 border-blush-100 bg-white p-4 shadow-lift">
            <div class="mb-2 flex items-center justify-between">
              <h4 class="flex items-center gap-1.5 font-black text-cocoa-900">
                <PhShoppingCart :size="18" weight="fill" class="text-blush-500" />
                购物车 · {{ cartCount }} 件
              </h4>
              <button
                v-if="cartLines.length"
                class="flex items-center gap-1 text-xs font-bold text-cocoa-300 transition-colors hover:text-blush-600"
                @click="clearCart"
              >
                <PhTrashSimple :size="12" /> 清空
              </button>
            </div>
            <div v-if="cartLines.length" class="max-h-56 space-y-1 overflow-y-auto">
              <div v-for="line in cartLines" :key="line.id" class="flex items-center gap-2 rounded-2xl px-1 py-1.5">
                <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cream text-2xl">
                  {{ line.emoji }}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-bold text-cocoa-900">{{ line.name }}</p>
                  <p class="text-xs text-cocoa-300">{{ line.price }} mk × {{ line.qty }}</p>
                </div>
                <div class="flex items-center gap-1 rounded-full bg-blush-50 p-0.5">
                  <button
                    class="grid h-6 w-6 place-items-center rounded-full bg-white text-blush-600 shadow-soft"
                    aria-label="减少一份"
                    @click="setCartQty(line.id, line.qty - 1)"
                  >
                    <PhMinus :size="10" weight="bold" />
                  </button>
                  <span class="w-5 text-center text-xs font-black text-blush-600">{{ line.qty }}</span>
                  <button
                    class="grid h-6 w-6 place-items-center rounded-full bg-blush-500 text-white"
                    aria-label="增加一份"
                    @click="addToCart(line.id)"
                  >
                    <PhPlus :size="10" weight="bold" />
                  </button>
                </div>
              </div>
            </div>
            <p v-else class="py-6 text-center text-sm text-cocoa-300">购物车空空的,先挑点好吃的吧 🍰</p>
            <div class="mt-3 flex items-center justify-between border-t border-dashed border-blush-100 pt-3">
              <span class="text-sm text-cocoa-500">
                合计
                <b class="text-xl font-black text-blush-600">{{ cartTotal }}</b>
                mk
              </span>
              <button
                :disabled="!cartCount"
                class="rounded-full bg-blush-500 px-8 py-2.5 font-bold text-white shadow-soft transition-all hover:bg-blush-600 active:scale-95 disabled:opacity-40"
                @click="submitOrder"
              >
                去下单
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <div class="mx-auto max-w-3xl px-4 pb-4 pt-2">
        <div
          class="flex items-center gap-3 rounded-full border border-blush-100 bg-white px-3 py-2 shadow-lift"
        >
          <button
            class="relative grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors"
            :class="cartOpen ? 'bg-blush-100 text-blush-600' : 'bg-blush-500 text-white'"
            aria-label="展开购物车"
            @click="cartOpen = !cartOpen"
          >
            <PhShoppingCart :size="20" weight="fill" />
            <span
              v-if="cartCount > 0"
              :key="cartCount"
              class="animate-pop absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-peach-500 px-1 text-[10px] font-black text-white"
            >
              {{ cartCount }}
            </span>
          </button>
          <div class="min-w-0 flex-1 pl-1 text-sm text-cocoa-500">
            合计 <b class="text-xl font-black text-blush-600">{{ cartTotal }}</b> mk
          </div>
          <button
            :disabled="!cartCount"
            class="shrink-0 rounded-full bg-blush-500 px-7 py-2.5 font-bold text-white shadow-soft transition-all hover:bg-blush-600 active:scale-95 disabled:opacity-40"
            @click="submitOrder"
          >
            去下单
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
