<template>
  <div class="login-container">
    <div class="login-form-container">
      <div class="login-header">
        <el-icon size="80" color="#667eea"><Avatar /></el-icon>
        <h1 class="login-title">{{ $t('common.trainingAndCompetencySystem') }}</h1>
        <p class="login-subtitle">Training & Competency Management System</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            :placeholder="$t('auth.usernameRequired')"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            :placeholder="$t('auth.passwordRequired')"
            prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="loginForm.remember">{{ $t('auth.remember') }}</el-checkbox>
          <el-button link class="forgot-password" @click="handleForgotPassword">
            {{ $t('auth.forgotPassword') }}
          </el-button>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            {{ $t('auth.login') }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p>&copy; 2024 TCMS Training & Competency Management System</p>
      </div>
    </div>

    <div class="login-background">
      <div class="login-background-content">
        <h2>{{ $t('common.manufacturingTrainingSolution') }}</h2>
        <ul>
          <li>{{ $t('common.completeTrainingLifecycle') }}</li>
          <li>{{ $t('common.competencyMatrix') }}</li>
          <li>{{ $t('common.onlineExam') }}</li>
          <li>{{ $t('common.complianceAudit') }}</li>
          <li>{{ $t('common.multiDimensionalReports') }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const loginFormRef = ref()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const loginRules = {
  username: [{ required: true, message: t('auth.usernameRequired'), trigger: 'blur' }],
  password: [{ required: true, message: t('auth.passwordRequired'), trigger: 'blur' }]
}

// 登录
const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
    loading.value = true
    await authStore.loginAction(loginForm)
    ElMessage.success(t('auth.loginSuccess'))
    const redirect = router.currentRoute.value.query.redirect || '/'
    console.log('[login] 即将跳转:', redirect)
    await router.push(redirect)          // 等待跳转完成
  } catch (err) {
    console.error('[login] 登录/跳转失败:', err)
    ElMessage.error(err.message || t('auth.loginFailed'))
  } finally {
    loading.value = false
  }
}

// 忘记密码
const handleForgotPassword = () => {
  ElMessage.info(t('auth.forgotPasswordFeature'))
}
</script>

<style scoped>
.login-container {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background: white;
  max-width: 500px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.login-subtitle {
  font-size: 14px;
  color: #666;
}

.login-form {
  width: 100%;
  max-width: 360px;
}

.forgot-password {
  float: right;
}

.login-button {
  width: 100%;
}

.login-footer {
  margin-top: 40px;
  text-align: center;
  font-size: 12px;
  color: #999;
}

.login-background {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: white;
}

.login-background-content {
  max-width: 500px;
}

.login-background h2 {
  font-size: 32px;
  margin-bottom: 30px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.login-background ul {
  list-style: none;
  padding: 0;
}

.login-background li {
  font-size: 18px;
  margin-bottom: 15px;
  padding-left: 30px;
  position: relative;
}

.login-background li::before {
  content: '✓';
  position: absolute;
  left: 0;
  font-weight: bold;
}

@media (max-width: 768px) {
  .login-background {
    display: none;
  }
  .login-form-container {
    max-width: 100%;
  }
}
</style>