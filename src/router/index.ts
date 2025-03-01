import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import RepairRatingView from '../views/RepairRatingView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/repair/new',
      name: 'new-repair',
      component: () => import('../views/NewRepairView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/repair/:id',
      name: 'repair-detail',
      component: () => import('../views/RepairDetailView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: false, requiresAdmin: false }
    },
    {
      path: '/equipment',
      name: 'equipment',
      component: () => import('../views/EquipmentView.vue'),
      meta: { requiresAuth: false, requiresAdmin: false }
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: () => import('../views/StatisticsView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('../views/NotificationsView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/knowledge',
      name: 'knowledge',
      component: () => import('../views/KnowledgeBaseView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/ratings',
      name: 'repair-ratings',
      component: RepairRatingView,
      meta: { requiresAuth: false }
    },
    {
      path: '/maintainer/orders',
      name: 'maintainer-orders',
      component: () => import('../views/maintainer/OrdersView.vue'),
      meta: { requiresAuth: false, requiresMaintainer: false }
    },
    {
      path: '/maintainer/my-orders',
      name: 'maintainer-my-orders',
      component: () => import('../views/maintainer/MyOrdersView.vue'),
      meta: { requiresAuth: false, requiresMaintainer: false }
    },
    {
      path: '/maintainer/notifications',
      name: 'maintainer-notifications',
      component: () => import('../views/maintainer/NotificationsView.vue'),
      meta: { requiresAuth: false, requiresMaintainer: false }
    },
    {
      path: '/maintainer/statistics',
      name: 'maintainer-statistics',
      component: () => import('../views/maintainer/StatisticsView.vue'),
      meta: { requiresAuth: false, requiresMaintainer: false }
    }
  ]
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.token) {
    next('/login');
  } else if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    next('/');
  } else if (to.meta.requiresMaintainer && authStore.user?.role !== 'maintainer') {
    next('/');
  } else {
    next();
  }
});

export default router;