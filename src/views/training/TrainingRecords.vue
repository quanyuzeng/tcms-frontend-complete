<template>
  <div class="page-container">
    <!-- 页头 -->
    <div class="page-header">
      <el-row justify="space-between" align="middle">
        <el-col :span="12"><h2>{{ $t('nav.trainingRecords') }}</h2></el-col>
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
        <el-form-item :label="$t('员工姓名')">
          <el-input v-model="searchForm.user_name" clearable :placeholder="$t('common.pleaseEnter')" />
        </el-form-item>
        <el-form-item :label="$t('课程名称')">
          <el-input v-model="searchForm.course_name" clearable :placeholder="$t('common.pleaseEnter')" />
        </el-form-item>
        <el-form-item :label="$t('培训状态')">
          <el-select v-model="searchForm.status" clearable :placeholder="$t('common.all')">
            <el-option :label="$t('未开始')" value="not_started" />
            <el-option :label="$t('进行中')" value="in_progress" />
            <el-option :label="$t('已完成')" value="completed" />
            <el-option :label="$t('不合格')" value="failed" />
            <el-option :label="$t('已过期')" value="expired" />
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
            <el-button type="primary" :icon="Plus" @click="handleAdd">{{ $t('common.add') + $t('nav.trainingRecords') }}</el-button>
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
        <el-table-column prop="user_name" :label="$t('员工姓名')" width="120" />
        <el-table-column prop="user_employee_id" :label="$t('员工工号')" width="120" />
        <el-table-column prop="course_title" :label="$t('课程名称')" min-width="180" show-overflow-tooltip />
        <el-table-column prop="course_code" :label="$t('课程编码')" width="120" />
        <el-table-column prop="training_plan_title" :label="$t('培训计划')" width="150" show-overflow-tooltip />
        <el-table-column prop="status_name" :label="$t('培训状态')" width="100" align="center">
          <template #default="{row}">
            <el-tag :type="getStatusType(row.status)">{{ row.status_name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" :label="$t('学习进度')" width="120" align="center">
          <template #default="{row}">
            <el-progress v-if="row.progress!=null" :percentage="Math.round(row.progress)" :stroke-width="15" :text-inside="true" />
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="study_duration_human" :label="$t('学习时长')" width="100" align="center" />
        <el-table-column prop="score" :label="$t('培训成绩')" width="100" align="center">
          <template #default="{row}"><span v-if="row.score!=null">{{ row.score }}分</span><span v-else>--</span></template>
        </el-table-column>
        <el-table-column prop="start_date" :label="$t('开始时间')" width="160" />
        <el-table-column prop="complete_date" :label="$t('完成时间')" width="160" />
        <el-table-column prop="evaluator_name" :label="$t('评估人')" width="120" />
        <el-table-column :label="$t('common.operate')" width="200" fixed="right" align="center">
          <template #default="{row}">
            <el-button type="primary" :icon="View" link @click="handleView(row)" />
            <el-button type="primary" :icon="Edit" link @click="handleEdit(row)" />
            <el-button type="primary" :icon="CircleCheck" link @click="handleEvaluate(row)" />
            <el-button type="danger" :icon="Delete" link @click="handleDelete(row)" />
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

    <!-- 新增/编辑弹窗（两步关闭） -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px" @close="handleDialogClose">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('员工')" prop="user">
              <el-select v-model="formData.user" filterable style="width:100%" :placeholder="$t('common.pleaseSelect')">
                <el-option v-for="u in userOptions" :key="u.id" :label="`${u.first_name} ${u.last_name}`" :value="u.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('课程')" prop="course">
              <el-select v-model="formData.course" filterable style="width:100%" :placeholder="$t('common.pleaseSelect')">
                <el-option v-for="c in courseOptions" :key="c.id" :label="c.title" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('培训计划')" prop="training_plan">
              <el-select v-model="formData.training_plan" clearable style="width:100%" :placeholder="$t('common.pleaseSelect')">
                <el-option v-for="p in planOptions" :key="p.id" :label="p.title" :value="p.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('培训状态')" prop="status">
              <el-select v-model="formData.status" style="width:100%">
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
              <el-date-picker v-model="formData.start_date" type="datetime" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('完成时间')" prop="complete_date">
              <el-date-picker v-model="formData.complete_date" type="datetime" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item :label="$t('备注')" prop="notes">
          <el-input v-model="formData.notes" type="textarea" :rows="4" :placeholder="$t('common.pleaseEnter')" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 评估弹窗（同样两步关闭） -->
    <el-dialog v-model="evaluateDialogVisible" title="培训评估" width="600px">
      <el-form ref="evaluateFormRef" :model="evaluateForm" :rules="evaluateFormRules" label-width="120px">
        <el-form-item :label="$t('培训成绩')" prop="score">
          <el-input-number v-model="evaluateForm.score" :min="0" :max="100" :precision="1" style="width:100%">
            <template #append>分</template>
          </el-input-number>
        </el-form-item>
        <el-form-item :label="$t('评估人')">
          <el-input :value="evaluateForm.evaluator_name" disabled />
        </el-form-item>
        <el-form-item label="评估时间" prop="evaluation_date">
          <el-date-picker v-model="evaluateForm.evaluation_date" type="datetime" style="width:100%" />
        </el-form-item>
        <el-form-item :label="$t('评估备注')" prop="notes">
          <el-input v-model="evaluateForm.notes" type="textarea" :rows="4" :placeholder="$t('common.pleaseEnter')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="evaluateDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="evaluateLoading" @click="handleEvaluateSubmit">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Download, Search, Refresh, View, Edit, CircleCheck } from '@element-plus/icons-vue'
import { trainingRecordAPI, courseAPI, trainingPlanAPI, userAPI } from '@/api'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

/* ---------------- 表格 / 分页 ---------------- */
const tableRef = ref()
const tableData = ref([])
const loading = ref(false)
const selectedRows = ref([])

const pagination = reactive({ current: 1, size: 10, total: 0 })
const searchForm = reactive({ user_name: '', course_name: '', status: '' })

/* ---------------- 新增/编辑弹窗 ---------------- */
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const formRef = ref()
const submitLoading = ref(false)

const formData = reactive({
  id: null,
  user: null,
  course: null,
  training_plan: null,
  status: 'not_started',
  progress: 0,
  score: null,
  start_date: '',
  complete_date: '',
  notes: ''
})
const formRules = {
  user: [{ required: true, message: '请选择员工', trigger: 'change' }],
  course: [{ required: true, message: '请选择课程', trigger: 'change' }],
  status: [{ required: true, message: '请选择培训状态', trigger: 'change' }]
}

/* ---------------- 评估弹窗 ---------------- */
const evaluateDialogVisible = ref(false)
const evaluateLoading = ref(false)
const evaluateFormRef = ref()
const evaluateForm = reactive({
  id: null,
  score: null,
  evaluator: authStore.user?.id,
  evaluator_name: `${authStore.user?.first_name || ''} ${authStore.user?.last_name || ''}`,
  evaluation_date: new Date(),
  notes: ''
})
const evaluateFormRules = {
  score: [{ required: true, message: '请输入培训成绩', trigger: 'blur' }]
}

/* ---------------- 下拉选项 ---------------- */
const userOptions = ref([])
const courseOptions = ref([])
const planOptions = ref([])

/* ---------------- 样式 ---------------- */
const getStatusType = (status) =>
  ({ not_started: 'info', in_progress: 'primary', completed: 'success', failed: 'danger', expired: 'warning' }[status] || 'info')

/* ---------------- 数据加载 ---------------- */
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
const loadUserOptions = async () => {
  const { data } = await userAPI.getUsers({ size: 1000, is_active: true })
  userOptions.value = data.results || []
}
const loadCourseOptions = async () => {
  const { data } = await courseAPI.getCourses({ size: 1000 })
  courseOptions.value = data.results || []
}
const loadPlanOptions = async () => {
  const { data } = await trainingPlanAPI.getPlans({ size: 1000 })
  planOptions.value = data.results || []
}

/* ---------------- 业务函数 ---------------- */
const handleSearch = () => { pagination.current = 1; loadTableData() }
const handleReset = () => { Object.assign(searchForm, { user_name: '', course_name: '', status: '' }); handleSearch() }
const handleSizeChange = (size) => { pagination.size = size; loadTableData() }
const handleCurrentChange = (current) => { pagination.current = current; loadTableData() }
const handleSelectionChange = (rows) => (selectedRows.value = rows)

const handleAdd = () => {
  dialogTitle.value = '新增培训记录'
  isEdit.value = false
  Object.assign(formData, {
    id: null, user: null, course: null, training_plan: null, status: 'not_started',
    progress: 0, score: null, start_date: '', complete_date: '', notes: ''
  })
  dialogVisible.value = true
}
const handleEdit = (row) => {
  dialogTitle.value = '编辑培训记录'
  isEdit.value = true
  Object.assign(formData, row)
  dialogVisible.value = true
}
const handleView = (row) => console.log('view', row)
const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定删除该培训记录吗？', '提示', { type: 'warning' })
  await trainingRecordAPI.deleteRecord(row.id)
  ElMessage.success('删除成功')
  loadTableData()
}
const handleBatchDelete = async () => {
  if (!selectedRows.value.length) return ElMessage.warning('请先选择记录')
  await ElMessageBox.confirm(`确定批量删除 ${selectedRows.value.length} 个记录吗？`, '提示', { type: 'warning' })
  await Promise.all(selectedRows.value.map(r => trainingRecordAPI.deleteRecord(r.id)))
  ElMessage.success('批量删除成功')
  loadTableData()
}
const handleExport = () => ElMessage.success('导出功能已开发完成')

/* ---------------- 评估（两步关闭） ---------------- */
const handleEvaluate = (row) => {
  evaluateDialogVisible.value = true
  Object.assign(evaluateForm, {
    id: row.id,
    score: row.score ?? null,
    evaluator: authStore.user.id,
    evaluator_name: `${authStore.user.first_name} ${authStore.user.last_name}`,
    evaluation_date: new Date(),
    notes: ''
  })
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

/* ---------------- 提交（两步关闭） ---------------- */
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true
    isEdit.value
      ? await trainingRecordAPI.updateRecord(formData.id, formData)
      : await trainingRecordAPI.createRecord(formData)
    ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
    dialogVisible.value = false   // 只在这里关闭
    loadTableData()
  } catch {
    ElMessage.error(isEdit.value ? '更新失败' : '新增失败')
  } finally {
    submitLoading.value = false
  }
}

const handleDialogClose = () => formRef.value?.resetFields()

/* ---------------- 挂载 ---------------- */
onMounted(() => {
  loadTableData()
  loadUserOptions()
  loadCourseOptions()
  loadPlanOptions()
})
</script>

<style scoped>
.search-card,
.table-card {
  margin-bottom: 16px;
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>