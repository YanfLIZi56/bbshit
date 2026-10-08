import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', name: 'order', component: () => import('@/views/OrderView.vue') },
    { path: '/manage', name: 'manage', component: () => import('@/views/ManageView.vue') },
    { path: '/orders', name: 'orders', component: () => import('@/views/OrdersView.vue') },
    { path: '/success', name: 'success', component: () => import('@/views/SuccessView.vue') },
  ],
})

export default router
