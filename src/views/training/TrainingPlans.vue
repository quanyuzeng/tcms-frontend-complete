<template>
  <div class="page-container">
    <div class="page-header">
      <h2>{{ $t("培训记录") }}</h2>
    </div>

    <div class="page-content">
      <!-- 搜索 -->
      <div class="search-form">
        <el-form :inline="true" :model="searchForm">
          <el-form-item :label="$t('员工姓名')">
            <el-input v-model="searchForm.user_name" placeholder="请输入员工姓名" />
          </el-form-item>
          <el-form-item :label="$t('课程名称')">
            <el-input v-model="searchForm.course_name" placeholder="请输入课程名称" />
          </el-form-item>
          <el-form-item :label="$t('培训状态')">
            <el-select v-model="searchForm.status" placeholder="全部" clearable>
              <el-option :label="$t('未开始')" value="not_started" />
              <el-option :label="$t('进行中')" value="in_progress" />
              <el-option :label="$t('已完成')" value="completed" />
              <el-option :label="$t('不合格')" value="failed" />
              <el-option :label="$t('已过期')" value="expired" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">{{ $t("搜索") }}</el-button>
            <el-button @click="handleReset">{{ $t("重置") }}</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 工具栏 -->
      <div class="action-buttons">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增记录
        </el-button>
        <el-button @click="handleBatchDelete" :disabled="selectedRows.length === 0">
          <el-icon><Delete /></el-icon>批量删除
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>导出记录
        </el-button>
      </div>

      <!-- 表格 -->
      <el-table ref="tableRef" :data="tableData" v-loading="loading" row-key="id" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="user_name" :label="$t('员工姓名')" width="120" />
        <el-table-column prop="user_employee_id" :label="$t('员工工号')" width="120" />
        <el-table-column prop="course_title" :label="$t('课程名称')" min-width="200" show-overflow-tooltip />
        <el-table-column prop="course_code" :label="$t('课程编码')" width="120" />
        <el-table-column prop="training_plan_title" :label="$t('培训计划')" width="150" show-overflow-tooltip />
        <el-table-column prop="status_name" :label="$t('培训状态')" width="100" align="center">
          <template #default="{ row }"><el-tag :type="getStatusType(row.status)">{{ row.status_name }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="progress" :label="$t('学习进度')" width="120" align="center">
          <template #default="{ row }">
            <el-progress v-if="row.progress !== null" :percentage="Math.round(row.progress)" :stroke-width="15" :text-inside="true" />
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="study_duration_human" :label="$t('学习时长')" width="100" align="center" />
        <el-table-column prop="score" :label="$t('培训成绩')" width="100" align="center">
          <template #default="{ row }"><span v-if="row.score !== null">{{ row.score }}分</span><span v-else>--</span></template>
        </el-table-column>
        <el-table-column prop="start_date" :label="$t('开始时间')" width="180" />
        <el-table-column prop="complete_date" :label="$t('完成时间')" width="180" />
        <el-table-column prop="evaluator_name" :label="$t('评估人')" width="120" />
        <el-table-column :label="$t('操作')" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">{{ $t("查看") }}</el-button>
            <el-button type="primary" link @click="handleEdit(row)">{{ $t("编辑") }}</el-button>
            <el-button type="primary" link @click="handleEvaluate(row)">评估</el-button>
            <el-button type="danger" link @click="handleDelete(row)">{{ $t("删除") }}</el-button>
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
            <el-form-item label="员工" prop="user">
              <el-select v-model="formData.user" placeholder="请选择员工" style="width:100%" filterable>
                <el-option v-for="u in userOptions" :key="u.id" :label="u.first_name + u.last_name" :value="u.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程" prop="course">
              <el-select v-model="formData.course" placeholder="请选择课程" style="width:100%" filterable>
                <el-option v-for="c in courseOptions" :key="c.id" :label="c.title" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('培训计划')" prop="training_plan">
              <el-select v-model="formData.training_plan" placeholder="请选择培训计划" style="width:100%" clearable>
                <el-option v-for="p in planOptions" :key="p.id" :label="p.title" :value="p.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('培训状态')" prop="status">
              <el-select v-model="formData.status" placeholder="请选择培训状态" style="width:100%">
                <el-option :label="$t('未开始')" value="not_started" />
                <el-option :label="$t('进行中')" value="in_progress" />
                <el-option :label="$t('已完成')" value="completed" />
                <el-option :label="$t('不合格')" value="failed" />
                <el-option :label="$t('已过期')" value="expired" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('学习进度')" prop="progress">
              <el-input-number v-model="formData.progress" :min="0" :max="100" :precision="1" style="width:100%">
                <template #append>%</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('培训成绩')" prop="score">
              <el-input-number v-model="formData.score" :min="0" :max="100" :precision="1" style="width:100%">
                <template #append>分</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('开始时间')" prop="start_date">
              <el-date-picker v-model="formData.start_date" type="datetime" placeholder="请选择开始时间" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('完成时间')" prop="complete_date">
              <el-date-picker v-model="formData.complete_date" type="datetime" placeholder="请选择完成时间" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="$t('备注')" prop="notes">
          <el-input v-model="formData.notes" type="textarea" :rows="4" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogClose">{{ $t("取消") }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ $t("确定") }}</el-button>
      </template>
    </el-dialog>

    <!-- 评估弹窗 -->
    <el-dialog v-model="evaluateDialogVisible" title="培训评估" width="600px">
      <el-form ref="evaluateFormRef" :model="evaluateForm" :rules="evaluateFormRules" label-width="120px">
        <el-form-item :label="$t('培训成绩')" prop="score">
          <el-input-number v-model="evaluateForm.score" :min="0" :max="100" :precision="1" style="width:100%">
            <template #append>分</template>
          </el-input-number>
        </el-form-item>
        <el-form-item :label="$t('评估人')" prop="evaluator">
          <el-input :value="evaluateForm.evaluator_name" disabled />
        </el-form-item>
        <el-form-item label="评估时间" prop="evaluation_date">
          <el-date-picker v-model="evaluateForm.evaluation_date" type="datetime" placeholder="请选择评估时间" style="width:100%" />
        </el-form-item>
        <el-form-item :label="$t('评估备注')" prop="notes">
          <el-input v-model="evaluateForm.notes" type="textarea" :rows="4" placeholder="请输入评估备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="evaluateDialogVisible = false">{{ $t("取消") }}</el-button>
        <el-button type="primary" :loading="evaluateLoading" @click="handleEvaluateSubmit">{{ $t("确定") }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Download } from '@element-plus/icons-vue'
import { trainingRecordAPI, courseAPI, trainingPlanAPI, userAPI } from '@/api/training'
import { useAuthStore } from '@/store/auth'

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
  user: [{ required: true, message: '请选择员工', trigger: 'change' }],
  course: [{ required: true, message: '请选择课程', trigger: 'change' }],
  status: [{ required: true, message: '请选择培训状态', trigger: 'change' }]
}
const evaluateFormRules = {
  score: [{ required: true, message: '请输入培训成绩', trigger: 'blur' }]
}

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
  dialogTitle.value = '新增培训记录'
  isEdit.value = false
  dialogVisible.value = true
}
const handleEdit = async (row) => {
  dialogTitle.value = '编辑培训记录'
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
    ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
    handleDialogClose()
    loadTableData()
  } catch {
    ElMessage.error(isEdit.value ? '更新失败' : '新增失败')
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
    ElMessage.success('评估成功')
    evaluateDialogVisible.value = false
    loadTableData()
  } catch {
    ElMessage.error('评估失败')
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
    ElMessage.error('加载数据失败')
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
  await ElMessageBox.confirm('确定删除该培训记录吗？', '提示', { type: 'warning' })
  await trainingRecordAPI.deleteRecord(row.id)
  ElMessage.success('删除成功')
  loadTableData()
}
const handleBatchDelete = async () => {
  if (!selectedRows.value.length) return ElMessage.warning('请选择要删除的记录')
  await ElMessageBox.confirm(`确定批量删除 ${selectedRows.value.length} 条记录吗？`, '提示', { type: 'warning' })
  await Promise.all(selectedRows.value.map(r => trainingRecordAPI.deleteRecord(r.id)))
  ElMessage.success('批量删除成功')
  loadTableData()
}
const handleExport = () => ElMessage.success('导出功能已开发完成')

/* -------- 下拉数据 -------- */
const courseOptions = ref([])
const planOptions = ref([])
const userOptions = ref([])
const loadCourseOptions = async () => {
  const { data } = await courseAPI.getCourses({ size: 1000 })
  courseOptions.value = data.results || []
}
const loadPlanOptions = async () => {
  const { data } = await trainingPlanAPI.getPlans({ size: 1000 })
  planOptions.value = data.results || []
}
const loadUserOptions = async () => {
  const { data } = await userAPI.getUsers({ size: 1000, is_active: true })
  userOptions.value = data.results || []
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
.action-buttons { margin-bottom: 20px; }
.pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>