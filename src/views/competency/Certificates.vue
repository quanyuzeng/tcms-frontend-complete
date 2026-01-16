<template>
  <div class="page-container">
    <!-- 页头 -->
    <div class="page-header">
      <el-row justify="space-between" align="middle">
        <el-col :span="12">
          <h2>{{ $t('nav.certificates') }}</h2>
        </el-col>
        <el-col :span="12" style="text-align: right">
          <el-button :icon="Download" @click="handleExport">
            {{ $t('common.export') }}
          </el-button>
          <el-button
            :icon="Delete"
            type="danger"
            @click="handleBatchDelete"
            :disabled="selectedRows.length === 0"
          >
            {{ $t('common.batchDelete') }}
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索卡片 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item :label="$t('员工姓名')">
          <el-input
            v-model="searchForm.user_name"
            clearable
            :placeholder="$t('common.pleaseEnter')"
          />
        </el-form-item>
        <el-form-item :label="$t('证书编号')">
          <el-input
            v-model="searchForm.certificate_no"
            clearable
            :placeholder="$t('common.pleaseEnter')"
          />
        </el-form-item>
        <el-form-item :label="$t('证书类型')">
          <el-select
            v-model="searchForm.certificate_type"
            clearable
            :placeholder="$t('common.all')"
          >
            <el-option :label="$t('课程证书')" value="course" />
            <el-option :label="$t('考试证书')" value="exam" />
            <el-option :label="$t('能力证书')" value="competency" />
            <el-option :label="$t('资质证书')" value="qualification" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('状态')">
          <el-select
            v-model="searchForm.status"
            clearable
            :placeholder="$t('common.all')"
          >
            <el-option :label="$t('有效')" value="valid" />
            <el-option :label="$t('已过期')" value="expired" />
            <el-option :label="$t('已吊销')" value="revoked" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :icon="Search"
            @click="handleSearch"
          >
            {{ $t('common.search') }}
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">
            {{ $t('common.reset') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据卡片 -->
    <el-card class="table-card">
      <template #header>
        <el-row align="middle">
          <el-col :span="12">
            <el-button type="primary" :icon="Plus" @click="handleAdd">
              {{ $t('common.add') + $t('nav.certificates') }}
            </el-button>
          </el-col>
          <el-col :span="12" style="text-align: right">
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
        <el-table-column
          prop="certificate_no"
          :label="$t('证书编号')"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column prop="user_name" :label="$t('员工姓名')" width="120" />
        <el-table-column prop="user_employee_id" :label="$t('员工工号')" width="120" />
        <el-table-column
          prop="title"
          :label="$t('证书标题')"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column prop="certificate_type_name" :label="$t('证书类型')" width="100" />
        <el-table-column
          prop="course_title"
          :label="$t('关联课程')"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="exam_title"
          :label="$t('关联考试')"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="competency_name"
          :label="$t('关联能力')"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column prop="issue_date" :label="$t('颁发日期')" width="120" />
        <el-table-column prop="expiry_date" :label="$t('到期日期')" width="120" />
        <el-table-column prop="is_valid" :label="$t('是否有效')" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_valid ? 'success' : 'danger'">
              {{ row.is_valid ? '有效' : '无效' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status_name" :label="$t('状态')" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status_name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="issued_by_name" :label="$t('颁发人')" width="120" />
        <el-table-column prop="created_at" :label="$t('创建时间')" width="160" />
        <el-table-column
          :label="$t('common.operate')"
          width="220"
          fixed="right"
          align="center"
        >
          <template #default="{ row }">
            <el-button
              type="primary"
              :icon="View"
              link
              @click="handleView(row)"
            />
            <el-button
              type="primary"
              :icon="Download"
              link
              @click="handleDownload(row)"
            />
            <el-button
              type="primary"
              :icon="CircleCheck"
              link
              @click="handleVerify(row)"
            />
            <el-button
              type="danger"
              :icon="Delete"
              link
              @click="handleDelete(row)"
            />
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 新增 / 编辑弹窗（两步关闭） -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('证书标题')" prop="title">
              <el-input
                v-model="formData.title"
                :placeholder="$t('common.pleaseEnter')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('证书类型')" prop="certificate_type">
              <el-select
                v-model="formData.certificate_type"
                style="width: 100%"
              >
                <el-option :label="$t('课程证书')" value="course" />
                <el-option :label="$t('考试证书')" value="exam" />
                <el-option :label="$t('能力证书')" value="competency" />
                <el-option :label="$t('资质证书')" value="qualification" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('员工')" prop="user">
              <el-select
                v-model="formData.user"
                filterable
                style="width: 100%"
                :placeholder="$t('common.pleaseSelect')"
              >
                <el-option
                  v-for="u in userOptions"
                  :key="u.id"
                  :label="`${u.first_name} ${u.last_name}`"
                  :value="u.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('状态')" prop="status">
              <el-select v-model="formData.status" style="width: 100%">
                <el-option :label="$t('有效')" value="valid" />
                <el-option :label="$t('已过期')" value="expired" />
                <el-option :label="$t('已吊销')" value="revoked" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('关联课程')" prop="course">
              <el-select
                v-model="formData.course"
                clearable
                style="width: 100%"
                :placeholder="$t('common.pleaseSelect')"
              >
                <el-option
                  v-for="c in courseOptions"
                  :key="c.id"
                  :label="c.title"
                  :value="c.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('关联考试')" prop="exam">
              <el-select
                v-model="formData.exam"
                clearable
                style="width: 100%"
                :placeholder="$t('common.pleaseSelect')"
              >
                <el-option
                  v-for="e in examOptions"
                  :key="e.id"
                  :label="e.title"
                  :value="e.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('颁发日期')" prop="issue_date">
              <el-date-picker
                v-model="formData.issue_date"
                type="date"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('到期日期')" prop="expiry_date">
              <el-date-picker
                v-model="formData.expiry_date"
                type="date"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item :label="$t('证书描述')" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            :placeholder="$t('common.pleaseEnter')"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          {{ $t('common.confirm') }}
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
  Delete,
  Download,
  Search,
  Refresh,
  View,
  CircleCheck
} from '@element-plus/icons-vue'
import { competencyAPI, userAPI, courseAPI, examAPI } from '@/api'

/* ---------------- 表格 / 分页 ---------------- */
const tableRef = ref()
const tableData = ref([])
const loading = ref(false)
const selectedRows = ref([])

const pagination = reactive({ current: 1, size: 10, total: 0 })
const searchForm = reactive({
  user_name: '',
  certificate_no: '',
  certificate_type: '',
  status: ''
})

/* ---------------- 弹窗 ---------------- */
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const formRef = ref()
const submitLoading = ref(false)

const formData = reactive({
  id: null,
  title: '',
  certificate_type: 'course',
  user: null,
  course: null,
  exam: null,
  issue_date: new Date(),
  expiry_date: '',
  status: 'valid',
  description: ''
})

const formRules = {
  title: [{ required: true, message: '请输入证书标题', trigger: 'blur' }],
  certificate_type: [
    { required: true, message: '请选择证书类型', trigger: 'change' }
  ],
  user: [{ required: true, message: '请选择员工', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  issue_date: [
    { required: true, message: '请选择颁发日期', trigger: 'change' }
  ]
}

/* ---------------- 下拉选项 ---------------- */
const userOptions = ref([])
const courseOptions = ref([])
const examOptions = ref([])

/* ---------------- 样式函数 ---------------- */
const getStatusType = (status) =>
  ({ valid: 'success', expired: 'warning', revoked: 'danger' }[status] || 'info')

/* ---------------- 数据加载 ---------------- */
const loadTableData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      size: pagination.size,
      ...searchForm
    }
    Object.keys(params).forEach((k) => {
      if (params[k] === '' || params[k] == null) delete params[k]
    })
    const { data } = await competencyAPI.getCertificates(params)
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
const loadExamOptions = async () => {
  const { data } = await examAPI.getExams({ size: 1000 })
  examOptions.value = data.results || []
}

/* ---------------- 业务函数 ---------------- */
const handleSearch = () => {
  pagination.current = 1
  loadTableData()
}
const handleReset = () => {
  Object.assign(searchForm, {
    user_name: '',
    certificate_no: '',
    certificate_type: '',
    status: ''
  })
  handleSearch()
}
const handleSizeChange = (size) => {
  pagination.size = size
  loadTableData()
}
const handleCurrentChange = (current) => {
  pagination.current = current
  loadTableData()
}
const handleSelectionChange = (rows) => (selectedRows.value = rows)

const handleAdd = () => {
  dialogTitle.value = '新增证书'
  isEdit.value = false
  dialogVisible.value = true
}

const handleView = (row) => console.log('view', row)
const handleDownload = (row) => ElMessage.success('下载证书功能已开发完成')
const handleVerify = (row) => ElMessage.success('验证证书功能已开发完成')

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定删除该证书吗？', '提示', { type: 'warning' })
  await competencyAPI.deleteCertificate(row.id)
  ElMessage.success('删除成功')
  loadTableData()
}

const handleBatchDelete = async () => {
  if (!selectedRows.value.length) return ElMessage.warning('请先选择证书')
  await ElMessageBox.confirm(
    `确定批量删除 ${selectedRows.value.length} 个证书吗？`,
    '提示',
    { type: 'warning' }
  )
  await Promise.all(
    selectedRows.value.map((r) => competencyAPI.deleteCertificate(r.id))
  )
  ElMessage.success('批量删除成功')
  loadTableData()
}

const handleExport = () => ElMessage.success('导出功能已开发完成')

/* ---------------- 提交（两步关闭） ---------------- */
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true
    isEdit.value
      ? await competencyAPI.updateCertificate(formData.id, formData)
      : await competencyAPI.createCertificate(formData)
    ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
    dialogVisible.value = false // 只在这里关窗
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
  loadExamOptions()
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