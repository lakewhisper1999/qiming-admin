import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('../views/layout/AdminLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' }
      },
      {
        path: 'artwork',
        name: 'ArtworkList',
        component: () => import('../views/artwork/ArtworkList.vue'),
        meta: { title: '作品管理', icon: 'Picture' }
      },
      {
        path: 'comment',
        name: 'CommentList',
        component: () => import('../views/comment/CommentList.vue'),
        meta: { title: '提问管理', icon: 'ChatDotRound' }
      },
      {
        path: 'article',
        name: 'ArticleList',
        component: () => import('../views/article/ArticleList.vue'),
        meta: { title: '图文笔记', icon: 'Document' }
      },
      {
        path: 'category',
        name: 'CategoryList',
        component: () => import('../views/category/CategoryList.vue'),
        meta: { title: '分类管理', icon: 'Grid' }
      },
      {
        path: 'user',
        name: 'UserList',
        component: () => import('../views/user/UserList.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/user/Profile.vue'),
        meta: { title: '个人中心', icon: 'UserFilled' }
      },
      {
        path: 'log/visit',
        name: 'VisitLog',
        component: () => import('../views/log/VisitLog.vue'),
        meta: { title: '访客日志', icon: 'DataAnalysis' }
      },
      {
        path: 'log/operation',
        name: 'OperationLog',
        component: () => import('../views/log/OperationLog.vue'),
        meta: { title: '操作日志', icon: 'List' }
      },
      {
        path: 'settings',
        name: 'SiteConfig',
        component: () => import('../views/settings/SiteConfig.vue'),
        meta: { title: '站点设置', icon: 'Setting' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫：未登录跳转登录页
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
