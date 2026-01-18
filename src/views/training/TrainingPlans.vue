<template>
  <div class="page-container">
    <div class="page-header">
      <h2>{{ $t("nav.trainingRecords") }}</h2>
    </div>

    <div class="page-content">
      <!-- 搜索 -->
      <div class="search-form">
        <el-form :inline="true" :model="searchForm">
          <el-form-item :label="$t('user.realName')">
            <el-input v-model="searchForm.user_name" :placeholder="$t('common.pleaseEnter') + $t('user.realName')" />
          </el-form-item>
          <el-form-item :label="$t('course.courseName')">
            <el-input v-model="searchForm.course_name" :placeholder="$t('common.pleaseEnter') + $t('course.courseName')" />
          </el-form-item>
          <el-form-item :label="$t('training.status')">
            <el-select v-model="searchForm.status" :placeholder="$t('common.all')" clearable>
              <el-option :label="$t('training.notStarted')" value="not_started" />
              <el-option :label="$t('training.inProgress')" value="in_progress" />
              <el-option :label="$t('training.completed')" value="completed" />
              <el-option :label="$t('training.failed')" value="failed" />
              <el-option :label="$t('training.expired')" value="expired" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">{{ $t("common.search") }}</el-button>
            <el-button @click="handleReset">{{ $t("common.reset") }}</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 工具栏 -->
      <div class="action-buttons">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>{{ $t('training.addRecord') }}
        </el-button>
        <el-button @click="handleBatchDelete" :disabled="selectedRows.length === 0">
          <el-icon><Delete /></el-icon>{{ $t('common.batchDelete') }}
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>{{ $t('training.exportRecords') }}
        </el-button>
      </div>

      <!-- 表格 -->
      <el-table ref="tableRef" :data="tableData" v-loading="loading" row-key="id" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="user_name" :label="$t('user.realName')" width="120" />
        <el-table-column prop="user_employee_id" :label="$t('user.employeeId')" width="120" />
        <el-table-column prop="course_title" :label="$t('course.courseName')" min-width="200" show-overflow-tooltip />
        <el-table-column prop="course_code" :label="$t('course.courseCode')" width="120" />
        <el-table-column prop="training_plan_title" :label="$t('training.trainingPlan')" width="150" show-overflow-tooltip />
        <el-table-column prop="status_name" :label="$t('training.status')" width="100" align="center">
          <template #default="{ row }"><el-tag :type="getStatusType(row.status)">{{ row.status_name }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="progress" :label="$t('training.progress')" width="120" align="center">
          <template #default="{ row }">
            <el-progress v-if="row.progress !== null" :percentage="Math.round(row.progress)" :stroke-width="15" :text-inside="true" />
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="study_duration_human" :label="$t('training.studyDuration')" width="100" align="center" />
        <el-table-column prop="score" :label="$t('training.score')" width="100" align="center">
          <template #default="{ row }"><span v-if="row.score !== null">{{ row.score }}{{ $t('exam.point') }}</span><span v-else>--</span></template>
        </el-table-column>
        <el-table-column prop="start_date" :label="$t('training.startDate')" width="180" />
        <el-table-column prop="complete_date" :label="$t('training.completeDate')" width="180" />
        <el-table-column prop="evaluator_name" :label="$t('training.evaluator')" width="120" />
        <el-table-column :label="$t('common.operate')" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">{{ $t("common.view") }}</el-button>
            <el-button type="primary" link @click="handleEdit(row)">{{ $t("common.edit") }}</el-button>
            <el-button type="primary" link @click="handleEvaluate(row)">{{ $t('training.evaluate') }}</el-button>
            <el-button type="danger" link @click="handleDelete(row)">{{ $t("common.delete") }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination v-model:current-page="pagination.current" v-model:page-size="pagination.size" :total="pagination.total"
          :page-sizes="[10,20,50,100]" layout="total,sizes,prev,pager,next,jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px" @close="handleDialogClose">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('user.employee')" prop="user">
              <el-select v-model="formData.user" :placeholder="$t('common.pleaseSelect') + $t('user.employee')" style="width:100%" filterable>
                <el-option v-for="u in userOptions" :key="u.id" :label="u.first_name + u.last_name" :value="u.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('course.course')" prop="course">
              <el-select v-model="formData.course" :placeholder="$t('common.pleaseSelect') + $t('course.course')" style="width:100%" filterable>
                <el-option v-for="c in courseOptions" :key="c.id" :label="c.title" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('training.trainingPlan')" prop="training_plan">
              <el-select v-model="formData.training_plan" :placeholder="$t('common.pleaseSelect') + $t('training.trainingPlan')" style="width:100%" clearable>
                <el-option v-for="p in planOptions" :key="p.id" :label="p.title" :value="p.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('training.status')" prop="status">
              <el-select v-model="formData.status" :placeholder="$t('common.pleaseSelect') + $t('training.status')" style="width:100%">
                <el-option :label="$t('training.notStarted')" value="not_started" />
                <el-option :label="$t('training.inProgress')" value="in_progress" />
                <el-option :label="$t('training.completed')" value="completed" />
                <el-option :label="$t('training.failed')" value="failed" />
                <el-option :label="$t('training.expired')" value="expired" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('training.progress')" prop="progress">
              <el-input-number v-model="formData.progress" :min="0" :max="100" :precision="1" style="width:100%">
                <template #append>%</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('training.score')" prop="score">
              <el-input-number v-model="formData.score" :min="0" :max="100" :precision="1" style="width:100%">
                <template #append>{{ $t('exam.point') }}</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('training.startDate')" prop="start_date">
              <el-date-picker v-model="formData.start_date" type="datetime" :placeholder="$t('common.pleaseSelect') + $t('training.startDate')" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('training.completeDate')" prop="complete_date">
              <el-date-picker v-model="formData.complete_date" type="datetime" :placeholder="$t('common.pleaseSelect') + $t('training.completeDate')" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="$t('common.notes')" prop="notes">
          <el-input v-model="formData.notes" type="textarea" :rows="4" :placeholder="$t('common.pleaseEnter') + $t('common.notes')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogClose">{{ $t("common.cancel") }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ $t("common.confirm") }}</el-button>
      </template>
    </el-dialog>

    <!-- 评估弹窗 -->
    <el-dialog v-model="evaluateDialogVisible" :title="$t('training.evaluate')" width="600px">
      <el-form ref="evaluateFormRef" :model="evaluateForm" :rules="evaluateFormRules" label-width="120px">
        <el-form-item :label="$t('training.score')" prop="score">
          <el-input-number v-model="evaluateForm.score" :min="0" :max="100" :precision="1" style="width:100%">
            <template #append>{{ $t('exam.point') }}</template>
          </el-input-number>
        </el-form-item>
        <el-form-item :label="$t('training.evaluator')" prop="evaluator">
          <el-input :value="evaluateForm.evaluator_name" disabled />
        </el-form-item>
        <el-form-item :label="$t('assessment.evaluationDate')" prop="evaluation_date">
          <el-date-picker v-model="evaluateForm.evaluation_date" type="datetime" :placeholder="$t('common.pleaseSelect') + $t('assessment.evaluationDate')" style="width:100%" />
        </el-form-item>
        <el-form-item :label="$t('assessment.evaluationNotes')" prop="notes">
          <el-input v-model="evaluateForm.notes" type="textarea" :rows="4" :placeholder="$t('common.pleaseEnter') + $t('assessment.evaluationNotes')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="evaluateDialogVisible = false">{{ $t("common.cancel") }}</el-button>
        <el-button type="primary" :loading="evaluateLoading" @click="handleEvaluateSubmit">{{ $t("common.confirm") }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Download } from '@element-plus/icons-vue'
import { trainingRecordAPI, courseAPI, trainingPlanAPI, userAPI } from '@/api/training'
import { useAuthStore } from '@/store/auth'

const { t } = useI18n()
const authStore = useAuthStore()

/* -------- 弹窗状态 -------- */
const dialogVisible = ref(false)
const evaluateDialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const evaluateLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()
const evaluateFormRef = ref()

/* -------- 表格 / 分页 -------- */
const tableRef = ref()
const tableData = ref([])
const loading = ref(false)
const selectedRows = ref([])

const pagination = reactive({ current: 1, size: 10, total: 0 })
const searchForm = reactive({ user_name: '', course_name: '', status: '' })

/* -------- 表单数据 -------- */
const formData = reactive({
  id: null, user: null, course: null, training_plan: null, status: 'not_started',
  progress: 0, score: null, start_date: '', complete_date: '', notes: ''
})
const evaluateForm = reactive({
  id: null, score: null, evaluator: authStore.user?.id,
  evaluator_name: authStore.user?.first_name + authStore.user?.last_name,
  evaluation_date: new Date(), notes: ''
})

const formRules = {
  user: [{ required: true, message: computed(() => t('validation.required', { field: t('user.employee') })).value, trigger: 'change' }],
  course: [{ required: true, message: computed(() => t('validation.required', { field: t('course.course') })).value, trigger: 'change' }],
  status: [{ required: true, message: computed(() => t('validation.required', { field: t('training.status') })).value, trigger: 'change' }]
}
const evaluateFormRules = {
  score: [{ required: true, message: computed(() => t('validation.required', { field: t('training.score') })).value, trigger: 'blur' }]
}

/* -------- 计算属性 -------- */
const addButtonText = computed(() => {
  return t('common.add') + t('nav.trainingRecords')
})

const editButtonText = computed(() => {
  return t('common.edit') + t('nav.trainingRecords')
})

/* -------- 两步关闭（主弹窗） -------- */
const handleDialogClose = () => { dialogVisible.value = false }
watch(dialogVisible, val => {
  if (!val) {
    formRef.value?.resetFields()
    Object.assign(formData, {
      id: null, user: null, course: null, training_plan: null, status: 'not_started',
      progress: 0, score: null, start_date: '', complete_date: '', notes: ''
    })
    isEdit.value = false
  }
})

/* -------- 打开弹窗 -------- */
const handleAdd = () => {
  dialogTitle.value = addButtonText.value
  isEdit.value = false
  dialogVisible.value = true
}
const handleEdit = async (row) => {
  dialogTitle.value = editButtonText.value
  isEdit.value = true
  dialogVisible.value = true
  Object.assign(formData, {
    id: row.id, user: row.user, course: row.course, training_plan: row.training_plan,
    status: row.status, progress: row.progress, score: row.score,
    start_date: row.start_date, complete_date: row.complete_date, notes: row.notes
  })
}

/* -------- 提交 -------- */
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true
    isEdit.value
      ? await trainingRecordAPI.updateRecord(formData.id, formData)
      : await trainingRecordAPI.createRecord(formData)
    ElMessage.success(isEdit.value ? t('message.updateSuccess') : t('message.addSuccess'))
    handleDialogClose()
    loadTableData()
  } catch {
    ElMessage.error(isEdit.value ? t('message.updateFailed') : t('message.addFailed'))
  } finally {
    submitLoading.value = false
  }
}

/* -------- 评估 -------- */
const handleEvaluate = (row) => {
  evaluateDialogVisible.value = true
  evaluateForm.id = row.id
  evaluateForm.score = row.score || null
  evaluateForm.evaluation_date = new Date()
}
const handleEvaluateSubmit = async () => {
  try {
    await evaluateFormRef.value.validate()
    evaluateLoading.value = true
    await trainingRecordAPI.updateRecord(evaluateForm.id, {
      score: evaluateForm.score,
      evaluator: evaluateForm.evaluator,
      evaluation_date: evaluateForm.evaluation_date,
      notes: evaluateForm.notes
    })
    ElMessage.success(t('message.evaluateSuccess'))
    evaluateDialogVisible.value = false
    loadTableData()
  } catch {
    ElMessage.error(t('message.evaluateFailed'))
  } finally {
    evaluateLoading.value = false
  }
}

/* -------- 其余业务 -------- */
const loadTableData = async () => {
  loading.value = true
  try {
    const params = { page: pagination.current, size: pagination.size, ...searchForm }
    Object.keys(params).forEach(k => params[k] === '' && delete params[k])
    const { data } = await trainingRecordAPI.getRecords(params)
    tableData.value = data.results || []
    pagination.total = data.count || 0
  } catch {
    ElMessage.error(t('message.loadingDataFailed'))
  } finally {
    loading.value = false
  }
}
const handleSearch = () => { pagination.current = 1; loadTableData() }
const handleReset = () => { Object.assign(searchForm, { user_name: '', course_name: '', status: '' }); handleSearch() }
const handleSizeChange = size => { pagination.size = size; loadTableData() }
const handleCurrentChange = current => { pagination.current = current; loadTableData() }
const handleSelectionChange = rows => (selectedRows.value = rows)
const handleView = row => console.log('view', row)
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(t('message.confirmDelete'), t('common.tip'), { type: 'warning' })
    await trainingRecordAPI.deleteRecord(row.id)
    ElMessage.success(t('message.deleteSuccess'))
    loadTableData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error(t('message.deleteFailed'))
    }
  }
}
const handleBatchDelete = async () => {
  if (!selectedRows.value.length) return ElMessage.warning(t('message.noSelectedItems'))
  try {
    await ElMessageBox.confirm(t('message.confirmBatchDelete'), t('common.tip'), { type: 'warning' })
    const ids = selectedRows.value.map(r => r.id)
    await trainingRecordAPI.batchDeleteRecords(ids)
    ElMessage.success(t('message.deleteSuccess'))
    loadTableData()
    selectedRows.value = []
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error(t('message.deleteFailed'))
    }
  }
}
const handleExport = () => ElMessage.success(t('message.exportReady'))

/* -------- 下拉数据 -------- */
const courseOptions = ref([])
const planOptions = ref([])
const userOptions = ref([])
const loadCourseOptions = async () => {
  try {
    const { data } = await courseAPI.getCourses({ size: 1000 })
    courseOptions.value = data.results || []
  } catch (error) {
    console.error('加载课程选项失败:', error)
    ElMessage.error(t('message.loadDataFailed'))
  }
}
const loadPlanOptions = async () => {
  try {
    const { data } = await trainingPlanAPI.getPlans({ size: 1000 })
    planOptions.value = data.results || []
  } catch (error) {
    console.error('加载培训计划选项失败:', error)
    ElMessage.error(t('message.loadDataFailed'))
  }
}
const loadUserOptions = async () => {
  try {
    const { data } = await userAPI.getUsers({ size: 1000, is_active: true })
    userOptions.value = data.results || []
  } catch (error) {
    console.error('加载用户选项失败:', error)
    ElMessage.error(t('message.loadDataFailed'))
  }
}
const getStatusType = status => ({
  not_started: 'info', in_progress: 'primary', completed: 'success', failed: 'danger', expired: 'warning'
}[status] || 'info')

onMounted(() => {
  loadTableData()
  loadCourseOptions()
  loadPlanOptions()
  loadUserOptions()
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

.el-table {
  margin-top: 10px;
}

.el-form-item {
  margin-bottom: 18px;
}

.el-dialog .el-form-item:last-child {
  margin-bottom: 0;
}

.el-button + .el-button {
  margin-left: 10px;
}

/* 英文界面优化：按钮和表格适配 */
:global(.language-en) .action-buttons .el-button {
  min-width: 120px;
}

:global(.language-en) .el-table .el-button--small {
  padding: 5px 8px;
}
</style>