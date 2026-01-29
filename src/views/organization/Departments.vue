<template>
  <div class="page-container">
    <div class="page-header">
      <h2>{{ $t('nav.departments') }}</h2>
    </div>

    <div class="page-content">
      <!-- 搜索 -->
      <el-form :inline="true" :model="searchForm">
        <el-form-item :label="$t('department.departmentName')">
          <el-input v-model="searchForm.name" :placeholder="$t('common.pleaseEnter')" clearable />
        </el-form-item>
        <el-form-item :label="$t('common.status')">
          <el-select v-model="searchForm.status" :placeholder="$t('common.pleaseSelect')" clearable>
            <el-option :label="$t('common.all')" value="" />
            <el-option :label="$t('common.enabled')" value="active" />
            <el-option :label="$t('common.disabled')" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">{{ $t('common.search') }}</el-button>
          <el-button @click="handleReset">{{ $t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>

      <!-- 工具栏 -->
      <div class="action-buttons">
        <el-button type="primary" @click="handleAdd" :loading="initLoading">
          <el-icon><Plus /></el-icon>
          {{ $t('department.addDepartment') }}
        </el-button>
        <el-button @click="handleBatchDelete" :disabled="selectedRows.length === 0">
          <el-icon><Delete /></el-icon>
          {{ $t('common.batchDelete') }}
        </el-button>
      </div>

      <!-- 表格 -->
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="safeTableData"
        row-key="id"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="code" :label="$t('department.departmentCode')" width="120" />
        <el-table-column prop="name" :label="$t('department.departmentName')" min-width="150" />
        <el-table-column prop="parent_name" :label="$t('department.parentDepartment')" width="150" />
        <el-table-column prop="manager_name" :label="$t('department.manager')" width="120" />
        <el-table-column prop="employee_count" :label="$t('department.employeeCount')" width="100" align="center" />
        <el-table-column prop="status" :label="$t('common.status')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? $t('common.enabled') : $t('common.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" :label="$t('common.createTime')" width="180" />
        <el-table-column :label="$t('common.operation', { default: '操作' })" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">{{ $t('common.edit') }}</el-button>
            <el-button type="primary" link @click="handleView(row)">{{ $t('common.view') }}</el-button>
            <el-button type="danger" link @click="handleDelete(row)">{{ $t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 新增 / 编辑 -->
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
        <el-form-item :label="$t('department.departmentCode')" prop="code">
          <el-input v-model="formData.code" :placeholder="$t('common.pleaseEnter')" />
        </el-form-item>
        <el-form-item :label="$t('department.departmentName')" prop="name">
          <el-input v-model="formData.name" :placeholder="$t('common.pleaseEnter')" />
        </el-form-item>
        <el-form-item :label="$t('department.parentDepartment')" prop="parent">
          <el-tree-select
            v-model="formData.parent"
            :data="safeDepartmentTree"
            :props="{ label: 'name', value: 'id' }"
            :placeholder="$t('common.pleaseSelect')"
            clearable
          />
        </el-form-item>
        <el-form-item :label="$t('department.manager')" prop="manager">
          <el-select v-model="formData.manager" :placeholder="$t('common.pleaseSelect')" clearable>
            <el-option
              v-for="user in safeUserOptions"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('department.description')" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            :placeholder="$t('common.pleaseEnter')"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort_order">
          <el-input-number v-model="formData.sort_order" :min="0" />
        </el-form-item>
        <el-form-item :label="$t('common.status')" prop="is_active">
          <el-switch v-model="formData.is_active" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleDialogClose">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, nextTick, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { departmentAPI } from '@/api/organization'
import { userAPI } from '@/api/users'

const { t } = useI18n()

/* ---------------- 表格 / 分页 ---------------- */
const tableRef   = ref()
const tableData  = ref([])
const loading    = ref(false)
const initLoading = ref(true)
const selectedRows = ref([])

const pagination = reactive({ current: 1, size: 10, total: 0 })
const searchForm = reactive({ name: '', status: '' })

const safeTableData = computed(() => {
  const data = tableData.value || []
  return data.filter(item => {
    const isValid = item && typeof item === 'object' && item.id !== null && item.id !== undefined
    if (!isValid) console.warn('Filtered invalid item:', item)
    return isValid
  })
})

/* ---------------- 弹窗 ---------------- */
const dialogVisible   = ref(false)
const dialogTitle     = ref('')
const submitLoading   = ref(false)
const isEdit          = ref(false)
const formRef         = ref()

const formData = reactive({
  id: null, code: '', name: '', parent: null, manager: null,
  description: '', sort_order: 0, is_active: true
})

const formRules = {
  code: [
    { required: true, message: () => t('validation.required'), trigger: 'blur' },
    { pattern: /^[A-Z0-9_]+$/, message: '大写字母/数字/下划线', trigger: 'blur' }
  ],
  name: [{ required: true, message: () => t('validation.required'), trigger: 'blur' }]
}

/* ---------------- 下拉数据 ---------------- */
const departmentTree = ref([])
const userOptions    = ref([])

const safeDepartmentTree = computed(() => {
  const tree = departmentTree.value || []
  return tree.filter(node => {
    const isValid = node && typeof node === 'object' && node.id !== null && node.id !== undefined
    if (!isValid) console.warn('Filtered invalid tree node:', node)
    return isValid
  })
})

const safeUserOptions = computed(() => {
  const options = userOptions.value || []
  return options.filter(user => {
    const isValid = user && typeof user === 'object' && user.id !== null && user.id !== undefined
    if (!isValid) console.warn('Filtered invalid user:', user)
    return isValid
  })
})

/* ---------------- 关闭弹窗 ---------------- */
const handleDialogClose = () => {
  dialogVisible.value = false
}

/* ---------------- 关闭后清表单 ---------------- */
watch(dialogVisible, val => {
  if (!val) {
    nextTick(() => {
      formRef.value?.resetFields()
      Object.assign(formData, {
        id: null, code: '', name: '', parent: null, manager: null,
        description: '', sort_order: 0, is_active: true
      })
      isEdit.value = false
    })
  }
})

/* ---------------- 打开弹窗 ---------------- */
const handleAdd = () => {
  if (initLoading.value) {
    ElMessage.warning('数据初始化中，请稍候...')
    return
  }
  
  dialogTitle.value = t('department.addDepartment')
  isEdit.value = false
  Object.assign(formData, {
    id: null, code: '', name: '', parent: null, manager: null,
    description: '', sort_order: 0, is_active: true
  })
  dialogVisible.value = true
}

const handleEdit = row => {
  if (!row || row.id === null || row.id === undefined) {
    ElMessage.error('无效的数据，无法编辑')
    return
  }
  
  dialogTitle.value = t('department.editDepartment')
  isEdit.value = true
  Object.assign(formData, {
    id: row.id, code: row.code, name: row.name, parent: row.parent,
    manager: row.manager, description: row.description,
    sort_order: row.sort_order, is_active: row.status === 'active'
  })
  dialogVisible.value = true
}

/* ---------------- 提交 ---------------- */
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    
    const submitData = {
      ...formData,
      status: formData.is_active ? 'active' : 'inactive'
    }
    delete submitData.is_active
    
    if (isEdit.value) {
      if (!formData.id) throw new Error('ID is required for update')
      await departmentAPI.updateDepartment(formData.id, submitData)
    } else {
      await departmentAPI.createDepartment(submitData)
    }
    
    ElMessage.success(t('message.operationSuccess'))
    handleDialogClose()
    loadTableData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Submit error:', error)
      ElMessage.error(t('message.operationFailed'))
    }
  } finally {
    submitLoading.value = false
  }
}

/* ---------------- 删除 / 批量删除 ---------------- */
const handleDelete = async row => {
  if (!row || row.id === null || row.id === undefined) {
    ElMessage.error('无效的数据，无法删除')
    return
  }
  
  try {
    await ElMessageBox.confirm(t('message.confirmDelete'), t('common.tip'), { type: 'warning' })
    await departmentAPI.deleteDepartment(row.id)
    ElMessage.success(t('message.deleteSuccess'))
    loadTableData()
  } catch (error) {
    if (error !== 'cancel') console.error('Delete error:', error)
  }
}

const handleBatchDelete = async () => {
  if (!selectedRows.value.length) {
    ElMessage.warning(t('common.pleaseSelect'))
    return
  }
  
  try {
    await ElMessageBox.confirm(t('message.confirmBatchDelete'), t('common.tip'), { type: 'warning' })
    
    const validRows = selectedRows.value.filter(r => r && r.id !== null && r.id !== undefined)
    if (!validRows.length) {
      ElMessage.warning('没有有效的数据可以删除')
      return
    }
    
    await Promise.all(validRows.map(r => departmentAPI.deleteDepartment(r.id)))
    ElMessage.success(t('message.deleteSuccess'))
    loadTableData()
  } catch (error) {
    if (error !== 'cancel') console.error('Batch delete error:', error)
  }
}

const handleView = row => {
  if (!row) return
  console.log('View department:', row)
  ElMessage.info('查看功能开发中...')
}

/* ---------------- 表格选择 / 分页 ---------------- */
const handleSelectionChange = rows => {
  selectedRows.value = rows.filter(r => r && r.id !== null && r.id !== undefined)
}

const handleSizeChange = size => {
  pagination.size = size
  loadTableData()
}

const handleCurrentChange = current => {
  pagination.current = current
  loadTableData()
}

const handleSearch = () => {
  pagination.current = 1
  loadTableData()
}

const handleReset = () => {
  Object.assign(searchForm, { name: '', status: '' })
  handleSearch()
}

/* ---------------- 数据加载 ---------------- */
const loadTableData = async () => {
  loading.value = true
  initLoading.value = true
  
  try {
    const params = { page: pagination.current, size: pagination.size, ...searchForm }
    Object.keys(params).forEach(k => {
      if (params[k] === '' || params[k] === null || params[k] === undefined) {
        delete params[k]
      }
    })
    
    const { data } = await departmentAPI.getDepartments(params)
    
    const results = Array.isArray(data.results) ? data.results : []
    tableData.value = results
      .map(item => {
        if (!item) return null
        return {
          id: item.id ?? null,
          code: item.code ?? '',
          name: item.name ?? '',
          parent_name: item.parent_name ?? '',
          manager_name: item.manager_name ?? '',
          employee_count: item.employee_count ?? 0,
          status: item.status ?? 'active',
          created_at: item.created_at ?? '',
          parent: item.parent ?? null,
          manager: item.manager ?? null,
          description: item.description ?? '',
          sort_order: item.sort_order ?? 0
        }
      })
      .filter(item => item && item.id !== null && item.id !== undefined)
    
    pagination.total = data.count || 0
    
    if (tableData.value.length === 0 && pagination.current > 1) {
      pagination.current = 1
      loadTableData()
    }
  } catch (error) {
    console.error('Load table data error:', error)
    ElMessage.error(t('message.loadingDataFailed'))
    tableData.value = []
  } finally {
    loading.value = false
    initLoading.value = false
  }
}

const loadDepartmentTree = async () => {
  try {
    const { data } = await departmentAPI.getDepartmentTree()
    
    const treeData = Array.isArray(data) ? data : (data || [])
    departmentTree.value = treeData
      .map(node => {
        if (!node) return null
        return {
          id: node.id ?? null,
          name: node.name ?? '未命名部门',
          children: node.children || null
        }
      })
      .filter(node => node && node.id !== null)
  } catch (error) {
    console.error('Load department tree error:', error)
    departmentTree.value = []
  }
}

const loadUsers = async () => {
  try {
    const { data } = await userAPI.getUsers()
    console.log('User API raw response:', data)
    
    let userList = []
    if (Array.isArray(data)) {
      userList = data
    } else if (data && Array.isArray(data.results)) {
      userList = data.results
    } else if (data && Array.isArray(data.data)) {
      userList = data.data
    } else {
      console.warn('User API returned non-array data:', data)
      userList = []
    }
    
    userOptions.value = userList
      .map(user => {
        if (!user) return null
        return {
          id: user.id ?? null,
          name: user.name ?? '未命名用户',
          email: user.email ?? ''
        }
      })
      .filter(user => user && user.id !== null)
      
  } catch (error) {
    console.error('Load users error:', error)
    userOptions.value = []
  }
}

// 生命周期
onMounted(() => {
  Promise.all([
    loadTableData(),
    loadDepartmentTree(),
    loadUsers()
  ]).catch(err => {
    console.error('Failed to load initial data:', err)
  })
})

defineOptions({
  name: 'DepartmentsManage'
})
</script>

<style scoped>
.action-buttons { 
  margin-bottom: 16px; 
  display: flex;
  gap: 8px;
}
.pagination { 
  margin-top: 16px; 
  display: flex; 
  justify-content: flex-end; 
}
</style>