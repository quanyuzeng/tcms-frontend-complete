<template>
  <div class="page-container">
    <div class="page-header">
      <h2>{{ $t('nav.courses') }}</h2>
    </div>

    <div class="page-content">
      <!-- 搜索 -->
      <div class="search-form">
        <el-form :inline="true" :model="searchForm">
          <el-form-item :label="$t('course.courseName')">
            <el-input v-model="searchForm.search" :placeholder="$t('common.pleaseEnter') + $t('course.courseName')" />
          </el-form-item>
          <el-form-item :label="$t('course.category')">
            <el-cascader v-model="searchForm.category" :options="categoryOptions" :props="{ checkStrictly: true }" clearable />
          </el-form-item>
          <el-form-item :label="$t('common.status')">
            <el-select v-model="searchForm.status" :placeholder="$t('common.all')">
              <el-option :label="$t('common.all')" value="" />
              <el-option :label="$t('course.draft')" value="draft" />
              <el-option :label="$t('course.published')" value="published" />
              <el-option :label="$t('course.archived')" value="archived" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">{{ $t('common.search') }}</el-button>
            <el-button @click="handleReset">{{ $t('common.reset') }}</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 工具栏 -->
      <div class="action-buttons">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>{{ $t('common.add') + $t('course.course') }}
        </el-button>
        <el-button @click="handleBatchDelete" :disabled="selectedRows.length === 0">
          <el-icon><Delete /></el-icon>{{ $t('common.bulkDelete') }}
        </el-button>
        <el-button @click="handleImport"><el-icon><Upload /></el-icon>{{ $t('common.import') }}</el-button>
        <el-button @click="handleExport"><el-icon><Download /></el-icon>{{ $t('common.export') }}</el-button>
      </div>

      <!-- 表格 -->
      <el-table ref="tableRef" :data="tableData" v-loading="loading" row-key="id" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="thumbnail" :label="$t('common.cover')" width="80" align="center">
          <template #default="{ row }">
            <el-avatar v-if="row.thumbnail" :src="row.thumbnail" :size="50" shape="square" />
            <el-icon v-else :size="30"><Notebook /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="code" :label="$t('course.courseCode')" width="120" />
        <el-table-column prop="title" :label="$t('course.courseName')" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category_name" :label="$t('course.category')" width="120" />
        <el-table-column prop="course_type_name" :label="$t('course.courseType')" width="100" />
        <el-table-column prop="duration" :label="$t('course.duration')" width="100" align="center">
          <template #default="{ row }">{{ row.duration }}{{ $t('common.minutes') }}</template>
        </el-table-column>
        <el-table-column prop="credit" :label="$t('course.credit')" width="80" align="center" />
        <el-table-column prop="status_name" :label="$t('common.status')" width="100" align="center">
          <template #default="{ row }"><el-tag :type="getStatusType(row.status)">{{ row.status_name }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="completion_rate" :label="$t('common.completionRate')" width="100" align="center">
          <template #default="{ row }">
            <el-progress v-if="row.completion_rate !== null" :percentage="Math.round(row.completion_rate)" :stroke-width="15" :text-inside="true" />
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" :label="$t('common.createTime')" width="180" />
        <el-table-column :label="$t('common.operate')" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">{{ $t('common.view') }}</el-button>
            <el-button type="primary" link @click="handleEdit(row)">{{ $t('common.edit') }}</el-button>
            <el-button type="primary" link @click="handleMaterials(row)">{{ $t('common.materials') }}</el-button>
            <el-button type="danger" link @click="handleDelete(row)">{{ $t('common.delete') }}</el-button>
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
            <el-form-item :label="$t('课程编码')" prop="code">
              <el-input v-model="formData.code" placeholder="请输入课程编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('课程名称')" prop="title">
              <el-input v-model="formData.title" placeholder="请输入课程名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课程分类" prop="category">
              <el-cascader v-model="formData.category" :options="categoryOptions" :props="{ checkStrictly: true }"
                placeholder="请选择课程分类" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('课程类型')" prop="course_type">
              <el-select v-model="formData.course_type" placeholder="请选择课程类型" style="width:100%">
                <el-option :label="$t('在线课程')" value="online" />
                <el-option :label="$t('线下培训')" value="offline" />
                <el-option :label="$t('混合式')" value="mixed" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="课程时长" prop="duration">
              <el-input-number v-model="formData.duration" :min="1" :precision="0" style="width:100%">
                <template #append>分钟</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('学分')" prop="credit">
              <el-input-number v-model="formData.credit" :min="0" :precision="1" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="及格分数" prop="passing_score">
              <el-input-number v-model="formData.passing_score" :min="0" :max="100" :precision="1" style="width:100%">
                <template #append>分</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="$t('课程描述')" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入课程描述" />
        </el-form-item>
        <el-form-item label="目标岗位" prop="target_positions">
          <el-select v-model="formData.target_positions" multiple filterable placeholder="请选择目标岗位" style="width:100%">
            <el-option v-for="pos in positionOptions" :key="pos.id" :label="pos.name" :value="pos.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-input v-model="formData.tags" placeholder="请输入标签，用逗号分隔" />
        </el-form-item>
        <el-form-item :label="$t('状态')" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="draft">草稿</el-radio>
            <el-radio label="published">已发布</el-radio>
            <el-radio label="archived">已归档</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogClose">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Upload, Download, Notebook } from '@element-plus/icons-vue'
import { courseAPI } from '@/api/training'        // ✅ 正确路径
import { positionAPI } from '@/api/position'

/* -------- 弹窗状态 -------- */
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const formRef = ref()
const submitLoading = ref(false)

/* -------- 表格 / 分页 -------- */
const tableRef = ref()
const tableData = ref([])
const loading = ref(false)
const selectedRows = ref([])

const pagination = reactive({ current: 1, size: 10, total: 0 })
const searchForm = reactive({ search: '', category: '', status: '' })

/* -------- 表单数据 -------- */
const formData = reactive({
  id: null, code: '', title: '', description: '', category: null,
  course_type: 'online', duration: 60, credit: 1.0, passing_score: 60,
  target_positions: [], tags: '', status: 'draft'
})

const formRules = {
  code: [{ required: true, message: '请输入课程编码', trigger: 'blur' }],
  title: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择课程分类', trigger: 'change' }],
  course_type: [{ required: true, message: '请选择课程类型', trigger: 'change' }]
}

/* -------- 两步关闭 -------- */
const handleDialogClose = () => { dialogVisible.value = false }
watch(dialogVisible, val => {
  if (!val) {
    formRef.value?.resetFields()
    Object.assign(formData, {
      id: null, code: '', title: '', description: '', category: null,
      course_type: 'online', duration: 60, credit: 1.0, passing_score: 60,
      target_positions: [], tags: '', status: 'draft'
    })
    isEdit.value = false
  }
})

/* -------- 打开弹窗 -------- */
const handleAdd = () => {
  dialogTitle.value = '新增课程'
  isEdit.value = false
  dialogVisible.value = true
}
const handleEdit = row => {
  dialogTitle.value = '编辑课程'
  isEdit.value = true
  Object.assign(formData, {
    id: row.id, code: row.code, title: row.title, description: row.description,
    category: row.category, course_type: row.course_type, duration: row.duration,
    credit: row.credit, passing_score: row.passing_score,
    target_positions: row.target_positions || [], tags: row.tags, status: row.status
  })
  dialogVisible.value = true
}

/* -------- 提交 -------- */
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true
    isEdit.value
      ? await courseAPI.updateCourse(formData.id, formData)
      : await courseAPI.createCourse(formData)
    ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
    handleDialogClose()
    loadTableData()
  } catch {
    ElMessage.error(isEdit.value ? '更新失败' : '新增失败')
  } finally {
    submitLoading.value = false
  }
}

/* -------- 其余业务函数 -------- */
const loadTableData = async () => {
  loading.value = true
  try {
    const params = { page: pagination.current, size: pagination.size, ...searchForm }
    Object.keys(params).forEach(k => params[k] === '' && delete params[k])
    const { data } = await courseAPI.getCourses(params)
    tableData.value = data.results || []
    pagination.total = data.count || 0
  } catch {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}
const handleSearch = () => { pagination.current = 1; loadTableData() }
const handleReset = () => { Object.assign(searchForm, { search: '', category: '', status: '' }); handleSearch() }
const handleSizeChange = size => { pagination.size = size; loadTableData() }
const handleCurrentChange = current => { pagination.current = current; loadTableData() }
const handleSelectionChange = rows => (selectedRows.value = rows)
const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定删除该课程吗？', '提示', { type: 'warning' })
  await courseAPI.deleteCourse(row.id)
  ElMessage.success('删除成功')
  loadTableData()
}
const handleView = row => console.log('view', row)
const handleMaterials = row => console.log('materials', row)
const handleImport = () => ElMessage.info('导入开发中')
const handleExport = () => ElMessage.success('导出功能已开发完成')
const getStatusType = status => ({ draft: 'info', published: 'success', archived: 'warning' }[status] || 'info')

/* -------- 下拉数据 -------- */
const categoryOptions = ref([])
const positionOptions = ref([])
const loadCategoryOptions = async () => {
  const { data } = await courseAPI.getCategoryTree()
  categoryOptions.value = data || []
}
const loadPositionOptions = async () => {
  const { data } = await positionAPI.getPositions({ size: 1000 })
  positionOptions.value = data.results || []
}

onMounted(() => {
  loadTableData()
  loadCategoryOptions()
  loadPositionOptions()
})
</script>

<style scoped>
.action-buttons { margin-bottom: 20px; }
.pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>