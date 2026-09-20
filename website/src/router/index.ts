import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/contributing',
      name: 'contributing',
      component: () => import('../views/Contribute.vue'),
    },
    {
      path: '/installation',
      name: 'installation',
      component: () => import('../views/Installation.vue'),
    },

    // NUMBER
    {
      path: '/number',
      name: 'number',
      component: () => import('../views/number/index.vue'),
    },
    {
      path: '/number/clamp',
      name: 'number-clamp',
      component: () => import('../views/number/clamp.vue'),
    },
    {
      path: '/number/lttb',
      name: 'number-lttb',
      component: () => import('../views/number/lttb.vue'),
    },
    {
      path: '/number/nice-number',
      name: 'number-nice-number',
      component: () => import('../views/number/nice-number.vue'),
    },
    {
      path: '/number/numbers-from-seed',
      name: 'number-numbers-from-seed',
      component: () => import('../views/number/numbers-from-seed.vue'),
    },
  ],
})

export default router
