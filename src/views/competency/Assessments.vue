<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-row :gutter="20" align="middle">
        <el-col :span="12">
          <h2>{{ $t('nav.assessments') }}</h2>
        </el-col>
        <el-col :span="12" class="text-right">
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            {{ $t('common.add') + $t('competency.assessment') }}
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
            v-model="searchForm.employeeName"
            :placeholder="$t('common.pleaseEnter') + $t('user.realName')"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item :label="$t('department.departmentName')">
          <el-input
            v-model="searchForm.department"
            :placeholder="$t('common.pleaseEnter') + $t('department.departmentName')"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item :label="$t('competency.competencyName')">
          <el-input
            v-model="searchForm.competencyName"
            :placeholder="$t('common.pleaseEnter') + $t('competency.competencyName')"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item :label="$t('competency.assessmentMethod')">
          <el-select
            v-model="searchForm.assessmentMethod"
            :placeholder="$t('common.pleaseSelect')"
            clearable
            style="width: 150px"
          >
            <el-option :label="$t('competency.writtenExam')" value="written_exam" />
            <el-option :label="$t('competency.practicalExam')" value="practical_exam" />
            <el-option :label="$t('competency.interview')" value="interview" />
            <el-option :label="$t('competency.projectEvaluation')" value="project_evaluation" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('common.status')">
          <el-select
            v-model="searchForm.status"
            :placeholder="$t('common.pleaseSelect')"
            clearable
            style="width: 120px"
          >
            <el-option :label="$t('assessment.pending')" value="pending" />
            <el-option :label="$t('assessment.inProgress')" value="in_progress" />
            <el-option :label="$t('common.completed')" value="completed" />
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
          prop="employeeName"
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
          prop="department"
          :label="$t('department.departmentName')"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="position"
          :label="$t('position.positionName')"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="competencyName"
          :label="$t('competency.competencyName')"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="assessmentMethod"
          :label="$t('competency.assessmentMethod')"
          width="120"
          align="center"
        >
          <template #default="scope">
            <el-tag :type="getMethodTagType(scope.row.assessmentMethod)">
              {{ getMethodLabel(scope.row.assessmentMethod) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="assessor"
          :label="$t('competency.assessor')"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="scheduledDate"
          :label="$t('assessment.scheduledDate')"
          width="150"
          align="center"
        />
        <el-table-column
          prop="actualDate"
          :label="$t('assessment.actualDate')"
          width="150"
          align="center"
        />
        <el-table-column
          prop="score"
          :label="$t('assessment.score')"
          width="100"
          align="center"
        >
          <template #default="scope">
            <el-tag v-if="scope.row.score !== null" :type="getScoreTagType(scope.row.score)">
              {{ scope.row.score }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="level"
          :label="$t('competency.competencyLevel')"
          width="120"
          align="center"
        >
          <template #default="scope">
            <el-tag v-if="scope.row.level" :type="getLevelTagType(scope.row.level)">
              {{ $t(`competency.${scope.row.level}`) }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          :label="$t('common.status')"
          width="100"
          align="center"
          fixed="right"
        >
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.operate')"
          width="180"
          fixed="right"
          align="center"
        >
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'pending'"
              type="primary"
              :icon="Edit"
              circle
              size="small"
              @click="handleAssess(scope.row)"
              :title="$t('competency.assessment')"
            />
            <el-button
              v-else
              type="info"
              :icon="View"
              circle
              size="small"
              @click="handleView(scope.row)"
              :title="$t('common.view')"
            />
            <el-button
              type="warning"
              :icon="Edit"
              circle
              size="small"
              @click="handleEdit(scope.row)"
              :title="$t('common.edit')"
            />
            <el-button
              type="danger"
              :icon="Delete"
              circle
              size="small"
              @click="handleDelete(scope.row)"
              :title="$t('common.delete')"
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

    <!-- 评估对话框 -->
    <el-dialog
      v-model="assessDialogVisible"
      :title="$t('competency.assessment')"
      width="600px"
      @close="handleAssessDialogClose"
    >
      <el-form
        ref="assessFormRef"
        :model="assessFormData"
        :rules="assessFormRules"
        label-width="120px"
      >
        <el-form-item :label="$t('competency.competencyName')">
          <el-input v-model="assessFormData.competencyName" readonly />
        </el-form-item>
        <el-form-item :label="$t('user.realName')">
          <el-input v-model="assessFormData.employeeName" readonly />
        </el-form-item>
        <el-form-item :label="$t('competency.assessmentMethod')">
          <el-input v-model="assessFormData.assessmentMethod" readonly />
        </el-form-item>
        <el-form-item :label="$t('assessment.actualDate')" prop="actualDate">
          <el-date-picker
            v-model="assessFormData.actualDate"
            type="date"
            :placeholder="$t('common.pleaseSelect')"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="$t('assessment.score')" prop="score">
          <el-input-number
            v-model="assessFormData.score"
            :min="0"
            :max="100"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="$t('competency.competencyLevel')" prop="level">
          <el-select
            v-model="assessFormData.level"
            :placeholder="$t('common.pleaseSelect')"
            style="width: 100%"
          >
            <el-option :label="$t('competency.understand')" value="understand" />
            <el-option :label="$t('competency.master')" value="master" />
            <el-option :label="$t('competency.proficient')" value="proficient" />
            <el-option :label="$t('competency.expert')" value="expert" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('assessment.comment')" prop="comment">
          <el-input
            v-model="assessFormData.comment"
            type="textarea"
            :rows="3"
            :placeholder="$t('common.pleaseEnter') + $t('assessment.comment')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleAssessDialogClose">
          {{ $t('common.cancel') }}
        </el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleAssessSubmit">
          {{ $t('common.save') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
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

const { t } = useI18n()

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const assessDialogVisible = ref(false)
const tableRef = ref()
const assessFormRef = ref()
const selectedRows = ref([])

// 搜索表单
const searchForm = reactive({
  employeeName: '',
  department: '',
  competencyName: '',
  assessmentMethod: '',
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

// 评估表单数据
const assessFormData = reactive({
  id: null,
  competencyName: '',
  employeeName: '',
  assessmentMethod: '',
  actualDate: '',
  score: null,
  level: 'understand',
  comment: ''
})

// 评估表单验证规则
const assessFormRules = reactive({
  actualDate: [
    { required: true, message: computed(() => t('validation.required', { field: t('assessment.actualDate') })).value, trigger: 'change' }
  ],
  score: [
    { required: true, message: computed(() => t('validation.required', { field: t('assessment.score') })).value, trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: t('validation.scoreRange'), trigger: 'blur' }
  ],
  level: [
    { required: true, message: computed(() => t('validation.required', { field: t('competency.competencyLevel') })).value, trigger: 'change' }
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
    const response = await competencyAPI.getAssessments(params)
    tableData.value = response.data.results || []
    pagination.total = response.data.count || 0
  } catch (error) {
    ElMessage.error(t('message.loadingDataFailed'))
    console.error('加载评估数据失败:', error)
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
    employeeName: '',
    department: '',
    competencyName: '',
    assessmentMethod: '',
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
  ElMessage.info(t('message.addDeveloping'))
}

const handleView = (row) => {
  // 查看详情
  ElMessage.info(t('message.viewDeveloping'))
}

const handleEdit = (row) => {
  ElMessage.info(t('message.editDeveloping'))
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(t('message.confirmDelete'), t('common.tip'), {
      type: 'warning'
    })
    ElMessage.success(t('message.deleteSuccess'))
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('message.deleteFailed'))
    }
  }
}

const handleAssess = (row) => {
  assessFormData.id = row.id
  assessFormData.competencyName = row.competencyName
  assessFormData.employeeName = row.employeeName
  assessFormData.assessmentMethod = getMethodLabel(row.assessmentMethod)
  assessDialogVisible.value = true
}

const handleAssessSubmit = async () => {
  try {
    await assessFormRef.value.validate()
    submitLoading.value = true
    
    // 模拟提交评估结果
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success(t('message.assessSuccess'))
    assessDialogVisible.value = false
    loadData()
  } catch (error) {
    if (error !== false) {
      ElMessage.error(t('message.assessFailed'))
      console.error('提交评估失败:', error)
    }
  } finally {
    submitLoading.value = false
  }
}

const handleAssessDialogClose = () => {
  assessDialogVisible.value = false
  assessFormRef.value?.resetFields()
  Object.assign(assessFormData, {
    id: null,
    competencyName: '',
    employeeName: '',
    assessmentMethod: '',
    actualDate: '',
    score: null,
    level: 'understand',
    comment: ''
  })
}

const handleExport = () => {
  ElMessage.info(t('message.exportDeveloping'))
}

// 辅助方法
const getMethodLabel = (method) => {
  const labels = {
    written_exam: t('competency.writtenExam'),
    practical_exam: t('competency.practicalExam'),
    interview: t('competency.interview'),
    project_evaluation: t('competency.projectEvaluation')
  }
  return labels[method] || method
}

const getMethodTagType = (method) => {
  const types = {
    written_exam: 'primary',
    practical_exam: 'success',
    interview: 'warning',
    project_evaluation: 'info'
  }
  return types[method] || 'info'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: t('assessment.pending'),
    in_progress: t('assessment.inProgress'),
    completed: t('common.completed')
  }
  return labels[status] || status
}

const getStatusTagType = (status) => {
  const types = {
    pending: 'warning',
    in_progress: 'primary',
    completed: 'success'
  }
  return types[status] || 'info'
}

const getScoreTagType = (score) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'primary'
  if (score >= 60) return 'warning'
  return 'danger'
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
  // 模拟数据
  tableData.value = [
    {
      id: 1,
      employeeName: '张三',
      employeeId: 'EMP001',
      department: '生产部',
      position: '操作工',
      competencyName: '设备操作能力',
      assessmentMethod: 'practical_exam',
      assessor: '李经理',
      scheduledDate: '2024-01-15',
      actualDate: '2024-01-15',
      score: 85,
      level: 'master',
      status: 'completed'
    },
    {
      id: 2,
      employeeName: '李四',
      employeeId: 'EMP002',
      department: '质量部',
      position: '质检员',
      competencyName: '质量检测能力',
      assessmentMethod: 'written_exam',
      assessor: '王主管',
      scheduledDate: '2024-01-20',
      actualDate: null,
      score: null,
      level: null,
      status: 'pending'
    }
  ]
  pagination.total = tableData.value.length
})
</script>

<style scoped>
.page-container {
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

/* 英文界面优化 */
:global(.language-en) .search-form {
  gap: 12px;
}

:global(.language-en) .search-form .el-form-item {
  margin-bottom: 12px;
}

:global(.language-en) .el-table .el-button--small {
  padding: 5px;
  margin: 0 2px;
}

:global(.language-en) .el-form-item__label {
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
  }
  
  .search-form .el-form-item {
    margin-right: 0;
    margin-bottom: 10px;
    width: 100%;
  }
  
  .search-form .el-form-item .el-input,
  .search-form .el-form-item .el-select {
    width: 100% !important;
  }
  
  .pagination {
    justify-content: center;
  }
  
  .page-header .el-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .page-header .el-col {
    width: 100%;
    text-align: left !important;
  }
}
</style>