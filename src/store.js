import { reactive, watch, computed } from 'vue'

const STORAGE_KEY = 'baobao-canteen-v1'

const seedCategories = [
  { id: 'c1', name: '招牌硬菜', emoji: '🍖' },
  { id: 'c2', name: '主食碳水', emoji: '🍜' },
  { id: 'c3', name: '甜品饮品', emoji: '🍰' },
  { id: 'c4', name: '夜宵小食', emoji: '🌙' },
]

const seedDishes = [
  { id: 'd1', categoryId: 'c1', name: '红烧小牛腩', emoji: '🍲', desc: '慢炖两小时,入口即化,拌饭一绝', price: 28, sold: 6 },
  { id: 'd2', categoryId: 'c1', name: '可乐鸡翅', emoji: '🍗', desc: '甜甜的酱汁,宝宝的专属快乐', price: 22, sold: 9 },
  { id: 'd3', categoryId: 'c1', name: '油焖大虾', emoji: '🦐', desc: '虾线都帮你挑好,只管张嘴', price: 32, sold: 3 },
  { id: 'd4', categoryId: 'c2', name: '红烧牛肉面', emoji: '🍜', desc: '汤浓肉烂,连汤都不许剩', price: 16, sold: 12 },
  { id: 'd5', categoryId: 'c2', name: '黄金蛋炒饭', emoji: '🍚', desc: '粒粒分明,藏着小葱花的香气', price: 12, sold: 8 },
  { id: 'd6', categoryId: 'c2', name: '软软小馄饨', emoji: '🥟', desc: '皮薄馅嫩,一口一个刚刚好', price: 14, sold: 7 },
  { id: 'd7', categoryId: 'c3', name: '草莓小方', emoji: '🍰', desc: '当季草莓配上轻盈的奶油', price: 15, sold: 5 },
  { id: 'd8', categoryId: 'c3', name: '芒果布丁', emoji: '🍮', desc: '滑嫩 Q 弹,甜甜的心意', price: 10, sold: 4 },
  { id: 'd9', categoryId: 'c3', name: '热乎乎奶茶', emoji: '🧋', desc: '三分糖,珍珠煮得刚刚好', price: 9, sold: 10 },
  { id: 'd10', categoryId: 'c4', name: '香香小薯条', emoji: '🍟', desc: '炸得金黄,蘸番茄酱最配', price: 8, sold: 11 },
  { id: 'd11', categoryId: 'c4', name: '蜂蜜小华夫', emoji: '🧇', desc: '刚出炉的华夫,淋一点点蜂蜜', price: 12, sold: 2 },
]

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data && Array.isArray(data.categories) && Array.isArray(data.dishes) && Array.isArray(data.orders)) {
      return data
    }
  } catch {
    // 数据损坏时退回种子数据
  }
  return null
}

const saved = loadState()

export const store = reactive({
  categories: saved?.categories ?? seedCategories,
  dishes: saved?.dishes ?? seedDishes,
  orders: saved?.orders ?? [],
  cart: saved?.cart ?? [],
  lastOrderId: saved?.lastOrderId ?? null,
})

watch(
  store,
  (s) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        categories: s.categories,
        dishes: s.dishes,
        orders: s.orders,
        cart: s.cart,
        lastOrderId: s.lastOrderId,
      }),
    )
  },
  { deep: true },
)

let uid = 0
function genId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${(uid++).toString(36)}`
}

export function fmtTime(ts) {
  const d = new Date(ts)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getMonth() + 1}月${d.getDate()}日 ${p(d.getHours())}:${p(d.getMinutes())}`
}

/* ---------- 购物车 ---------- */

export function addToCart(dishId) {
  const line = store.cart.find((l) => l.dishId === dishId)
  if (line) line.qty += 1
  else store.cart.push({ dishId, qty: 1 })
}

export function setCartQty(dishId, qty) {
  const line = store.cart.find((l) => l.dishId === dishId)
  if (!line) return
  if (qty <= 0) store.cart = store.cart.filter((l) => l.dishId !== dishId)
  else line.qty = qty
}

export function clearCart() {
  store.cart = []
}

export function cartQtyOf(dishId) {
  return store.cart.find((l) => l.dishId === dishId)?.qty ?? 0
}

export const cartLines = computed(() =>
  store.cart
    .map((l) => {
      const dish = store.dishes.find((d) => d.id === l.dishId)
      return dish ? { ...dish, qty: l.qty, subtotal: dish.price * l.qty } : null
    })
    .filter(Boolean),
)

export const cartTotal = computed(() => cartLines.value.reduce((sum, l) => sum + l.subtotal, 0))

export const cartCount = computed(() => cartLines.value.reduce((sum, l) => sum + l.qty, 0))

/* ---------- 订单 ---------- */

export function placeOrder() {
  const lines = cartLines.value
  if (!lines.length) return null
  const order = {
    id: genId('o'),
    createdAt: Date.now(),
    status: 'pending',
    items: lines.map((l) => ({ dishId: l.id, name: l.name, emoji: l.emoji, price: l.price, qty: l.qty })),
    total: cartTotal.value,
  }
  store.orders.unshift(order)
  for (const line of lines) {
    const dish = store.dishes.find((d) => d.id === line.id)
    if (dish) dish.sold += line.qty
  }
  store.lastOrderId = order.id
  store.cart = []
  return order
}

export function getOrder(id) {
  return store.orders.find((o) => o.id === id)
}

export function toggleOrderStatus(id) {
  const order = getOrder(id)
  if (order) order.status = order.status === 'pending' ? 'done' : 'pending'
}

export const pendingOrderCount = computed(() => store.orders.filter((o) => o.status === 'pending').length)

/* ---------- 改菜单 ---------- */

export function addCategory(name, emoji) {
  store.categories.push({ id: genId('c'), name, emoji })
}

export function updateCategory(id, patch) {
  const cat = store.categories.find((c) => c.id === id)
  if (cat) Object.assign(cat, patch)
}

export function removeCategory(id) {
  store.categories = store.categories.filter((c) => c.id !== id)
  store.dishes = store.dishes.filter((d) => d.categoryId !== id)
}

export function dishCountOf(categoryId) {
  return store.dishes.filter((d) => d.categoryId === categoryId).length
}

export function dishesOf(categoryId) {
  return store.dishes.filter((d) => d.categoryId === categoryId)
}

export function addDish({ categoryId, name, emoji, desc, price }) {
  store.dishes.push({ id: genId('d'), categoryId, name, emoji, desc, price, sold: 0 })
}

export function updateDish(id, patch) {
  const dish = store.dishes.find((d) => d.id === id)
  if (dish) Object.assign(dish, patch)
}

export function removeDish(id) {
  store.dishes = store.dishes.filter((d) => d.id !== id)
  store.cart = store.cart.filter((l) => l.dishId !== id)
}

export const FOOD_EMOJIS = [
  '🍲', '🍗', '🦐', '🍜', '🍚', '🥟', '🍰', '🍮', '🧋', '🍟', '🧇', '🍣',
  '🍝', '🍕', '🥘', '🍳', '🥞', '🌮', '🍓', '🍉', '🍩', '🧁', '🍦', '🥗',
]

export const CATEGORY_EMOJIS = ['🍖', '🍜', '🍰', '🌙', '🥬', '🦞', '🍱', '🥣', '☕', '🍺', '🌸', '⭐']
