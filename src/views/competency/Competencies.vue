<template>
  <div class="competencies">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-row :gutter="20" align="middle">
        <el-col :span="12">
          <h2>{{ $t('nav.competencies') }}</h2>
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
        <el-form-item :label="$t('competency.competencyName')">
          <el-input
            v-model="searchForm.name"
            :placeholder="$t('common.pleaseEnter')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('competency.competencyLevel')">
          <el-select
            v-model="searchForm.level"
            :placeholder="$t('common.pleaseSelect')"
            clearable
            style="width: 150px"
          >
            <el-option :label="$t('competency.understand')" value="understand" />
            <el-option :label="$t('competency.master')" value="master" />
            <el-option :label="$t('competency.proficient')" value="proficient" />
            <el-option :label="$t('competency.expert')" value="expert" />
          </el-select>
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
          :label="$t('competency.competencyName')"
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
          prop="level"
          :label="$t('competency.competencyLevel')"
          width="120"
          align="center"
        >
          <template #default="scope">
            <el-tag :type="getLevelTagType(scope.row.level)">
              {{ $t(`competency.${scope.row.level}`) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="category"
          :label="$t('common.category')"
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
        <el-form-item :label="$t('competency.competencyName')" prop="name">
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
        <el-form-item :label="$t('competency.competencyLevel')" prop="level">
          <el-select
            v-model="formData.level"
            :placeholder="$t('common.pleaseSelect')"
            style="width: 100%"
          >
            <el-option :label="$t('competency.understand')" value="understand" />
            <el-option :label="$t('competency.master')" value="master" />
            <el-option :label="$t('competency.proficient')" value="proficient" />
            <el-option :label="$t('competency.expert')" value="expert" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('common.category')" prop="category">
          <el-input
            v-model="formData.category"
            :placeholder="$t('common.pleaseEnter')"
          />
        </el-form-item>
        <el-form-item :label="$t('competency.assessmentMethod')" prop="assessmentMethod">
          <el-select
            v-model="formData.assessmentMethod"
            :placeholder="$t('common.pleaseSelect')"
            style="width: 100%"
            multiple
          >
            <el-option :label="$t('笔试')" value="written_exam" />
            <el-option :label="$t('实操考核')" value="practical_exam" />
            <el-option :label="$t('面试评估')" value="interview" />
            <el-option :label="$t('项目评估')" value="project_evaluation" />
          </el-select>
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
  Download
} from '@element-plus/icons-vue'
import { competencyAPI } from '../../api'

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
  name: '',
  level: '',
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
  level: 'understand',
  category: '',
  assessmentMethod: [],
  description: '',
  status: 'enabled'
})

// 表单验证规则
const formRules = reactive({
  name: [
    { required: true, message: '请输入能力名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入能力编码', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请选择能力级别', trigger: 'change' }
  ],
  category: [
    { required: true, message: '请输入能力分类', trigger: 'blur' }
  ]
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      ...searchForm
    }
    const response = await competencyAPI.getCompetencies(params)
    tableData.value = response.data.results || []
    pagination.total = response.data.count || 0
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error('加载能力数据失败:', error)
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
    level: '',
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
  dialogTitle.value = '新增能力'
  dialogType.value = 'add'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑能力'
  dialogType.value = 'edit'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleView = (row) => {
  // 查看详情
  ElMessage.info('查看功能开发中...')
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该能力吗？', '提示', {
      type: 'warning'
    })
    await competencyAPI.deleteCompetency(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除能力失败:', error)
    }
  }
}

const handleStatusChange = async (row) => {
  try {
    await competencyAPI.updateCompetency(row.id, { status: row.status })
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('状态更新失败')
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
  }
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    if (dialogType.value === 'add') {
      await competencyAPI.createCompetency(formData)
      ElMessage.success('新增成功')
    } else {
      await competencyAPI.updateCompetency(formData.id, formData)
      ElMessage.success('更新成功')
    }
    
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
    level: 'understand',
    category: '',
    assessmentMethod: [],
    description: '',
    status: 'enabled'
  })
}

const getLevelTagType = (level) => {
  const types = {
    understand: 'info',
    master: 'success',
    proficient: 'warning',
    expert: 'danger'
  }
  return types[level] || 'info'
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.competencies {
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