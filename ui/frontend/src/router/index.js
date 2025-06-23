import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/houses'
    },
    {
      path: '/houses',
      name: 'houses',
      component: () => import('../views/HouseList.vue'),
      meta: { title: '房源列表' }
    },
    {
      path: '/analysis',
      name: 'analysis',
      component: () => import('../views/Analysis.vue'),
      meta: { title: '数据分析' }
    },
    {
      path: '/map',
      name: 'map',
      component: () => import('../views/Map.vue'),
      meta: { title: '地图视图' }
    }
  ]
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} - 房产数据平台`
  next()
})

export default router 