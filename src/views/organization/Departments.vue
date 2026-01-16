<template>
  <div class="page-container">
    <div class="page-header">
      <h2>{{ $t('nav.departments') }}</h2>
    </div>

    <div class="page-content">
      <!-- 搜索 -->
      <el-form :inline="true" :model="searchForm">
        <el-form-item :label="$t('department.departmentName')">
          <el-input v-model="searchForm.name" :placeholder="$t('common.pleaseEnter')" />
        </el-form-item>
        <el-form-item :label="$t('common.status')">
          <el-select v-model="searchForm.is_active" :placeholder="$t('common.pleaseSelect')">
            <el-option :label="$t('common.all')" value="" />
            <el-option :label="$t('common.enabled')" :value="true" />
            <el-option :label="$t('common.disabled')" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">{{ $t('common.search') }}</el-button>
          <el-button @click="handleReset">{{ $t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>

      <!-- 工具栏 -->
      <div class="action-buttons">
        <el-button type="primary" @click="handleAdd">
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
        :data="tableData"
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
        <el-table-column prop="is_active" :label="$t('common.status')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'danger'">
              {{ row.is_active ? $t('common.enabled') : $t('common.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" :label="$t('common.createTime')" width="180" />
        <el-table-column :label="$t('common.operation')" width="200" fixed="right">
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
            :data="departmentTree"
            :props="{ label: 'name', value: 'id' }"
            :placeholder="$t('common.pleaseSelect')"
            clearable
          />
        </el-form-item>
        <el-form-item :label="$t('department.manager')" prop="manager">
          <el-select v-model="formData.manager" :placeholder="$t('common.pleaseSelect')" clearable>
            <el-option
              v-for="user in userOptions"
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
import { ref, reactive, watch, onMounted } from 'vue'
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
const selectedRows = ref([])

const pagination = reactive({ current: 1, size: 10, total: 0 })
const searchForm = reactive({ name: '', is_active: '' })

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

/* ---------------- 关闭弹窗（立即生效） ---------------- */
const handleDialogClose = () => {
  dialogVisible.value = false // ① 马上关
}

/* ---------------- 关闭后清表单（等动画结束） ---------------- */
watch(dialogVisible, val => {
  if (!val) {
    formRef.value?.resetFields()
    Object.assign(formData, {
      id: null, code: '', name: '', parent: null, manager: null,
      description: '', sort_order: 0, is_active: true
    })
    isEdit.value = false
  }
})

/* ---------------- 打开弹窗 ---------------- */
const handleAdd = () => {
  dialogTitle.value = t('department.addDepartment')
  isEdit.value = false
  dialogVisible.value = true
}

const handleEdit = row => {
  dialogTitle.value = t('department.editDepartment')
  isEdit.value = true
  Object.assign(formData, {
    id: row.id, code: row.code, name: row.name, parent: row.parent,
    manager: row.manager, description: row.description,
    sort_order: row.sort_order, is_active: row.is_active
  })
  dialogVisible.value = true
}

/* ---------------- 提交 ---------------- */
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true
    isEdit.value
      ? await departmentAPI.updateDepartment(formData.id, formData)
      : await departmentAPI.createDepartment(formData)
    ElMessage.success(t('message.operationSuccess'))
    handleDialogClose()
    loadTableData()
  } catch {
    ElMessage.error(t('message.operationFailed'))
  } finally {
    submitLoading.value = false
  }
}

/* ---------------- 删除 / 批量删除 ---------------- */
const handleDelete = async row => {
  try {
    await ElMessageBox.confirm(t('message.confirmDelete'), t('common.tip'), { type: 'warning' })
    await departmentAPI.deleteDepartment(row.id)
    ElMessage.success(t('message.deleteSuccess'))
    loadTableData()
  } catch { /* user cancel */ }
}

const handleBatchDelete = async () => {
  if (!selectedRows.value.length) return ElMessage.warning(t('common.pleaseSelect'))
  try {
    await ElMessageBox.confirm(t('message.confirmBatchDelete'), t('common.tip'), { type: 'warning' })
    await Promise.all(selectedRows.value.map(r => departmentAPI.deleteDepartment(r.id)))
    ElMessage.success(t('message.deleteSuccess'))
    loadTableData()
  } catch { /* user cancel */ }
}

const handleView = row => console.log('view', row)

/* ---------------- 表格选择 / 分页 ---------------- */
const handleSelectionChange = rows => (selectedRows.value = rows)
const handleSizeChange    = size   => { pagination.size = size; loadTableData() }
const handleCurrentChange = current => { pagination.current = current; loadTableData() }
const handleSearch = () => { pagination.current = 1; loadTableData() }
const handleReset  = () => { Object.assign(searchForm, { name: '', is_active: '' }); handleSearch() }

/* ---------------- 数据加载 ---------------- */
const loadTableData = async () => {
  loading.value = true
  try {
    const params = { page: pagination.current, size: pagination.size, ...searchForm }
    Object.keys(params).forEach(k => params[k] === '' && delete params[k])
    const { data } = await departmentAPI.getDepartments(params)
    tableData.value = data.results || []
    pagination.total = data.count || 0
  } catch {
    ElMessage.error(t('message.loadingDataFailed'))
  } finally {
    loading.value = false
  }
}

const loadDepartmentTree = async () => {
  try {
    const { data } = await departmentAPI.getDepartmentTree()
    departmentTree.value = data || []
  } catch { /* silent */ }
}

const loadUsers = async () => {
  try {
    const { data } = await userAPI.getUsers()
    userOptions.value = data || []
  } catch { /* silent */ }
}

onMounted(() => {
  loadTableData()
  loadDepartmentTree()
  loadUsers()
})
</script>

<style scoped>
.action-buttons { margin-bottom: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>