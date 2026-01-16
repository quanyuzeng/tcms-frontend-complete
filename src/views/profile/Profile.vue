<template>
  <div class="profile">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>{{ $t('nav.profile') }}</h2>
    </div>

    <el-row :gutter="20">
      <!-- 左侧信息卡片 -->
      <el-col :xs="24" :md="8">
        <el-card class="profile-card">
          <div class="profile-header">
            <el-upload
              class="avatar-uploader"
              action="#"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
            >
              <el-avatar
                v-if="userInfo.avatar"
                :size="120"
                :src="userInfo.avatar"
                class="profile-avatar"
              />
              <el-avatar
                v-else
                :size="120"
                class="profile-avatar"
              >
                <el-icon :size="48"><User /></el-icon>
              </el-avatar>
            </el-upload>
            <h3>{{ userInfo.realName || userInfo.username }}</h3>
            <p class="profile-position">{{ userInfo.position || '员工' }}</p>
            <p class="profile-department">{{ userInfo.department || '未分配部门' }}</p>
          </div>
          
          <el-divider />
          
          <div class="profile-stats">
            <el-row :gutter="10">
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-value">{{ stats.trainingCount }}</div>
                  <div class="stat-label">{{ $t('training.training') }}</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-value">{{ stats.examCount }}</div>
                  <div class="stat-label">{{ $t('exam.exam') }}</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-value">{{ stats.certificateCount }}</div>
                  <div class="stat-label">{{ $t('competency.certificate') }}</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>

        <!-- 快捷操作 -->
        <el-card class="quick-actions-card">
          <template #header>
            <span>{{ $t('common.quickActions') }}</span>
          </template>
          <el-row :gutter="10">
            <el-col :span="12" v-for="action in quickActions" :key="action.title">
              <el-button
                :type="action.type"
                :icon="action.icon"
                style="width: 100%; margin-bottom: 10px"
                @click="handleQuickAction(action)"
              >
                {{ action.title }}
              </el-button>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <!-- 右侧详细信息 -->
      <el-col :xs="24" :md="16">
        <el-card class="info-card">
          <template #header>
            <span>{{ $t('user.userInfo') }}</span>
            <el-button
              type="primary"
              :icon="Edit"
              size="small"
              style="float: right"
              @click="handleEdit"
            >
              {{ $t('common.edit') }}
            </el-button>
          </template>
          
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="$t('user.username)">
              {{ userInfo.username }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('user.realName')">
              {{ userInfo.realName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('user.employeeId')">
              {{ userInfo.employeeId || '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('user.email')">
              {{ userInfo.email || '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('user.phone')">
              {{ userInfo.phone || '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('user.department')">
              {{ userInfo.department || '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('user.position')">
              {{ userInfo.position || '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('user.role')">
              <el-tag>{{ userInfo.role || '普通员工' }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('user.language')">
              {{ userInfo.language === 'zh-CN' ? '中文' : 'English' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('user.lastLogin')">
              {{ userInfo.lastLogin || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 最近活动 -->
        <el-card class="activity-card">
          <template #header>
            <span>{{ $t('profile.recentActivity') }}</span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="activity in recentActivities"
              :key="activity.id"
              :timestamp="activity.timestamp"
              :type="activity.type"
              :icon="activity.icon"
            >
              <div class="activity-content">
                <h4>{{ activity.title }}</h4>
                <p>{{ activity.description }}</p>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑个人信息对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="$t('profile.editProfile')"
      width="600px"
      @close="handleEditDialogClose"
    >
      <el-form
        ref="editFormRef"
        :model="editFormData"
        :rules="editFormRules"
        label-width="120px"
      >
        <el-form-item :label="$t('user.realName')" prop="realName">
          <el-input
            v-model="editFormData.realName"
            :placeholder="$t('common.pleaseEnter')"
          />
        </el-form-item>
        <el-form-item :label="$t('user.email')" prop="email">
          <el-input
            v-model="editFormData.email"
            :placeholder="$t('common.pleaseEnter')"
          />
        </el-form-item>
        <el-form-item :label="$t('user.phone')" prop="phone">
          <el-input
            v-model="editFormData.phone"
            :placeholder="$t('common.pleaseEnter')"
          />
        </el-form-item>
        <el-form-item :label="$t('user.language')" prop="language">
          <el-select
            v-model="editFormData.language"
            :placeholder="$t('common.pleaseSelect')"
            style="width: 100%"
          >
            <el-option label="中文" value="zh-CN" />
            <el-option label="English" value="en-US" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleEditDialogClose">
          {{ $t('common.cancel') }}
        </el-button>
        <el-button type="primary" :loading="editLoading" @click="handleEditSubmit">
          {{ $t('common.save') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      :title="$t('user.changePassword')"
      width="600px"
      @close="handlePasswordDialogClose"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordFormData"
        :rules="passwordFormRules"
        label-width="140px"
      >
        <el-form-item :label="$t('user.oldPassword')" prop="oldPassword">
          <el-input
            v-model="passwordFormData.oldPassword"
            type="password"
            :placeholder="$t('common.pleaseEnter')"
            show-password
          />
        </el-form-item>
        <el-form-item :label="$t('user.newPassword')" prop="newPassword">
          <el-input
            v-model="passwordFormData.newPassword"
            type="password"
            :placeholder="$t('common.pleaseEnter')"
            show-password
          />
        </el-form-item>
        <el-form-item :label="$t('user.confirmPassword')" prop="confirmPassword">
          <el-input
            v-model="passwordFormData.confirmPassword"
            type="password"
            :placeholder="$t('common.pleaseEnter')"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handlePasswordDialogClose">
          {{ $t('common.cancel') }}
        </el-button>
        <el-button type="primary" :loading="passwordLoading" @click="handlePasswordSubmit">
          {{ $t('common.save') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  User, 
  Edit, 
  Reading, 
  EditPen, 
  Certificate,
  Key,
  SwitchButton
} from '@element-plus/icons-vue'
import { useAuthStore } from '../../store/auth'
import { useAppStore } from '../../store/app'
import { useRouter } from 'vue-router'

// 响应式数据
const authStore = useAuthStore()
const appStore = useAppStore()
const router = useRouter()

const editDialogVisible = ref(false)
const passwordDialogVisible = ref(false)
const editLoading = ref(false)
const passwordLoading = ref(false)
const editFormRef = ref()
const passwordFormRef = ref()

// 用户信息
const userInfo = reactive({
  id: 1,
  username: 'zhangsan',
  realName: '张三',
  employeeId: 'EMP001',
  email: 'zhangsan@company.com',
  phone: '13800138000',
  department: '生产部',
  position: '初级操作工',
  role: '普通员工',
  language: 'zh-CN',
  avatar: '',
  lastLogin: '2024-01-15 14:30:00'
})

// 统计数据
const stats = reactive({
  trainingCount: 12,
  examCount: 8,
  certificateCount: 5
})

// 快捷操作
const quickActions = ref([
  { title: '我的培训', icon: Reading, type: 'primary', action: 'my-training' },
  { title: '我的考试', icon: EditPen, type: 'success', action: 'my-exams' },
  { title: '我的证书', icon: Certificate, type: 'warning', action: 'my-certificates' },
  { title: '修改密码', icon: Key, type: 'info', action: 'change-password' },
  { title: '系统设置', icon: Edit, type: 'default', action: 'settings' },
  { title: '退出登录', icon: SwitchButton, type: 'danger', action: 'logout' }
])

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    title: '完成培训课程',
    description: '完成了《设备安全操作规范》培训课程',
    timestamp: '2024-01-15 09:30:00',
    type: 'success',
    icon: Reading
  },
  {
    id: 2,
    title: '参加考试',
    description: '参加了《质量管理体系》考试，得分85分',
    timestamp: '2024-01-14 14:20:00',
    type: 'primary',
    icon: EditPen
  },
  {
    id: 3,
    title: '获得证书',
    description: '获得了《安全生产操作证书》',
    timestamp: '2024-01-13 10:15:00',
    type: 'warning',
    icon: Certificate
  },
  {
    id: 4,
    title: '能力评估',
    description: '完成了设备操作能力评估，评级为"掌握"',
    timestamp: '2024-01-12 16:45:00',
    type: 'info',
    icon: Edit
  }
])

// 编辑表单数据
const editFormData = reactive({
  realName: '',
  email: '',
  phone: '',
  language: 'zh-CN'
})

// 编辑表单验证规则
const editFormRules = reactive({
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
})

// 密码表单数据
const passwordFormData = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码表单验证规则
const passwordFormRules = reactive({
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordFormData.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 方法
const handleEdit = () => {
  Object.assign(editFormData, {
    realName: userInfo.realName,
    email: userInfo.email,
    phone: userInfo.phone,
    language: userInfo.language
  })
  editDialogVisible.value = true
}

const handleEditSubmit = async () => {
  try {
    await editFormRef.value.validate()
    editLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新用户信息
    Object.assign(userInfo, editFormData)
    
    ElMessage.success('个人信息更新成功')
    editDialogVisible.value = false
  } catch (error) {
    if (error !== false) {
      ElMessage.error('更新失败')
      console.error('更新个人信息失败:', error)
    }
  } finally {
    editLoading.value = false
  }
}

const handleEditDialogClose = () => {
  editDialogVisible.value = false
  editFormRef.value?.resetFields()
}

const handlePasswordSubmit = async () => {
  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('密码修改成功')
    passwordDialogVisible.value = false
  } catch (error) {
    if (error !== false) {
      ElMessage.error('密码修改失败')
      console.error('修改密码失败:', error)
    }
  } finally {
    passwordLoading.value = false
  }
}

const handlePasswordDialogClose = () => {
  passwordDialogVisible.value = false
  passwordFormRef.value?.resetFields()
  Object.assign(passwordFormData, {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
}

const handleQuickAction = (action) => {
  switch (action.action) {
    case 'my-training':
      router.push('/my-training')
      break
    case 'my-exams':
      router.push('/my-exams')
      break
    case 'my-certificates':
      router.push('/my-certificates')
      break
    case 'change-password':
      passwordDialogVisible.value = true
      break
    case 'settings':
      ElMessage.info('系统设置功能开发中...')
      break
    case 'logout':
      handleLogout()
      break
  }
}

const handleLogout = async () => {
  try {
    await authStore.logoutAction()
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

const handleAvatarSuccess = (res, file) => {
  userInfo.avatar = URL.createObjectURL(file.raw)
  ElMessage.success('头像上传成功')
}

const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG) {
    ElMessage.error('头像只能是 JPG/PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

// 生命周期
onMounted(() => {
  // 这里可以从authStore加载用户信息
  if (authStore.user) {
    Object.assign(userInfo, authStore.user)
  }
})
</script>

<style scoped>
.profile {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.profile-card {
  text-align: center;
  margin-bottom: 20px;
}

.profile-header {
  padding: 20px 0;
}

.profile-avatar {
  cursor: pointer;
  margin-bottom: 15px;
}

.profile-position {
  color: #909399;
  margin: 5px 0;
}

.profile-department {
  color: #606266;
  font-size: 14px;
}

.profile-stats {
  padding: 20px 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.quick-actions-card {
  margin-bottom: 20px;
}

.info-card {
  margin-bottom: 20px;
}

.activity-card {
  margin-bottom: 20px;
}

.activity-content h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #303133;
}

.activity-content p {
  margin: 0;
  font-size: 13px;
  color: #606266;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile {
    padding: 10px;
  }
  
  .quick-actions-card .el-button {
    font-size: 12px;
  }
}
</style>