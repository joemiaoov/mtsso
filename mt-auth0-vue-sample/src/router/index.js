import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ProfileView from '../views/ProfileView.vue';
import TenantConfigTreeView from '../views/TenantConfigTreeView.vue';
import TenantConfigListView from '../views/TenantConfigListView.vue';
import NotFoundView from '../views/NotFoundView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/tenant-config-tree',
      name: 'tenant-config-tree',
      component: TenantConfigTreeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/tenant-config-list',
      name: 'tenant-config-list',
      component: TenantConfigListView,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
});

export default router;
