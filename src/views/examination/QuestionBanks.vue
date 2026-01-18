<template>
  <div class="page-container">
    <!-- 页头 -->
    <div class="page-header">
      <el-row justify="space-between" align="middle">
        <el-col :span="12"><h2>{{ $t('nav.questionBanks') }}</h2></el-col>
        <el-col :span="12" style="text-align:right">
          <el-button :icon="Download" @click="handleExport">{{ $t('common.export') }}</el-button>
          <el-button
            :icon="Delete"
            type="danger"
            :disabled="selectedRows.length===0"
            @click="handleBatchDelete"
          >{{ $t('common.batchDelete') }}</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索卡片 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item :label="$t('exam.questionBankName')">
          <el-input v-model="searchForm.search" clearable :placeholder="$t('common.pleaseEnter') + $t('exam.questionBankName')" />
        </el-form-item>
        <el-form-item :label="$t('exam.questionBankCategory')">
          <el-input v-model="searchForm.category" clearable :placeholder="$t('common.pleaseEnter') + $t('exam.questionBankCategory')" />
        </el-form-item>
        <el-form-item :label="$t('common.status')">
          <el-select v-model="searchForm.is_active" clearable :placeholder="$t('common.all')">
            <el-option :label="$t('common.enabled')" :value="true" />
            <el-option :label="$t('common.disabled')" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">{{ $t('common.search') }}</el-button>
          <el-button :icon="Refresh" @click="handleReset">{{ $t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据卡片 -->
    <el-card class="table-card">
      <template #header>
        <el-row align="middle">
          <el-col :span="12">
            <el-button type="primary" :icon="Plus" @click="handleAdd">{{ $t('common.add') + $t('exam.questionBank') }}</el-button>
          </el-col>
          <el-col :span="12" style="text-align:right">
            <el-tag>{{ $t('common.total') }}：{{ pagination.total }}</el-tag>
          </el-col>
        </el-row>
      </template>

      <el-table
        ref="tableRef"
        :data="tableData"
        v-loading="loading"
        stripe
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="code" :label="$t('exam.questionBankCode')" width="120" />
        <el-table-column prop="name" :label="$t('exam.questionBankName')" min-width="180" show-overflow-tooltip />
        <el-table-column prop="category" :label="$t('exam.questionBankCategory')" width="120" />
        <el-table-column prop="question_count" :label="$t('common.questionCount')" width="100" align="center" />
        <el-table-column prop="total_score" :label="$t('common.totalScore')" width="100" align="center" />
        <el-table-column prop="is_active" :label="$t('common.status')" width="90" align="center">
          <template #default="{row}">
            <el-tag :type="row.is_active?'success':'danger'">{{ row.is_active? $t('common.enabled') : $t('common.disabled') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_by_name" :label="$t('common.creator')" width="120" />
        <el-table-column prop="created_at" :label="$t('common.createTime')" width="160" />
        <el-table-column :label="$t('common.operate')" width="200" fixed="right" align="center">
          <template #default="{row}">
            <el-button type="primary" :icon="View" link @click="handleView(row)" :title="$t('common.view')" />
            <el-button type="primary" :icon="Edit" link @click="handleEdit(row)" :title="$t('common.edit')" />
            <el-button type="primary" :icon="Notebook" link @click="handleManageQuestions(row)" :title="$t('exam.questionManagement')" />
            <el-button type="danger" :icon="Delete" link @click="handleDelete(row)" :title="$t('common.delete')" />
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10,20,50,100]"
        layout="total,sizes,prev,pager,next,jumper"
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 新增/编辑弹窗（优化英文支持） -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle" 
      :width="dialogWidth" 
      @close="handleDialogClose"
      class="question-bank-dialog"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="auto">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('exam.questionBankCode')" prop="code">
              <el-input v-model="formData.code" :placeholder="$t('common.pleaseEnter') + $t('exam.questionBankCode')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('exam.questionBankName')" prop="name">
              <el-input v-model="formData.name" :placeholder="$t('common.pleaseEnter') + $t('exam.questionBankName')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="$t('exam.questionBankCategory')" prop="category">
          <el-input v-model="formData.category" :placeholder="$t('common.pleaseEnter') + $t('exam.questionBankCategory')" />
        </el-form-item>
        <el-form-item :label="$t('common.description')" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="4" :placeholder="$t('common.pleaseEnter') + $t('common.description')" />
        </el-form-item>
        <el-form-item :label="$t('common.status')" prop="is_active">
          <el-radio-group v-model="formData.is_active">
            <el-radio :value="true">{{ $t('common.enabled') }}</el-radio>
            <el-radio :value="false">{{ $t('common.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 题目管理抽屉（优化英文支持） -->
    <el-dialog 
      v-model="questionDialogVisible" 
      :title="$t('exam.questionManagement')" 
      :width="questionDialogWidth"
      class="question-management-dialog"
    >
      <div v-if="currentQuestionBank" class="question-header">
        <div class="question-bank-info">
          <h3>{{ currentQuestionBank.name }}</h3>
          <div class="question-bank-meta">
            <el-tag size="small">{{ currentQuestionBank.code }}</el-tag>
            <el-tag size="small" :type="currentQuestionBank.is_active?'success':'danger'">
              {{ currentQuestionBank.is_active? $t('common.enabled') : $t('common.disabled') }}
            </el-tag>
          </div>
        </div>
        <div class="question-actions">
          <el-button type="primary" :icon="Plus" @click="handleAddQuestion">{{ $t('common.add') }}</el-button>
          <el-button :icon="Upload" @click="handleImportQuestions">{{ $t('common.import') }}</el-button>
        </div>
      </div>
      <el-table :data="questionData" stripe border style="margin-top:16px">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="question_type_name" :label="$t('question.type')" width="120" />
        <el-table-column prop="content" :label="$t('question.content')" min-width="350" show-overflow-tooltip />
        <el-table-column prop="difficulty_name" :label="$t('question.difficulty')" width="100" align="center" />
        <el-table-column prop="score" :label="$t('question.score')" width="100" align="center" />
        <el-table-column prop="is_active" :label="$t('common.status')" width="100" align="center">
          <template #default="{row}">
            <el-tag :type="row.is_active?'success':'danger'" size="small">{{ row.is_active? $t('common.enabled') : $t('common.disabled') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operate')" width="200" fixed="right" align="center">
          <template #default="{row}">
            <el-button type="primary" :icon="Edit" link @click="handleEditQuestion(row)" :title="$t('common.edit')" />
            <el-button type="danger" :icon="Delete" link @click="handleDeleteQuestion(row)" :title="$t('common.delete')" />
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="questionPagination.current"
        v-model:page-size="questionPagination.size"
        :total="questionPagination.total"
        :page-sizes="[10,20,50]"
        layout="total,sizes,prev,pager,next,jumper"
        class="pagination"
        @size-change="handleQuestionSizeChange"
        @current-change="handleQuestionCurrentChange"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Delete, Download, Search, Refresh, View, Edit, Notebook, Upload
} from '@element-plus/icons-vue'
import { examAPI } from '@/api'

const { t } = useI18n()

/* ---------------- 表格 / 分页 ---------------- */
const tableRef = ref()
const tableData = ref([])
const loading = ref(false)
const selectedRows = ref([])

const pagination = reactive({ current: 1, size: 10, total: 0 })
const searchForm = reactive({ search: '', category: '', is_active: null })

/* ---------------- 弹窗 ---------------- */
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const formRef = ref()
const submitLoading = ref(false)

// 动态计算弹窗宽度
const dialogWidth = computed(() => {
  const isEn = document.documentElement.lang === 'en' || navigator.language.startsWith('en')
  return isEn ? '700px' : '600px'
})

const questionDialogWidth = computed(() => {
  const isEn = document.documentElement.lang === 'en' || navigator.language.startsWith('en')
  return isEn ? '1300px' : '1200px'
})

const formData = reactive({
  id: null,
  code: '',
  name: '',
  description: '',
  category: '',
  is_active: true
})
const formRules = {
  code: [{ required: true, message: computed(() => t('validation.required', { field: t('exam.questionBankCode') })).value, trigger: 'blur' }],
  name: [{ required: true, message: computed(() => t('validation.required', { field: t('exam.questionBankName') })).value, trigger: 'blur' }],
  category: [{ required: true, message: computed(() => t('validation.required', { field: t('exam.questionBankCategory') })).value, trigger: 'blur' }]
}

/* ---------------- 题目管理 ---------------- */
const questionDialogVisible = ref(false)
const currentQuestionBank = ref(null)
const questionData = ref([])
const questionPagination = reactive({ current: 1, size: 10, total: 0 })

/* ---------------- 样式 ---------------- */
const getStatusType = (active) => (active ? 'success' : 'danger')

/* ---------------- 数据加载 ---------------- */
const loadTableData = async () => {
  loading.value = true
  try {
    const params = { page: pagination.current, size: pagination.size, ...searchForm }
    Object.keys(params).forEach(k => params[k] === '' && delete params[k])
    const { data } = await examAPI.getQuestionBanks(params)
    tableData.value = data.results || []
    pagination.total = data.count || 0
  } catch {
    ElMessage.error(t('message.loadingDataFailed'))
  } finally {
    loading.value = false
  }
}
const loadQuestionData = async () => {
  try {
    const { data } = await examAPI.getQuestions({
      page: questionPagination.current,
      size: questionPagination.size,
      question_bank: currentQuestionBank.value.id
    })
    questionData.value = data.results || []
    questionPagination.total = data.count || 0
  } catch (error) {
    console.error('加载题目数据失败:', error)
    ElMessage.error(t('message.loadingDataFailed'))
  }
}

/* ---------------- 业务函数 ---------------- */
const handleSearch = () => { pagination.current = 1; loadTableData() }
const handleReset = () => { Object.assign(searchForm, { search: '', category: '', is_active: null }); handleSearch() }
const handleSizeChange = (size) => { pagination.size = size; loadTableData() }
const handleCurrentChange = (current) => { pagination.current = current; loadTableData() }
const handleSelectionChange = (rows) => (selectedRows.value = rows)

const handleAdd = () => {
  dialogTitle.value = t('common.add') + t('exam.questionBank')
  isEdit.value = false
  Object.assign(formData, { id: null, code: '', name: '', description: '', category: '', is_active: true })
  dialogVisible.value = true
}
const handleEdit = (row) => {
  dialogTitle.value = t('common.edit') + t('exam.questionBank')
  isEdit.value = true
  Object.assign(formData, row)
  dialogVisible.value = true
}
const handleView = (row) => console.log('view', row)
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(t('message.confirmDelete'), t('common.tip'), { type: 'warning' })
    await examAPI.deleteQuestionBank(row.id)
    ElMessage.success(t('message.deleteSuccess'))
    loadTableData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('message.deleteFailed'))
    }
  }
}
const handleBatchDelete = async () => {
  if (!selectedRows.value.length) return ElMessage.warning(t('message.noSelectedItems'))
  try {
    await ElMessageBox.confirm(t('message.confirmBatchDelete'), t('common.tip'), { type: 'warning' })
    await Promise.all(selectedRows.value.map(r => examAPI.deleteQuestionBank(r.id)))
    ElMessage.success(t('message.deleteSuccess'))
    loadTableData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('message.deleteFailed'))
    }
  }
}
const handleExport = () => ElMessage.success(t('message.exportReady'))

/* ---------------- 题目管理 ---------------- */
const handleManageQuestions = (row) => {
  currentQuestionBank.value = row
  questionDialogVisible.value = true
  loadQuestionData()
}
const handleAddQuestion = () => ElMessage.success(t('message.addQuestionDeveloping'))
const handleImportQuestions = () => ElMessage.success(t('message.importQuestionsDeveloping'))
const handleEditQuestion = (row) => ElMessage.success(t('message.editQuestionDeveloping'))
const handleDeleteQuestion = async (row) => {
  try {
    await ElMessageBox.confirm(t('message.confirmDelete'), t('common.tip'), { type: 'warning' })
    await examAPI.deleteQuestion(row.id)
    ElMessage.success(t('message.deleteSuccess'))
    loadQuestionData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('message.deleteFailed'))
    }
  }
}
const handleQuestionSizeChange = (size) => { questionPagination.size = size; loadQuestionData() }
const handleQuestionCurrentChange = (current) => { questionPagination.current = current; loadQuestionData() }

/* ---------------- 提交（两步关闭） ---------------- */
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true
    isEdit.value
      ? await examAPI.updateQuestionBank(formData.id, formData)
      : await examAPI.createQuestionBank(formData)
    ElMessage.success(isEdit.value ? t('message.updateSuccess') : t('message.addSuccess'))
    dialogVisible.value = false
    loadTableData()
  } catch {
    ElMessage.error(isEdit.value ? t('message.updateFailed') : t('message.addFailed'))
  } finally {
    submitLoading.value = false
  }
}

const handleDialogClose = () => formRef.value?.resetFields()

/* ---------------- 挂载 ---------------- */
onMounted(() => loadTableData())
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

.search-card,
.table-card {
  margin-bottom: 16px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.question-bank-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.question-bank-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.question-actions {
  display: flex;
  gap: 10px;
}

/* 弹窗优化 */
.question-bank-dialog .el-form-item__label {
  word-break: break-word;
  white-space: normal;
  line-height: 1.4;
  padding-right: 12px;
}

.question-management-dialog .el-table td {
  word-break: break-word;
}

/* 英文界面优化 */
:global(.language-en) .search-form .el-form-item {
  margin-bottom: 12px;
}

:global(.language-en) .el-table .el-button--small {
  padding: 5px 8px;
  margin: 0 2px;
}

:global(.language-en) .el-table .el-button [class*=el-icon] + span {
  margin-left: 2px;
}

:global(.language-en) .el-form-item__label {
  white-space: nowrap;
}

:global(.language-en) .question-bank-dialog .el-form-item__label {
  white-space: normal;
  min-width: 140px;
}

:global(.language-en) .question-management-dialog {
  max-width: 95vw;
}

/* 响应式设计 */
@media screen and (max-width: 1200px) {
  .search-form {
    flex-direction: column;
  }
  
  .search-form .el-form-item {
    width: 100%;
  }
  
  .search-form .el-form-item .el-input,
  .search-form .el-form-item .el-select {
    width: 100%;
  }
}

@media screen and (max-width: 768px) {
  .page-header .el-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .page-header .el-col {
    width: 100%;
    text-align: left !important;
  }
  
  .question-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .question-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .question-bank-dialog,
  .question-management-dialog {
    width: 95% !important;
    max-width: 95vw !important;
  }
}

/* 移动端优化 */
@media screen and (max-width: 480px) {
  :global(.language-en) .question-bank-dialog .el-form-item__label {
    min-width: 100px;
  }
  
  .el-table .el-button {
    margin: 2px;
  }
}
</style>