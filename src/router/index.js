// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: { titleKey: 'auth.login', requiresAuth: false }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('../components/layout/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/Dashboard.vue'),
        meta: { titleKey: 'nav.dashboard', icon: 'dashboard' }
      },
      // ===== 组织管理 =====
      {
        path: '/organization/departments',
        name: 'Departments',
        component: () => import('../views/organization/Departments.vue'),
        meta: { titleKey: 'nav.departments', icon: 'office-building' }
      },
      {
        path: '/organization/positions',
        name: 'Positions',
        component: () => import('../views/organization/Positions.vue'),
        meta: { titleKey: 'nav.positions', icon: 'user' }
      },
      // ===== 培训管理 =====
      {
        path: '/training/courses',
        name: 'Courses',
        component: () => import('../views/training/Courses.vue'),
        meta: { titleKey: 'nav.courses', icon: 'notebook' }
      },
      {
        path: '/training/training-plans',
        name: 'TrainingPlans',
        component: () => import('../views/training/TrainingPlans.vue'),
        meta: { titleKey: 'nav.trainingPlans', icon: 'calendar' }
      },
      {
        path: '/training/training-records',
        name: 'TrainingRecords',
        component: () => import('../views/training/TrainingRecords.vue'),
        meta: { titleKey: 'nav.trainingRecords', icon: 'document' }
      },
      // ===== 考试管理 =====
      {
        path: '/examination/question-banks',
        name: 'QuestionBanks',
        component: () => import('../views/examination/QuestionBanks.vue'),
        meta: { titleKey: 'nav.questionBanks', icon: 'collection' }
      },
      {
        path: '/examination/exams',
        name: 'Exams',
        component: () => import('../views/examination/Exams.vue'),
        meta: { titleKey: 'nav.exams', icon: 'edit' }
      },
      {
        path: '/examination/exam-results',
        name: 'ExamResults',
        component: () => import('../views/examination/ExamResults.vue'),
        meta: { titleKey: 'nav.examResults', icon: 'trophy' }
      },
      // ===== 能力管理 =====
      {
        path: '/competency/competencies',
        name: 'Competencies',
        component: () => import('../views/competency/Competencies.vue'),
        meta: { titleKey: 'nav.competencies', icon: 'star' }
      },
      {
        path: '/competency/assessments',
        name: 'Assessments',
        component: () => import('../views/competency/Assessments.vue'),
        meta: { titleKey: 'nav.assessments', icon: 'check' }
      },
      {
        path: '/competency/certificates',
        name: 'Certificates',
        component: () => import('../views/competency/Certificates.vue'),
        meta: { titleKey: 'nav.certificates', icon: 'document-checked' }
      },
      // ===== 报表管理 =====
      {
        path: '/reporting/reports',
        name: 'Reports',
        component: () => import('../views/reporting/Reports.vue'),
        meta: { titleKey: 'nav.reports', icon: 'document' }
      },
      {
        path: '/reporting/audit-logs',
        name: 'AuditLogs',
        component: () => import('../views/reporting/AuditLogs.vue'),
        meta: { titleKey: 'nav.auditLogs', icon: 'warning' }
      },
      // ===== 系统管理 =====
      {
        path: '/system/users',
        name: 'Users',
        component: () => import('../views/system/Users.vue'),
        meta: { titleKey: 'nav.users', icon: 'user' }
      },
      {
        path: '/system/roles',
        name: 'Roles',
        component: () => import('../views/system/Roles.vue'),
        meta: { titleKey: 'nav.roles', icon: 'user-filled' }
      },
      // ===== 个人中心 =====
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/profile/Profile.vue'),
        meta: { titleKey: 'nav.profile', icon: 'avatar' }
      },
      {
        path: '/my-training',
        name: 'MyTraining',
        component: () => import('../views/profile/MyTraining.vue'),
        meta: { titleKey: 'nav.myTraining', icon: 'reading' }
      },
      {
        path: '/my-exams',
        name: 'MyExams',
        component: () => import('../views/profile/MyExams.vue'),
        meta: { titleKey: 'nav.myExams', icon: 'edit-pen' }
      },
      {
        path: '/my-certificates',
        name: 'MyCertificates',
        component: () => import('../views/profile/MyCertificates.vue'),
        meta: { titleKey: 'nav.myCertificates', icon: 'document-checked' }
      },
      /* ===== 扁平化兼容（不新建文件）===== */
      {
        path: '/users',
        name: 'UsersFlat',
        component: () => import('../views/system/Users.vue'),
        meta: { titleKey: 'nav.users', icon: 'user' }
      },
      {
        path: '/roles',
        name: 'RolesFlat',
        component: () => import('../views/system/Roles.vue'),
        meta: { titleKey: 'nav.roles', icon: 'user-filled' }
      },
      {
        path: '/training/plans',
        name: 'TrainingPlansFlat',
        component: () => import('../views/training/TrainingPlans.vue'),
        meta: { titleKey: 'nav.trainingPlans', icon: 'calendar' }
      },
      {
        path: '/training/records',
        name: 'TrainingRecordsFlat',
        component: () => import('../views/training/TrainingRecords.vue'),
        meta: { titleKey: 'nav.trainingRecords', icon: 'document' }
      },
      {
        path: '/examination/results',
        name: 'ExamResultsFlat',
        component: () => import('../views/examination/ExamResults.vue'),
        meta: { titleKey: 'nav.examResults', icon: 'trophy' }
      }
    ]
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/error/NotFound.vue'), meta: { requiresAuth: false } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/* ========== 关键修复：延迟获取 authStore，避免提前引用 router ========== */
router.beforeEach(async (to, from, next) => {
  NProgress.start()
  // ✅ 动态导入，确保执行时 router 已创建完成
  const { useAuthStore } = await import('../store/auth')
  const authStore = useAuthStore()

  if (to.meta.requiresAuth !== false) {
    if (!authStore.isAuthenticated) {
      await authStore.initializeAuth()
      if (!authStore.isAuthenticated) {
        next('/login')
        return
      }
    }
    if (to.meta.requiredRoles && !authStore.hasRoles(to.meta.requiredRoles)) {
      next('/')
      return
    }
  } else {
    // 已登录却访问登录页，跳回首页
    if (authStore.isAuthenticated && to.path === '/login') {
      next('/')
      return
    }
  }
  next()
})

router.afterEach(() => NProgress.done())

export default router