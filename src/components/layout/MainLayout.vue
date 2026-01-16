<template>
  <el-container class="main-layout">
    <el-aside :width="sidebarWidth" class="sidebar">
      <div class="logo">
        <img src="/logo.png" alt="TCMS" v-if="!sidebarCollapsed" />
        <span v-if="!sidebarCollapsed">TCMS Training System</span>
        <el-icon v-else><setting /></el-icon>
      </div>

      <el-scrollbar class="menu-scroll">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          :collapse="sidebarCollapsed"
          :collapse-transition="false"
          @select="handleMenuSelect"
        >
          <template v-for="route in menuRoutes" :key="route.path">
            <el-sub-menu
              v-if="route.children && route.children.length > 0"
              :index="route.path"
            >
              <template #title>
                <el-icon><component :is="route.meta.icon" /></el-icon>
                <span>{{ t(route.meta.titleKey) }}</span>
              </template>
              <el-menu-item
                v-for="child in route.children"
                :key="child.path"
                :index="child.fullPath"
              >
                <el-icon><component :is="child.meta.icon" /></el-icon>
                <span>{{ t(child.meta.titleKey) }}</span>
              </el-menu-item>
            </el-sub-menu>

            <el-menu-item v-else :index="route.path">
              <el-icon><component :is="route.meta.icon" /></el-icon>
              <span>{{ t(route.meta.titleKey) }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-button link @click="toggleSidebar" class="collapse-btn">
            <el-icon><expand v-if="sidebarCollapsed" /><fold v-else /></el-icon>
          </el-button>

          <el-breadcrumb separator="/">
            <el-breadcrumb-item
              v-for="item in breadcrumbs"
              :key="item.path"
              :to="item.path === $route.path ? undefined : { path: item.path }"
            >
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-dropdown @command="handleLanguageChange">
            <el-button link class="language-btn">
              {{ currentLanguage === 'en-US' ? 'EN' : '中文' }}
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="zh-CN">中文</el-dropdown-item>
                <el-dropdown-item command="en-US">English</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-button link @click="toggleFullscreen">
            <el-icon><full-screen /></el-icon>
          </el-button>

          <el-dropdown @command="handleUserCommand">
            <el-avatar :size="32" :src="userAvatar" class="user-avatar">
              <el-icon><user /></el-icon>
            </el-avatar>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><avatar /></el-icon>
                  {{ t('nav.profile') }}
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><setting /></el-icon>
                  {{ t('nav.settings') }}
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><switch-button /></el-icon>
                  {{ t('auth.logout') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>

      <el-footer class="footer">
        <span>&copy; 2024 TCMS Training & Competency Management System</span>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useAppStore } from '@/store/app'
import { useI18n } from 'vue-i18n'
import { useI18nLocale } from '@/composables/useI18nLocale'
import screenfull from 'screenfull'

import {
  Expand as ExpandIcon,
  Fold as FoldIcon,
  Setting as SettingIcon,
  FullScreen as FullScreenIcon,
  User as UserIcon,
  Avatar as AvatarIcon,
  SwitchButton as SwitchButtonIcon,
  Monitor as MonitorIcon,
  OfficeBuilding as OfficeBuildingIcon,
  Notebook as NotebookIcon,
  Document as DocumentIcon,
  Calendar as CalendarIcon,
  Edit as EditIcon,
  Collection as CollectionIcon,
  Trophy as TrophyIcon,
  Medal as MedalIcon,
  Star as StarIcon,
  Check as CheckIcon,
  DocumentChecked as DocumentCheckedIcon,
  DataAnalysis as DataAnalysisIcon,
  Warning as WarningIcon
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()
const { t } = useI18n()
const { changeLanguage } = useI18nLocale()

const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)
const sidebarWidth = computed(() => (sidebarCollapsed.value ? '64px' : '250px'))
const userAvatar = computed(() => authStore.user?.avatar || '')
const currentLanguage = computed(() => appStore.language)

// 计算当前激活的菜单项
const activeMenu = computed(() => {
  const { path } = route
  // 如果是嵌套路由，返回父级路径
  if (path.startsWith('/organization/')) {
    return '/organization'
  }
  if (path.startsWith('/training/')) {
    return '/training'
  }
  if (path.startsWith('/examination/')) {
    return '/examination'
  }
  if (path.startsWith('/competency/')) {
    return '/competency'
  }
  if (path.startsWith('/reporting/')) {
    return '/reporting'
  }
  return path
})

// 构建菜单路由，包含完整路径
const menuRoutes = computed(() => {
  const routes = [
    { 
      path: '/dashboard', 
      name: 'Dashboard', 
      meta: { icon: MonitorIcon, titleKey: 'nav.dashboard' } 
    },
    {
      path: '/organization',
      name: 'Organization',
      meta: { icon: OfficeBuildingIcon, titleKey: 'nav.organization' },
      children: [
        { 
          path: '/organization/departments', 
          fullPath: '/organization/departments',
          name: 'Departments', 
          meta: { icon: OfficeBuildingIcon, titleKey: 'nav.departments' } 
        },
        { 
          path: '/organization/positions', 
          fullPath: '/organization/positions',
          name: 'Positions', 
          meta: { icon: AvatarIcon, titleKey: 'nav.positions' } 
        }
      ]
    },
    {
      path: '/training',
      name: 'Training',
      meta: { icon: NotebookIcon, titleKey: 'nav.training' },
      children: [
        { 
          path: '/training/courses', 
          fullPath: '/training/courses',
          name: 'Courses', 
          meta: { icon: DocumentIcon, titleKey: 'nav.courses' } 
        },
        { 
          path: '/training/plans', 
          fullPath: '/training/plans',
          name: 'TrainingPlans', 
          meta: { icon: CalendarIcon, titleKey: 'nav.trainingPlans' } 
        },
        { 
          path: '/training/records', 
          fullPath: '/training/records',
          name: 'TrainingRecords', 
          meta: { icon: DocumentIcon, titleKey: 'nav.trainingRecords' } 
        }
      ]
    },
    {
      path: '/examination',
      name: 'Examination',
      meta: { icon: EditIcon, titleKey: 'nav.examination' },
      children: [
        { 
          path: '/examination/question-banks', 
          fullPath: '/examination/question-banks',
          name: 'QuestionBanks', 
          meta: { icon: CollectionIcon, titleKey: 'nav.questionBanks' } 
        },
        { 
          path: '/examination/exams', 
          fullPath: '/examination/exams',
          name: 'Exams', 
          meta: { icon: EditIcon, titleKey: 'nav.exams' } 
        },
        { 
          path: '/examination/results', 
          fullPath: '/examination/results',
          name: 'ExamResults', 
          meta: { icon: TrophyIcon, titleKey: 'nav.examResults' } 
        }
      ]
    },
    {
      path: '/competency',
      name: 'Competency',
      meta: { icon: MedalIcon, titleKey: 'nav.competency' },
      children: [
        { 
          path: '/competency/competencies', 
          fullPath: '/competency/competencies',
          name: 'Competencies', 
          meta: { icon: StarIcon, titleKey: 'nav.competencies' } 
        },
        { 
          path: '/competency/assessments', 
          fullPath: '/competency/assessments',
          name: 'Assessments', 
          meta: { icon: CheckIcon, titleKey: 'nav.assessments' } 
        },
        { 
          path: '/competency/certificates', 
          fullPath: '/competency/certificates',
          name: 'Certificates', 
          meta: { icon: DocumentCheckedIcon, titleKey: 'nav.certificates' } 
        }
      ]
    },
    {
      path: '/reporting',
      name: 'Reporting',
      meta: { icon: DataAnalysisIcon, titleKey: 'nav.reporting' },
      children: [
        { 
          path: '/reporting/reports', 
          fullPath: '/reporting/reports',
          name: 'Reports', 
          meta: { icon: DocumentIcon, titleKey: 'nav.reports' } 
        },
        { 
          path: '/reporting/audit-logs', 
          fullPath: '/reporting/audit-logs',
          name: 'AuditLogs', 
          meta: { icon: WarningIcon, titleKey: 'nav.auditLogs' } 
        }
      ]
    },
    { 
      path: '/users', 
      name: 'Users', 
      meta: { icon: UserIcon, titleKey: 'nav.users' } 
    },
    { 
      path: '/roles', 
      name: 'Roles', 
      meta: { icon: AvatarIcon, titleKey: 'nav.roles' } 
    }
  ]
  
  return routes
})

const breadcrumbs = ref([])

// 映射路由路径到面包屑标题
const getBreadcrumbTitle = (path) => {
  // 首页特殊处理
  if (path === '/dashboard') return t('nav.dashboard')
  
  // 组织管理
  if (path === '/organization') return t('nav.organization')
  if (path === '/organization/departments') return t('nav.departments')
  if (path === '/organization/positions') return t('nav.positions')
  
  // 培训管理
  if (path === '/training') return t('nav.training')
  if (path === '/training/courses') return t('nav.courses')
  if (path === '/training/plans') return t('nav.trainingPlans')
  if (path === '/training/records') return t('nav.trainingRecords')
  
  // 考试管理
  if (path === '/examination') return t('nav.examination')
  if (path === '/examination/question-banks') return t('nav.questionBanks')
  if (path === '/examination/exams') return t('nav.exams')
  if (path === '/examination/results') return t('nav.examResults')
  
  // 能力管理
  if (path === '/competency') return t('nav.competency')
  if (path === '/competency/competencies') return t('nav.competencies')
  if (path === '/competency/assessments') return t('nav.assessments')
  if (path === '/competency/certificates') return t('nav.certificates')
  
  // 报表管理
  if (path === '/reporting') return t('nav.reporting')
  if (path === '/reporting/reports') return t('nav.reports')
  if (path === '/reporting/audit-logs') return t('nav.auditLogs')
  
  // 系统管理
  if (path === '/users') return t('nav.users')
  if (path === '/roles') return t('nav.roles')
  
  // 个人中心
  if (path === '/profile') return t('nav.profile')
  if (path === '/my-training') return t('nav.myTraining')
  if (path === '/my-exams') return t('nav.myExams')
  if (path === '/my-certificates') return t('nav.myCertificates')
  
  // 默认返回路径的最后一部分
  const parts = path.split('/').filter(p => p)
  return parts.length > 0 ? parts[parts.length - 1] : t('nav.unknown')
}

// 根据当前路径生成面包屑
const generateBreadcrumbs = () => {
  const { path } = route
  
  // 清空面包屑
  breadcrumbs.value = []
  
  // 首页特殊处理
  if (path === '/dashboard') {
    breadcrumbs.value.push({
      path: '/dashboard',
      title: t('nav.dashboard')
    })
    return
  }
  
  // 组织管理
  if (path.startsWith('/organization')) {
    // 父级：Organization
    breadcrumbs.value.push({
      path: '/organization',
      title: t('nav.organization')
    })
    
    // 子级
    if (path === '/organization/departments') {
      breadcrumbs.value.push({
        path: '/organization/departments',
        title: t('nav.departments')
      })
    } else if (path === '/organization/positions') {
      breadcrumbs.value.push({
        path: '/organization/positions',
        title: t('nav.positions')
      })
    }
    return
  }
  
  // 培训管理
  if (path.startsWith('/training')) {
    // 父级：Training
    breadcrumbs.value.push({
      path: '/training',
      title: t('nav.training')
    })
    
    // 子级
    if (path === '/training/courses') {
      breadcrumbs.value.push({
        path: '/training/courses',
        title: t('nav.courses')
      })
    } else if (path === '/training/plans') {
      breadcrumbs.value.push({
        path: '/training/plans',
        title: t('nav.trainingPlans')
      })
    } else if (path === '/training/records') {
      breadcrumbs.value.push({
        path: '/training/records',
        title: t('nav.trainingRecords')
      })
    }
    return
  }
  
  // 考试管理
  if (path.startsWith('/examination')) {
    // 父级：Examination
    breadcrumbs.value.push({
      path: '/examination',
      title: t('nav.examination')
    })
    
    // 子级
    if (path === '/examination/question-banks') {
      breadcrumbs.value.push({
        path: '/examination/question-banks',
        title: t('nav.questionBanks')
      })
    } else if (path === '/examination/exams') {
      breadcrumbs.value.push({
        path: '/examination/exams',
        title: t('nav.exams')
      })
    } else if (path === '/examination/results') {
      breadcrumbs.value.push({
        path: '/examination/results',
        title: t('nav.examResults')
      })
    }
    return
  }
  
  // 能力管理
  if (path.startsWith('/competency')) {
    // 父级：Competency
    breadcrumbs.value.push({
      path: '/competency',
      title: t('nav.competency')
    })
    
    // 子级
    if (path === '/competency/competencies') {
      breadcrumbs.value.push({
        path: '/competency/competencies',
        title: t('nav.competencies')
      })
    } else if (path === '/competency/assessments') {
      breadcrumbs.value.push({
        path: '/competency/assessments',
        title: t('nav.assessments')
      })
    } else if (path === '/competency/certificates') {
      breadcrumbs.value.push({
        path: '/competency/certificates',
        title: t('nav.certificates')
      })
    }
    return
  }
  
  // 报表管理
  if (path.startsWith('/reporting')) {
    // 父级：Reporting
    breadcrumbs.value.push({
      path: '/reporting',
      title: t('nav.reporting')
    })
    
    // 子级
    if (path === '/reporting/reports') {
      breadcrumbs.value.push({
        path: '/reporting/reports',
        title: t('nav.reports')
      })
    } else if (path === '/reporting/audit-logs') {
      breadcrumbs.value.push({
        path: '/reporting/audit-logs',
        title: t('nav.auditLogs')
      })
    }
    return
  }
  
  // 系统管理 - 独立页面
  if (path === '/users') {
    breadcrumbs.value.push({
      path: '/users',
      title: t('nav.users')
    })
    return
  }
  
  if (path === '/roles') {
    breadcrumbs.value.push({
      path: '/roles',
      title: t('nav.roles')
    })
    return
  }
  
  // 个人中心 - 独立页面
  if (path === '/profile') {
    breadcrumbs.value.push({
      path: '/profile',
      title: t('nav.profile')
    })
    return
  }
  
  // 默认情况：显示路径的各个部分
  const parts = path.split('/').filter(p => p)
  let currentPath = ''
  
  parts.forEach((part, index) => {
    currentPath += `/${part}`
    if (index === parts.length - 1) {
      // 当前页面，不设置链接
      breadcrumbs.value.push({
        path: currentPath,
        title: getBreadcrumbTitle(currentPath)
      })
    } else {
      breadcrumbs.value.push({
        path: currentPath,
        title: getBreadcrumbTitle(currentPath)
      })
    }
  })
}

// 监听路由变化
watch(() => route.path, generateBreadcrumbs, { immediate: true })

const toggleSidebar = () => appStore.toggleSidebar()
const handleMenuSelect = (index) => {
  router.push(index)
}

const handleLanguageChange = (lang) => {
  changeLanguage(lang)
}

const toggleFullscreen = () => {
  if (screenfull.isEnabled) screenfull.toggle()
}

const handleUserCommand = (cmd) => {
  if (cmd === 'profile') router.push('/profile')
  if (cmd === 'settings') router.push('/settings')
  if (cmd === 'logout') {
    authStore.logoutAction().then(() => router.push('/login'))
  }
}

// 初始化
onMounted(() => {
  appStore.initializeTheme()
  changeLanguage(appStore.language)
})
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.header-left {
  display: flex;
  align-items: flex-start;   /* 上对齐，方便单独调 */
  gap: 12px;
}

.el-breadcrumb {
  position: relative;
  top: 10px;   /* 只挪面包屑 */
  
}

.collapse-btn {
  /* 按钮不再加 top，保持原位 */
}
.sidebar {
  background: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  background: #263445;
}

.logo img {
  width: 32px;
  height: 32px;
  margin-right: 10px;
}

.menu-scroll {
  height: calc(100vh - 60px);
}

.sidebar-menu {
  border-right: none;
}


.header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  margin-right: 20px;
  font-size: 18px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-avatar {
  cursor: pointer;
}

.main-content {
  background: #f5f5f5;
  padding: 0;
  overflow: auto;
}

.footer {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  font-size: 12px;
  color: #666;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>