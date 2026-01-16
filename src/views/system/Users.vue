<template>
  <div class="users">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-row :gutter="20" align="middle">
        <el-col :span="12">
          <h2>{{ $t('nav.users') }}</h2>
        </el-col>
        <el-col :span="12" class="text-right">
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            {{ $t('common.add') }}
          </el-button>
          <el-button :icon="Upload" @click="handleImport">
            {{ $t('common.import') }}
          </el-button>
          <el-button :icon="Download" @click="handleExport">
            {{ $t('common.export') }}
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item :label="$t('user.realName')">
          <el-input
            v-model="searchForm.realName"
            :placeholder="$t('common.pleaseEnter')"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item :label="$t('user.employeeId')">
          <el-input
            v-model="searchForm.employeeId"
            :placeholder="$t('common.pleaseEnter')"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item :label="$t('department.departmentName')">
          <el-input
            v-model="searchForm.department"
            :placeholder="$t('common.pleaseEnter')"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item :label="$t('user.role')">
          <el-select
            v-model="searchForm.role"
            :placeholder="$t('common.pleaseSelect')"
            clearable
            style="width: 150px"
          >
            <el-option :label="$t('系统管理员')" value="SYSTEM_ADMIN" />
            <el-option :label="$t('HR经理')" value="HR_MANAGER" />
            <el-option :label="$t('培训经理')" value="TRAINING_MANAGER" />
            <el-option :label="$t('部门经理')" value="DEPARTMENT_MANAGER" />
            <el-option :label="$t('讲师')" value="INSTRUCTOR" />
            <el-option :label="$t('普通员工')" value="EMPLOYEE" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('common.status')">
          <el-select
            v-model="searchForm.status"
            :placeholder="$t('common.pleaseSelect')"
            clearable
            style="width: 120px"
          >
            <el-option :label="$t('common.active')" value="active" />
            <el-option :label="$t('common.inactive')" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            {{ $t('common.search') }}
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">
            {{ $t('common.reset') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        ref="tableRef"
        :data="tableData"
        v-loading="loading"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column
          prop="id"
          label="ID"
          width="80"
          show-overflow-tooltip
        />
        <el-table-column
          prop="avatar"
          :label="$t('user.avatar')"
          width="80"
          align="center"
        >
          <template #default="scope">
            <el-avatar
              v-if="scope.row.avatar"
              :size="40"
              :src="scope.row.avatar"
            />
            <el-avatar
              v-else
              :size="40"
            >
              <el-icon :size="20"><User /></el-icon>
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column
          prop="realName"
          :label="$t('user.realName')"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="employeeId"
          :label="$t('user.employeeId')"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="username"
          :label="$t('user.username')"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="email"
          :label="$t('user.email')"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          prop="phone"
          :label="$t('user.phone')"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="department"
          :label="$t('user.department')"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="position"
          :label="$t('user.position')"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="role"
          :label="$t('user.role')"
          width="120"
          align="center"
        >
          <template #default="scope">
            <el-tag :type="getRoleTagType(scope.row.role)">
              {{ getRoleLabel(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          :label="$t('common.status')"
          width="100"
          align="center"
        >
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              active-value="active"
              inactive-value="inactive"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="lastLogin"
          :label="$t('user.lastLogin')"
          width="180"
          align="center"
        />
        <el-table-column
          :label="$t('common.operate')"
          width="200"
          fixed="right"
          align="center"
        >
          <template #default="scope">
            <el-button
              type="primary"
              :icon="View"
              circle
              size="small"
              @click="handleView(scope.row)"
            />
            <el-button
              type="warning"
              :icon="Edit"
              circle
              size="small"
              @click="handleEdit(scope.row)"
            />
            <el-button
              type="danger"
              :icon="Delete"
              circle
              size="small"
              @click="handleDelete(scope.row)"
            />
            <el-button
              type="info"
              :icon="Key"
              circle
              size="small"
              @click="handleResetPassword(scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('user.realName')" prop="realName">
              <el-input
                v-model="formData.realName"
                :placeholder="$t('common.pleaseEnter')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('user.employeeId')" prop="employeeId">
              <el-input
                v-model="formData.employeeId"
                :placeholder="$t('common.pleaseEnter')"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('user.username')" prop="username">
              <el-input
                v-model="formData.username"
                :placeholder="$t('common.pleaseEnter')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="dialogType === 'add'">
            <el-form-item :label="$t('user.password')" prop="password">
              <el-input
                v-model="formData.password"
                type="password"
                :placeholder="$t('common.pleaseEnter')"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('user.email')" prop="email">
              <el-input
                v-model="formData.email"
                :placeholder="$t('common.pleaseEnter')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('user.phone')" prop="phone">
              <el-input
                v-model="formData.phone"
                :placeholder="$t('common.pleaseEnter')"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('user.department')" prop="department">
              <el-input
                v-model="formData.department"
                :placeholder="$t('common.pleaseEnter')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('user.position')" prop="position">
              <el-input
                v-model="formData.position"
                :placeholder="$t('common.pleaseEnter')"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item :label="$t('user.role')" prop="role">
          <el-select
            v-model="formData.role"
            :placeholder="$t('common.pleaseSelect')"
            style="width: 100%"
          >
            <el-option :label="$t('系统管理员')" value="SYSTEM_ADMIN" />
            <el-option :label="$t('HR经理')" value="HR_MANAGER" />
            <el-option :label="$t('培训经理')" value="TRAINING_MANAGER" />
            <el-option :label="$t('部门经理')" value="DEPARTMENT_MANAGER" />
            <el-option :label="$t('讲师')" value="INSTRUCTOR" />
            <el-option :label="$t('普通员工')" value="EMPLOYEE" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogClose">
          {{ $t('common.cancel') }}
        </el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ $t('common.save') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  Search, 
  Refresh, 
  Edit, 
  Delete, 
  View,
  Upload,
  Download,
  Key,
  User
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogType = ref('add') // add or edit
const tableRef = ref()
const formRef = ref()
const selectedRows = ref([])

// 搜索表单
const searchForm = reactive({
  realName: '',
  employeeId: '',
  department: '',
  role: '',
  status: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const tableData = ref([])

// 表单数据
const formData = reactive({
  id: null,
  realName: '',
  employeeId: '',
  username: '',
  password: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  role: 'EMPLOYEE',
  status: 'active'
})

// 表单验证规则
const formRules = reactive({
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  employeeId: [
    { required: true, message: '请输入员工工号', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    // 模拟数据加载
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟数据
    const mockData = [
      {
        id: 1,
        realName: '张三',
        employeeId: 'EMP001',
        username: 'zhangsan',
        email: 'zhangsan@company.com',
        phone: '13800138000',
        department: '生产部',
        position: '操作工',
        role: 'EMPLOYEE',
        status: 'active',
        avatar: '',
        lastLogin: '2024-01-15 14:30:00'
      },
      {
        id: 2,
        realName: '李四',
        employeeId: 'EMP002',
        username: 'lisi',
        email: 'lisi@company.com',
        phone: '13900139000',
        department: '质量部',
        position: '质检员',
        role: 'EMPLOYEE',
        status: 'active',
        avatar: '',
        lastLogin: '2024-01-14 09:15:00'
      },
      {
        id: 3,
        realName: '王五',
        employeeId: 'EMP003',
        username: 'wangwu',
        email: 'wangwu@company.com',
        phone: '13700137000',
        department: '技术部',
        position: '工程师',
        role: 'INSTRUCTOR',
        status: 'active',
        avatar: '',
        lastLogin: '2024-01-13 16:45:00'
      },
      {
        id: 4,
        realName: '赵六',
        employeeId: 'EMP004',
        username: 'zhaoliu',
        email: 'zhaoliu@company.com',
        phone: '13600136000',
        department: '管理部',
        position: '部门经理',
        role: 'DEPARTMENT_MANAGER',
        status: 'active',
        avatar: '',
        lastLogin: '2024-01-12 11:20:00'
      }
    ]
    
    // 应用搜索过滤
    let filteredData = mockData
    if (searchForm.realName) {
      filteredData = filteredData.filter(item => 
        item.realName.includes(searchForm.realName)
      )
    }
    if (searchForm.employeeId) {
      filteredData = filteredData.filter(item => 
        item.employeeId.includes(searchForm.employeeId)
      )
    }
    if (searchForm.department) {
      filteredData = filteredData.filter(item => 
        item.department.includes(searchForm.department)
      )
    }
    if (searchForm.role) {
      filteredData = filteredData.filter(item => 
        item.role === searchForm.role
      )
    }
    if (searchForm.status) {
      filteredData = filteredData.filter(item => 
        item.status === searchForm.status
      )
    }
    
    pagination.total = filteredData.length
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize
    tableData.value = filteredData.slice(startIndex, startIndex + pagination.pageSize)
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error('加载用户数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

const handleReset = () => {
  Object.assign(searchForm, {
    realName: '',
    employeeId: '',
    department: '',
    role: '',
    status: ''
  })
  handleSearch()
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
  loadData()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  loadData()
}

const handleSelectionChange = (val) => {
  selectedRows.value = val
}

const handleAdd = () => {
  dialogTitle.value = '新增用户'
  dialogType.value = 'add'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑用户'
  dialogType.value = 'edit'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleView = (row) => {
  ElMessage.info('查看用户详情功能开发中...')
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      type: 'warning'
    })
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除用户失败:', error)
    }
  }
}

const handleStatusChange = async (row) => {
  try {
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('状态更新失败')
    row.status = row.status === 'active' ? 'inactive' : 'active'
  }
}

const handleResetPassword = (row) => {
  ElMessageBox.prompt(`确定要重置用户 "${row.realName}" 的密码吗？`, '重置密码', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^.{6,20}$/,
    inputErrorMessage: '密码长度必须在6到20个字符之间',
    inputPlaceholder: '请输入新密码'
  }).then(({ value }) => {
    ElMessage.success(`密码已重置为: ${value}`)
  }).catch(() => {
    ElMessage.info('已取消重置密码')
  })
}

const handleImport = () => {
  ElMessage.info('导入功能开发中...')
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success(dialogType.value === 'add' ? '新增成功' : '更新成功')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    if (error !== false) {
      ElMessage.error(dialogType.value === 'add' ? '新增失败' : '更新失败')
      console.error('提交表单失败:', error)
    }
  } finally {
    submitLoading.value = false
  }
}

const handleDialogClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    realName: '',
    employeeId: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    role: 'EMPLOYEE',
    status: 'active'
  })
}

const getRoleLabel = (role) => {
  const labels = {
    SYSTEM_ADMIN: '系统管理员',
    HR_MANAGER: 'HR经理',
    TRAINING_MANAGER: '培训经理',
    DEPARTMENT_MANAGER: '部门经理',
    INSTRUCTOR: '讲师',
    EMPLOYEE: '普通员工'
  }
  return labels[role] || role
}

const getRoleTagType = (role) => {
  const types = {
    SYSTEM_ADMIN: 'danger',
    HR_MANAGER: 'warning',
    TRAINING_MANAGER: 'primary',
    DEPARTMENT_MANAGER: 'info',
    INSTRUCTOR: 'success',
    EMPLOYEE: ''
  }
  return types[role] || ''
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.users {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.text-right {
  text-align: right;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
  }
  
  .search-form .el-form-item {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .pagination {
    justify-content: center;
  }
}
</style>