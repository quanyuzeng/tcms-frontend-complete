<template>
  <div class="assessments">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-row :gutter="20" align="middle">
        <el-col :span="12">
          <h2>{{ $t('nav.assessments') }}</h2>
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
        <el-form-item :label="$t('user.realName')">
          <el-input
            v-model="searchForm.employeeName"
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
        <el-form-item :label="$t('competency.competencyName')">
          <el-input
            v-model="searchForm.competencyName"
            :placeholder="$t('common.pleaseEnter')"
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
            <el-option :label="$t('笔试')" value="written_exam" />
            <el-option :label="$t('实操考核')" value="practical_exam" />
            <el-option :label="$t('面试评估')" value="interview" />
            <el-option :label="$t('项目评估')" value="project_evaluation" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('common.status')">
          <el-select
            v-model="searchForm.status"
            :placeholder="$t('common.pleaseSelect')"
            clearable
            style="width: 120px"
          >
            <el-option :label="$t('common.pending')" value="pending" />
            <el-option :label="$t('common.inProgress')" value="in_progress" />
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
          :label="$t('common.scheduledDate')"
          width="150"
          align="center"
        />
        <el-table-column
          prop="actualDate"
          :label="$t('common.actualDate')"
          width="150"
          align="center"
        />
        <el-table-column
          prop="score"
          :label="$t('common.score')"
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
            />
            <el-button
              v-else
              type="info"
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
        <el-form-item :label="$t('common.actualDate')" prop="actualDate">
          <el-date-picker
            v-model="assessFormData.actualDate"
            type="date"
            :placeholder="$t('common.pleaseSelect')"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="$t('common.score')" prop="score">
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
        <el-form-item :label="$t('common.comment')" prop="comment">
          <el-input
            v-model="assessFormData.comment"
            type="textarea"
            :rows="3"
            :placeholder="$t('common.pleaseEnter')"
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
    { required: true, message: '请选择实际评估日期', trigger: 'change' }
  ],
  score: [
    { required: true, message: '请输入评估分数', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '分数必须在0-100之间', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请选择能力级别', trigger: 'change' }
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
    ElMessage.error('加载数据失败')
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
  ElMessage.info('新增功能开发中...')
}

const handleView = (row) => {
  // 查看详情
  ElMessage.info('查看功能开发中...')
}

const handleEdit = (row) => {
  ElMessage.info('编辑功能开发中...')
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该评估记录吗？', '提示', {
      type: 'warning'
    })
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
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
    
    ElMessage.success('评估完成')
    assessDialogVisible.value = false
    loadData()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('评估失败')
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
  ElMessage.info('导出功能开发中...')
}

// 辅助方法
const getMethodLabel = (method) => {
  const labels = {
    written_exam: '笔试',
    practical_exam: '实操考核',
    interview: '面试评估',
    project_evaluation: '项目评估'
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
    pending: '待评估',
    in_progress: '评估中',
    completed: '已完成'
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
.assessments {
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