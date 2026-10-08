<script setup>
import { reactive, ref } from 'vue'
import { PhPencilSimple, PhPlus, PhTrashSimple } from '@phosphor-icons/vue'
import Modal from '@/components/Modal.vue'
import {
  store,
  dishesOf,
  dishCountOf,
  addCategory,
  updateCategory,
  removeCategory,
  addDish,
  updateDish,
  removeDish,
  FOOD_EMOJIS,
  CATEGORY_EMOJIS,
} from '@/store'

const tab = ref('dishes') // 'dishes' | 'categories'

/* ----- 菜品表单 ----- */
const dishModal = ref(false)
const editingDishId = ref(null)
const dishForm = reactive({ categoryId: '', name: '', emoji: '', desc: '', price: null })
const dishError = ref('')

function openDishModal(dish = null) {
  editingDishId.value = dish?.id ?? null
  Object.assign(dishForm, {
    categoryId: dish?.categoryId ?? store.categories[0]?.id ?? '',
    name: dish?.name ?? '',
    emoji: dish?.emoji ?? '',
    desc: dish?.desc ?? '',
    price: dish?.price ?? null,
  })
  dishError.value = ''
  dishModal.value = true
}

function saveDish() {
  if (!dishForm.name.trim()) {
    dishError.value = '给菜起个名字吧'
    return
  }
  if (!dishForm.emoji.trim()) {
    dishError.value = '选一个好看的图标呀'
    return
  }
  if (!Number.isFinite(dishForm.price) || dishForm.price <= 0) {
    dishError.value = '价格要大于 0 哦'
    return
  }
  const patch = {
    categoryId: dishForm.categoryId,
    name: dishForm.name.trim(),
    emoji: dishForm.emoji.trim(),
    desc: dishForm.desc.trim() || '老板还没写介绍',
    price: Math.round(dishForm.price),
  }
  if (editingDishId.value) updateDish(editingDishId.value, patch)
  else addDish(patch)
  dishModal.value = false
}

/* ----- 分类表单 ----- */
const catModal = ref(false)
const editingCatId = ref(null)
const catForm = reactive({ name: '', emoji: '' })
const catError = ref('')

function openCatModal(cat = null) {
  editingCatId.value = cat?.id ?? null
  Object.assign(catForm, { name: cat?.name ?? '', emoji: cat?.emoji ?? '' })
  catError.value = ''
  catModal.value = true
}

function saveCat() {
  if (!catForm.name.trim()) {
    catError.value = '分类要有名字呀'
    return
  }
  if (!catForm.emoji.trim()) {
    catError.value = '选一个图标吧'
    return
  }
  const patch = { name: catForm.name.trim(), emoji: catForm.emoji.trim() }
  if (editingCatId.value) updateCategory(editingCatId.value, patch)
  else addCategory(patch.name, patch.emoji)
  catModal.value = false
}

/* ----- 删除确认 ----- */
const confirmState = ref(null) // { kind: 'dish'|'category', id, name, extra }

function askRemoveDish(dish) {
  confirmState.value = { kind: 'dish', id: dish.id, name: dish.name, extra: '' }
}

function askRemoveCat(cat) {
  confirmState.value = {
    kind: 'category',
    id: cat.id,
    name: cat.name,
    extra: `「${cat.name}」下的 ${dishCountOf(cat.id)} 道菜也会一起删除`,
  }
}

function doRemove() {
  const c = confirmState.value
  if (!c) return
  if (c.kind === 'dish') removeDish(c.id)
  else removeCategory(c.id)
  confirmState.value = null
}
</script>

<template>
  <div>
    <!-- 页内切换 -->
    <div class="flex items-center justify-between gap-2">
      <div class="flex gap-1 rounded-full bg-white p-1 shadow-soft">
        <button
          class="rounded-full px-4 py-1.5 text-sm font-bold transition-colors"
          :class="tab === 'dishes' ? 'bg-blush-500 text-white' : 'text-cocoa-500 hover:text-blush-600'"
          @click="tab = 'dishes'"
        >
          🍳 菜品管理
        </button>
        <button
          class="rounded-full px-4 py-1.5 text-sm font-bold transition-colors"
          :class="tab === 'categories' ? 'bg-blush-500 text-white' : 'text-cocoa-500 hover:text-blush-600'"
          @click="tab = 'categories'"
        >
          🗂️ 分类管理
        </button>
      </div>
      <button
        class="flex items-center gap-1 rounded-full bg-blush-500 px-4 py-2 text-sm font-bold text-white shadow-soft transition-all hover:bg-blush-600 active:scale-95"
        @click="tab === 'dishes' ? openDishModal() : openCatModal()"
      >
        <PhPlus :size="14" weight="bold" />
        {{ tab === 'dishes' ? '新增菜品' : '新增分类' }}
      </button>
    </div>

    <!-- 菜品管理 -->
    <div v-if="tab === 'dishes'" class="mt-4 space-y-6">
      <section v-for="cat in store.categories" :key="cat.id">
        <h3 class="mb-2 flex items-center gap-1.5 text-sm font-black text-cocoa-700">
          <span class="text-base">{{ cat.emoji }}</span>
          {{ cat.name }}
          <span class="rounded-full bg-blush-100 px-2 py-0.5 text-[10px] font-bold text-blush-600">
            {{ dishesOf(cat.id).length }} 道菜
          </span>
        </h3>
        <div v-if="dishesOf(cat.id).length" class="space-y-2">
          <div
            v-for="dish in dishesOf(cat.id)"
            :key="dish.id"
            class="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft"
          >
            <span class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cream text-2xl">
              {{ dish.emoji }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-bold text-cocoa-900">{{ dish.name }}</p>
              <p class="truncate text-xs text-cocoa-300">{{ dish.desc }}</p>
            </div>
            <div class="shrink-0 text-right">
              <p class="text-sm font-black text-blush-600">{{ dish.price }} mk</p>
              <p class="text-[10px] text-cocoa-300">已售 {{ dish.sold }} 份</p>
            </div>
            <button
              class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cream text-cocoa-500 transition-colors hover:bg-blush-100 hover:text-blush-600"
              aria-label="编辑菜品"
              @click="openDishModal(dish)"
            >
              <PhPencilSimple :size="14" weight="bold" />
            </button>
            <button
              class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cream text-cocoa-500 transition-colors hover:bg-blush-100 hover:text-blush-600"
              aria-label="删除菜品"
              @click="askRemoveDish(dish)"
            >
              <PhTrashSimple :size="14" weight="bold" />
            </button>
          </div>
        </div>
        <p v-else class="rounded-2xl border border-dashed border-blush-200 bg-white/60 p-4 text-center text-xs text-cocoa-300">
          这个分类还没有菜
        </p>
      </section>
    </div>

    <!-- 分类管理 -->
    <div v-else class="mt-4 space-y-2">
      <div
        v-for="cat in store.categories"
        :key="cat.id"
        class="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft"
      >
        <span class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cream text-2xl">{{ cat.emoji }}</span>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold text-cocoa-900">{{ cat.name }}</p>
          <p class="text-xs text-cocoa-300">{{ dishCountOf(cat.id) }} 道菜</p>
        </div>
        <button
          class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cream text-cocoa-500 transition-colors hover:bg-blush-100 hover:text-blush-600"
          aria-label="编辑分类"
          @click="openCatModal(cat)"
        >
          <PhPencilSimple :size="14" weight="bold" />
        </button>
        <button
          class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cream text-cocoa-500 transition-colors hover:bg-blush-100 hover:text-blush-600"
          aria-label="删除分类"
          @click="askRemoveCat(cat)"
        >
          <PhTrashSimple :size="14" weight="bold" />
        </button>
      </div>
    </div>

    <!-- 菜品表单弹窗 -->
    <Modal :open="dishModal" :title="editingDishId ? '编辑菜品' : '新增菜品'" @close="dishModal = false">
      <form class="space-y-4" @submit.prevent="saveDish">
        <div>
          <label class="mb-1 block text-xs font-bold text-cocoa-500">分类</label>
          <select v-model="dishForm.categoryId" class="w-full rounded-2xl bg-cream px-3 py-2.5 text-sm font-bold text-cocoa-900 outline-none focus:ring-2 focus:ring-blush-400">
            <option v-for="cat in store.categories" :key="cat.id" :value="cat.id">{{ cat.emoji }} {{ cat.name }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold text-cocoa-500">菜品图标</label>
          <div class="mb-2 flex flex-wrap gap-1.5">
            <button
              v-for="e in FOOD_EMOJIS"
              :key="e"
              type="button"
              class="grid h-9 w-9 place-items-center rounded-xl text-xl transition-transform hover:scale-110"
              :class="dishForm.emoji === e ? 'bg-blush-100 ring-2 ring-blush-400' : 'bg-cream'"
              @click="dishForm.emoji = e"
            >
              {{ e }}
            </button>
          </div>
          <input
            v-model="dishForm.emoji"
            maxlength="4"
            placeholder="也可以自己输入一个"
            class="w-full rounded-2xl bg-cream px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blush-400"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold text-cocoa-500">菜名</label>
          <input
            v-model="dishForm.name"
            maxlength="20"
            placeholder="比如:红烧小牛腩"
            class="w-full rounded-2xl bg-cream px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blush-400"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold text-cocoa-500">描述</label>
          <textarea
            v-model="dishForm.desc"
            rows="2"
            maxlength="60"
            placeholder="写一句让人流口水的介绍"
            class="w-full resize-none rounded-2xl bg-cream px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blush-400"
          ></textarea>
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold text-cocoa-500">价格(mk)</label>
          <input
            v-model.number="dishForm.price"
            type="number"
            min="1"
            step="1"
            placeholder="12"
            class="w-full rounded-2xl bg-cream px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blush-400"
          />
        </div>
        <p v-if="dishError" class="text-xs font-bold text-blush-600">{{ dishError }}</p>
        <button
          type="submit"
          class="w-full rounded-full bg-blush-500 py-3 font-bold text-white shadow-soft transition-all hover:bg-blush-600 active:scale-[0.98]"
        >
          {{ editingDishId ? '保存修改' : '加入菜单' }}
        </button>
      </form>
    </Modal>

    <!-- 分类表单弹窗 -->
    <Modal :open="catModal" :title="editingCatId ? '编辑分类' : '新增分类'" @close="catModal = false">
      <form class="space-y-4" @submit.prevent="saveCat">
        <div>
          <label class="mb-1 block text-xs font-bold text-cocoa-500">分类图标</label>
          <div class="mb-2 flex flex-wrap gap-1.5">
            <button
              v-for="e in CATEGORY_EMOJIS"
              :key="e"
              type="button"
              class="grid h-9 w-9 place-items-center rounded-xl text-xl transition-transform hover:scale-110"
              :class="catForm.emoji === e ? 'bg-blush-100 ring-2 ring-blush-400' : 'bg-cream'"
              @click="catForm.emoji = e"
            >
              {{ e }}
            </button>
          </div>
          <input
            v-model="catForm.emoji"
            maxlength="4"
            placeholder="也可以自己输入一个"
            class="w-full rounded-2xl bg-cream px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blush-400"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold text-cocoa-500">分类名称</label>
          <input
            v-model="catForm.name"
            maxlength="10"
            placeholder="比如:招牌硬菜"
            class="w-full rounded-2xl bg-cream px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blush-400"
          />
        </div>
        <p v-if="catError" class="text-xs font-bold text-blush-600">{{ catError }}</p>
        <button
          type="submit"
          class="w-full rounded-full bg-blush-500 py-3 font-bold text-white shadow-soft transition-all hover:bg-blush-600 active:scale-[0.98]"
        >
          {{ editingCatId ? '保存修改' : '创建分类' }}
        </button>
      </form>
    </Modal>

    <!-- 删除确认弹窗 -->
    <Modal :open="!!confirmState" title="确认删除" @close="confirmState = null">
      <div class="text-center">
        <div class="text-4xl">🗑️</div>
        <p class="mt-2 text-sm font-bold text-cocoa-900">确定要删除「{{ confirmState?.name }}」吗?</p>
        <p v-if="confirmState?.extra" class="mt-1 text-xs text-cocoa-500">{{ confirmState.extra }}</p>
        <div class="mt-5 flex gap-2">
          <button
            class="flex-1 rounded-full bg-cream py-2.5 text-sm font-bold text-cocoa-500 transition-colors hover:bg-blush-100"
            @click="confirmState = null"
          >
            再想想
          </button>
          <button
            class="flex-1 rounded-full bg-blush-500 py-2.5 text-sm font-bold text-white shadow-soft transition-all hover:bg-blush-600 active:scale-95"
            @click="doRemove"
          >
            删掉吧
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>
