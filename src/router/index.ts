import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';
import MainLayout from '../layouts/MainLayout.vue';
import Login from '../views/Login.vue';
import Home from '../views/Home.vue';
import Dispatch from '../views/Dispatch.vue';
import DataView from '../views/DataView.vue';
import ClueView from '../views/ClueView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: Home,
          meta: { requiresAuth: true }
        },
        {
          path: 'dispatch',
          name: 'dispatch',
          component: Dispatch,
          meta: { requiresAuth: true }
        },
        {
          path: 'data',
          name: 'data',
          component: DataView,
          meta: { requiresAuth: true }
        },
        {
          path: 'clue',
          name: 'clue',
          component: ClueView,
          meta: { requiresAuth: true }
        }
      ]
    }
  ],
});

// Navigation Guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
