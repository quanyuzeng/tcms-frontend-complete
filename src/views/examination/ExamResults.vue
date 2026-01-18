<template>
  <div class="page-container">
    <div class="page-header">
      <h2>{{ $t("nav.examResults") }}</h2>
    </div>

    <div class="page-content">
      <!-- 搜索表单 -->
      <div class="search-form">
        <el-form :inline="true" :model="searchForm">
          <el-form-item :label="$t('user.realName')">
            <el-input v-model="searchForm.user_name" :placeholder="$t('common.pleaseEnter') + $t('user.realName')" />
          </el-form-item>
          <el-form-item :label="$t('exam.examName')">
            <el-input v-model="searchForm.exam_title" :placeholder="$t('common.pleaseEnter') + $t('exam.examName')" />
          </el-form-item>
          <el-form-item :label="$t('common.status')">
            <el-select v-model="searchForm.status" :placeholder="$t('common.all')" clearable>
              <el-option :label="$t('exam.inProgress')" value="in_progress" />
              <el-option :label="$t('exam.completed')" value="completed" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('exam.isPassed')">
            <el-select v-model="searchForm.is_passed" :placeholder="$t('common.all')" clearable>
              <el-option :label="$t('exam.passed')" :value="true" />
              <el-option :label="$t('exam.failed')" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">{{ $t("common.search") }}</el-button>
            <el-button @click="handleReset">{{ $t("common.reset") }}</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" @click="handleExport">
          <el-icon><Download /></el-icon>
          {{ $t('exam.exportResults') }}
        </el-button>
        <el-button @click="handleGenerateCertificate" :disabled="selectedRows.length === 0">
          <el-icon><Document /></el-icon>
          {{ $t('exam.generateCertificate') }}
        </el-button>
      </div>

      <!-- 数据表格 -->
      <el-table
        ref="tableRef"
        :data="tableData"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        row-key="id"
        border
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="user_name" :label="$t('user.realName')" width="120" />
        <el-table-column prop="user_employee_id" :label="$t('user.employeeId')" width="120" />
        <el-table-column prop="exam_title" :label="$t('exam.examName')" min-width="200" show-overflow-tooltip />
        <el-table-column prop="exam_code" :label="$t('exam.examCode')" width="120" />
        <el-table-column prop="score" :label="$t('exam.score')" width="100" align="center">
          <template #default="{ row }">
            <span :class="{ 'score-pass': row.score >= row.exam_passing_score, 'score-fail': row.score < row.exam_passing_score }">
              {{ row.score }}{{ $t('exam.point') }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="passing_score" :label="$t('exam.passingScore')" width="80" align="center" />
        <el-table-column prop="correct_count" :label="$t('exam.correctCount')" width="100" align="center" />
        <el-table-column prop="wrong_count" :label="$t('exam.wrongCount')" width="100" align="center" />
        <el-table-column prop="unanswered_count" :label="$t('exam.unansweredCount')" width="100" align="center" />
        <el-table-column prop="is_passed" :label="$t('exam.isPassed')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_passed ? 'success' : 'danger'">
              {{ row.is_passed ? $t('exam.passed') : $t('exam.failed') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration_human" :label="$t('exam.duration')" width="120" align="center" />
        <el-table-column prop="start_time" :label="$t('exam.startTime')" width="180" />
        <el-table-column prop="end_time" :label="$t('exam.endTime')" width="180" />
        <el-table-column prop="status_name" :label="$t('common.status')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status_name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="has_certificate" :label="$t('exam.certificate')" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.has_certificate ? 'success' : 'info'">
              {{ row.has_certificate ? $t('exam.hasCertificate') : $t('exam.noCertificate') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operate')" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">{{ $t("common.viewDetails") }}</el-button>
            <el-button type="primary" link @click="handleViewAnswer(row)">{{ $t("exam.viewAnswer") }}</el-button>
            <el-button type="primary" link @click="handleGenerateCertificate(row)" v-if="row.is_passed && !row.has_certificate">{{ $t("exam.generateCertificate") }}</el-button>
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

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="$t('exam.resultDetails')"
      width="1000px"
    >
      <div v-if="currentDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('exam.examName')">{{ currentDetail.exam_title }}</el-descriptions-item>
          <el-descriptions-item :label="$t('exam.examCode')">{{ currentDetail.exam_code }}</el-descriptions-item>
          <el-descriptions-item :label="$t('user.realName')">{{ currentDetail.user_name }}</el-descriptions-item>
          <el-descriptions-item :label="$t('user.employeeId')">{{ currentDetail.user_employee_id }}</el-descriptions-item>
          <el-descriptions-item :label="$t('exam.score')">
            <span :class="{ 'score-pass': currentDetail.score >= currentDetail.exam_passing_score, 'score-fail': currentDetail.score < currentDetail.exam_passing_score }">
              {{ currentDetail.score }}{{ $t('exam.point') }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('exam.passingScore')">{{ currentDetail.exam_passing_score }}{{ $t('exam.point') }}</el-descriptions-item>
          <el-descriptions-item :label="$t('exam.correctCount')">{{ currentDetail.correct_count }}{{ $t('exam.questionUnit') }}</el-descriptions-item>
          <el-descriptions-item :label="$t('exam.wrongCount')">{{ currentDetail.wrong_count }}{{ $t('exam.questionUnit') }}</el-descriptions-item>
          <el-descriptions-item :label="$t('exam.unansweredCount')">{{ currentDetail.unanswered_count }}{{ $t('exam.questionUnit') }}</el-descriptions-item>
          <el-descriptions-item :label="$t('exam.duration')">{{ currentDetail.duration_human }}</el-descriptions-item>
          <el-descriptions-item :label="$t('exam.startTime')">{{ currentDetail.start_time }}</el-descriptions-item>
          <el-descriptions-item :label="$t('exam.endTime')">{{ currentDetail.end_time }}</el-descriptions-item>
          <el-descriptions-item :label="$t('exam.isPassed')">
            <el-tag :type="currentDetail.is_passed ? 'success' : 'danger'">
              {{ currentDetail.is_passed ? $t('exam.passed') : $t('exam.failed') }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        
        <h4 style="margin-top: 20px;">{{ $t('exam.answerDetails') }}</h4>
        <el-table :data="currentDetail.answers_detail || []" border style="margin-top: 10px;">
          <el-table-column prop="question_id" :label="$t('exam.questionNumber')" width="80" />
          <el-table-column prop="question_content" :label="$t('question.content')" min-width="300" show-overflow-tooltip />
          <el-table-column prop="question_type_name" :label="$t('question.type')" width="100" />
          <el-table-column prop="user_answer" :label="$t('exam.userAnswer')" width="120" align="center" />
          <el-table-column prop="correct_answer" :label="$t('exam.correctAnswer')" width="120" align="center" />
          <el-table-column prop="is_correct" :label="$t('exam.isCorrect')" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.is_correct ? 'success' : 'danger'">
                {{ row.is_correct ? $t('exam.correct') : $t('exam.incorrect') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="score" :label="$t('question.score')" width="80" align="center" />
          <el-table-column prop="explanation" :label="$t('question.explanation')" min-width="200" show-overflow-tooltip />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { examAPI } from '../../api'

const { t } = useI18n()

// 表格相关
const tableRef = ref()
const tableData = ref([])
const loading = ref(false)
const selectedRows = ref([])

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 搜索表单
const searchForm = reactive({
  user_name: '',
  exam_title: '',
  status: '',
  is_passed: null
})

// 对话框
const detailDialogVisible = ref(false)
const currentDetail = ref(null)

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    in_progress: 'primary',
    completed: 'success'
  }
  return types[status] || 'info'
}

// 加载表格数据
const loadTableData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      size: pagination.size,
      ...searchForm
    }
    
    // 移除空值
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    const response = await examAPI.getExamResults(params)
    tableData.value = response.data.results || []
    pagination.total = response.data.count || 0
  } catch (error) {
    console.error('Failed to load exam results:', error)
    ElMessage.error(t('message.loadingDataFailed'))
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadTableData()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    user_name: '',
    exam_title: '',
    status: '',
    is_passed: null
  })
  handleSearch()
}

// 查看详情
const handleView = async (row) => {
  try {
    const response = await examAPI.getExamResultDetails(row.id)
    currentDetail.value = response.data
    detailDialogVisible.value = true
  } catch (error) {
    console.error('Failed to load exam result details:', error)
    ElMessage.error(t('message.loadDetailFailed'))
  }
}

// 查看答卷
const handleViewAnswer = async (row) => {
  try {
    const response = await examAPI.getExamResultDetails(row.id)
    currentDetail.value = response.data
    detailDialogVisible.value = true
  } catch (error) {
    console.error('Failed to load exam answers:', error)
    ElMessage.error(t('message.loadAnswerFailed'))
  }
}

// 生成证书
const handleGenerateCertificate = async (row) => {
  try {
    if (Array.isArray(row) && row.length === 0) {
      ElMessage.warning(t('message.selectCertificateItems'))
      return
    }
    
    if (Array.isArray(row)) {
      // 批量生成证书
      ElMessage.success(t('message.batchGenerateCertificateDeveloping'))
    } else {
      // 单个生成证书
      await examAPI.generateCertificate(row.id)
      ElMessage.success(t('message.generateCertificateSuccess'))
      loadTableData()
    }
  } catch (error) {
    console.error('Failed to generate certificate:', error)
    ElMessage.error(t('message.generateCertificateFailed'))
  }
}

// 导出
const handleExport = () => {
  ElMessage.success(t('message.exportReady'))
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 分页变化
const handleSizeChange = (size) => {
  pagination.size = size
  loadTableData()
}

const handleCurrentChange = (current) => {
  pagination.current = current
  loadTableData()
}

onMounted(() => {
  loadTableData()
})
</script>

<style scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.page-content {
  flex: 1;
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-form {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.action-buttons {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.score-pass {
  color: #67c23a;
  font-weight: bold;
}

.score-fail {
  color: #f56c6c;
  font-weight: bold;
}

/* 英文界面优化 */
:global(.language-en) .action-buttons .el-button {
  min-width: 160px;
}

:global(.language-en) .el-table .el-button {
  padding: 8px 12px;
}

:global(.language-en) .el-descriptions-item__label {
  white-space: nowrap;
}

/* 响应式设计 */
@media screen and (max-width: 1200px) {
  .search-form {
    flex-direction: column;
  }
  
  .search-form .el-form-item {
    width: 100%;
    margin-right: 0;
  }
  
  .search-form .el-form-item .el-input,
  .search-form .el-form-item .el-select {
    width: 100%;
  }
}

@media screen and (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .action-buttons .el-button {
    width: 100%;
    justify-content: center;
  }
  
  .el-table .el-button {
    margin: 2px 0;
  }
}
</style>