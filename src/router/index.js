import { createRouter, createWebHistory } from 'vue-router';

const routes = [

  {
    path: '/',
    name: 'Landing',
    component: () => import('../views/LandingView.vue')
  },
  {
    path: '/workbench',
    name: 'Workbench',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/scores',
    name: 'Scores',
    component: () => import('../views/ScoreView.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/AboutView.vue')
  },
  {
    path: '/play',
    name: 'Play',
    component: () => import('../views/PlayView.vue')
  },
  {
    path: '/ai-create',
    name: 'AiMusic',
    component: () => import('../views/AiMusicView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
