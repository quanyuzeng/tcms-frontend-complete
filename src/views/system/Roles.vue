<template>
  <div class="roles">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-row :gutter="20" align="middle">
        <el-col :span="12">
          <h2>{{ $t('nav.roles') }}</h2>
        </el-col>
        <el-col :span="12" class="text-right">
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            {{ $t('common.add') }}
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
        <el-form-item :label="$t('user.role')">
          <el-input
            v-model="searchForm.name"
            :placeholder="$t('common.pleaseEnter')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('common.code')">
          <el-input
            v-model="searchForm.code"
            :placeholder="$t('common.pleaseEnter')"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item :label="$t('common.status')">
          <el-select
            v-model="searchForm.status"
            :placeholder="$t('common.pleaseSelect')"
            clearable
            style="width: 120px"
          >
            <el-option :label="$t('common.enabled')" value="enabled" />
            <el-option :label="$t('common.disabled')" value="disabled" />
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
          prop="name"
          :label="$t('user.role')"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="code"
          :label="$t('common.code')"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="description"
          :label="$t('common.description')"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="permissions"
          :label="$t('role.permissions')"
          width="100"
          align="center"
        >
          <template #default="scope">
            <el-button
              type="primary"
              :icon="Setting"
              size="small"
              circle
              @click="handlePermission(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="userCount"
          :label="$t('role.userCount')"
          width="100"
          align="center"
        />
        <el-table-column
          prop="status"
          :label="$t('common.status')"
          width="100"
          align="center"
        >
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              active-value="enabled"
              inactive-value="disabled"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          :label="$t('common.createTime')"
          width="180"
          align="center"
        />
        <el-table-column
          :label="$t('common.operate')"
          width="180"
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
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item :label="$t('user.role')" prop="name">
          <el-input
            v-model="formData.name"
            :placeholder="$t('common.pleaseEnter')"
          />
        </el-form-item>
        <el-form-item :label="$t('common.code')" prop="code">
          <el-input
            v-model="formData.code"
            :placeholder="$t('common.pleaseEnter')"
          />
        </el-form-item>
        <el-form-item :label="$t('common.description')" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            :placeholder="$t('common.pleaseEnter')"
          />
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

    <!-- 权限配置对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      :title="$t('权限配置')"
      width="800px"
      @close="handlePermissionDialogClose"
    >
      <el-form label-width="120px">
        <el-form-item :label="$t('角色名称')">
          <el-input v-model="currentRole.name" readonly />
        </el-form-item>
        <el-form-item :label="$t('权限设置')">
          <el-checkbox-group v-model="selectedPermissions">
            <el-row :gutter="20">
              <el-col :span="8" v-for="permission in allPermissions" :key="permission.id">
                <el-checkbox :label="permission.id">
                  {{ permission.name }}
                </el-checkbox>
              </el-col>
            </el-row>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handlePermissionDialogClose">
          {{ $t('common.cancel') }}
        </el-button>
        <el-button type="primary" :loading="permissionLoading" @click="handlePermissionSubmit">
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
  Download,
  Setting
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const permissionLoading = ref(false)
const dialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const dialogTitle = ref('')
const dialogType = ref('add') // add or edit
const tableRef = ref()
const formRef = ref()
const selectedRows = ref([])
const currentRole = ref({})
const selectedPermissions = ref([])

// 搜索表单
const searchForm = reactive({
  name: '',
  code: '',
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
  name: '',
  code: '',
  description: '',
  status: 'enabled'
})

// 表单验证规则
const formRules = reactive({
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
  ]
})

// 所有权限
const allPermissions = ref([
  { id: 'user.view', name: '查看用户' },
  { id: 'user.create', name: '创建用户' },
  { id: 'user.edit', name: '编辑用户' },
  { id: 'user.delete', name: '删除用户' },
  { id: 'role.view', name: '查看角色' },
  { id: 'role.create', name: '创建角色' },
  { id: 'role.edit', name: '编辑角色' },
  { id: 'role.delete', name: '删除角色' },
  { id: 'course.view', name: '查看课程' },
  { id: 'course.create', name: '创建课程' },
  { id: 'course.edit', name: '编辑课程' },
  { id: 'course.delete', name: '删除课程' },
  { id: 'exam.view', name: '查看考试' },
  { id: 'exam.create', name: '创建考试' },
  { id: 'exam.edit', name: '编辑考试' },
  { id: 'exam.delete', name: '删除考试' },
  { id: 'report.view', name: '查看报表' },
  { id: 'report.export', name: '导出报表' }
])

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
        name: '系统管理员',
        code: 'SYSTEM_ADMIN',
        description: '系统超级管理员，拥有所有权限',
        userCount: 2,
        permissions: ['user.*', 'role.*', 'course.*', 'exam.*', 'report.*'],
        status: 'enabled',
        createTime: '2024-01-01 10:00:00'
      },
      {
        id: 2,
        name: 'HR经理',
        code: 'HR_MANAGER',
        description: '负责员工管理和组织架构管理',
        userCount: 3,
        permissions: ['user.view', 'user.create', 'user.edit', 'report.view', 'report.export'],
        status: 'enabled',
        createTime: '2024-01-02 14:30:00'
      },
      {
        id: 3,
        name: '培训经理',
        code: 'TRAINING_MANAGER',
        description: '负责培训课程和计划管理',
        userCount: 2,
        permissions: ['course.*', 'exam.view', 'exam.create', 'report.view'],
        status: 'enabled',
        createTime: '2024-01-03 09:15:00'
      },
      {
        id: 4,
        name: '普通员工',
        code: 'EMPLOYEE',
        description: '普通员工，只能查看相关信息',
        userCount: 156,
        permissions: ['course.view', 'exam.view', 'report.view'],
        status: 'enabled',
        createTime: '2024-01-05 11:20:00'
      }
    ]
    
    // 应用搜索过滤
    let filteredData = mockData
    if (searchForm.name) {
      filteredData = filteredData.filter(item => 
        item.name.includes(searchForm.name)
      )
    }
    if (searchForm.code) {
      filteredData = filteredData.filter(item => 
        item.code.includes(searchForm.code)
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
    console.error('加载角色数据失败:', error)
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
    name: '',
    code: '',
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
  dialogTitle.value = '新增角色'
  dialogType.value = 'add'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑角色'
  dialogType.value = 'edit'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleView = (row) => {
  ElMessage.info('查看角色详情功能开发中...')
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
      type: 'warning'
    })
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除角色失败:', error)
    }
  }
}

const handleStatusChange = async (row) => {
  try {
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('状态更新失败')
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
  }
}

const handlePermission = (row) => {
  currentRole.value = row
  selectedPermissions.value = row.permissions || []
  permissionDialogVisible.value = true
}

const handlePermissionSubmit = async () => {
  try {
    permissionLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('权限配置成功')
    permissionDialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('权限配置失败')
    console.error('权限配置失败:', error)
  } finally {
    permissionLoading.value = false
  }
}

const handlePermissionDialogClose = () => {
  permissionDialogVisible.value = false
  currentRole.value = {}
  selectedPermissions.value = []
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
    name: '',
    code: '',
    description: '',
    status: 'enabled'
  })
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.roles {
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