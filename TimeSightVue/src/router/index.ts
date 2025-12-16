import {createRouter, createWebHistory, type Router} from 'vue-router'
import ListPage from '@/ListPage.vue';
import AuthPage from '@/AuthPage.vue';
import { getUserStore, getUserToken, user} from '@/components/DataAccess.mjs'

const router: Router = createRouter({
  // would be used if the root of the app is not stored at /
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHistory(),
  routes: [
    {path: "/", component: ListPage},
    {path: "/auth", component: AuthPage}
  ],
})

router.beforeEach(async (to) => {
  await getUserStore()
  await getUserToken()

  if (!user.value && to.path !== '/auth') {
    return '/auth'
  } else {
    return '/'
  }
})


export default router
