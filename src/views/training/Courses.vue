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
            <el-form-item :label="$t('course.courseCode')" prop="code">
              <el-input v-model="formData.code" :placeholder="$t('common.pleaseEnter') + $t('course.courseCode')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('course.courseName')" prop="title">
              <el-input v-model="formData.title" :placeholder="$t('common.pleaseEnter') + $t('course.courseName')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('course.category')" prop="category">
              <el-cascader v-model="formData.category" :options="categoryOptions" :props="{ checkStrictly: true }"
                :placeholder="$t('common.pleaseSelect') + $t('course.category')" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('course.courseType')" prop="course_type">
              <el-select v-model="formData.course_type" :placeholder="$t('common.pleaseSelect') + $t('course.courseType')" style="width:100%">
                <el-option :label="$t('course.online')" value="online" />
                <el-option :label="$t('course.offline')" value="offline" />
                <el-option :label="$t('course.mixed')" value="mixed" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="$t('course.duration')" prop="duration">
              <el-input-number v-model="formData.duration" :min="1" :precision="0" style="width:100%">
                <template #append>{{ $t('common.minutes') }}</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('course.credit')" prop="credit">
              <el-input-number v-model="formData.credit" :min="0" :precision="1" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('course.passingScore')" prop="passing_score">
              <el-input-number v-model="formData.passing_score" :min="0" :max="100" :precision="1" style="width:100%">
                <template #append>分</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="$t('common.description')" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="4" :placeholder="$t('common.pleaseEnter') + $t('common.description')" />
        </el-form-item>
        <el-form-item :label="$t('training.targetPosition')" prop="target_positions">
          <el-select v-model="formData.target_positions" multiple filterable :placeholder="$t('common.pleaseSelect') + $t('training.targetPosition')" style="width:100%">
            <el-option v-for="pos in positionOptions" :key="pos.id" :label="pos.name" :value="pos.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('course.tags')" prop="tags">
          <el-input v-model="formData.tags" :placeholder="$t('course.enterTagsPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('common.status')" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="draft">{{ $t('course.draft') }}</el-radio>
            <el-radio label="published">{{ $t('course.published') }}</el-radio>
            <el-radio label="archived">{{ $t('course.archived') }}</el-radio>
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
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Upload, Download, Notebook } from '@element-plus/icons-vue'
import { courseAPI } from '@/api/training'
import { positionAPI } from '@/api/position'

const { t } = useI18n()

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
  code: [{ 
    required: true, 
    message: computed(() => t('validation.required', { field: t('course.courseCode') })).value, 
    trigger: 'blur' 
  }],
  title: [{ 
    required: true, 
    message: computed(() => t('validation.required', { field: t('course.courseName') })).value, 
    trigger: 'blur' 
  }],
  category: [{ 
    required: true, 
    message: computed(() => t('validation.required', { field: t('course.category') })).value, 
    trigger: 'change' 
  }],
  course_type: [{ 
    required: true, 
    message: computed(() => t('validation.required', { field: t('course.courseType') })).value, 
    trigger: 'change' 
  }]
}

/* -------- 计算属性 -------- */
const addButtonText = computed(() => {
  return t('common.add') + t('course.course')
})

const editButtonText = computed(() => {
  return t('common.edit') + t('course.course')
})

/* -------- 两步关闭 -------- */
const handleDialogClose = () => { 
  dialogVisible.value = false 
}

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
  dialogTitle.value = addButtonText.value
  isEdit.value = false
  dialogVisible.value = true
}

const handleEdit = row => {
  dialogTitle.value = editButtonText.value
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
    
    if (isEdit.value) {
      await courseAPI.updateCourse(formData.id, formData)
      ElMessage.success(t('message.operationSuccess'))
    } else {
      await courseAPI.createCourse(formData)
      ElMessage.success(t('message.operationSuccess'))
    }
    
    handleDialogClose()
    loadTableData()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(t('message.operationFailed'))
  } finally {
    submitLoading.value = false
  }
}

/* -------- 其余业务函数 -------- */
const loadTableData = async () => {
  loading.value = true
  try {
    const params = { 
      page: pagination.current, 
      size: pagination.size, 
      ...searchForm 
    }
    
    // 移除空参数
    Object.keys(params).forEach(k => {
      if (params[k] === '' || params[k] === null || params[k] === undefined) {
        delete params[k]
      }
    })
    
    const { data } = await courseAPI.getCourses(params)
    tableData.value = data.results || []
    pagination.total = data.count || 0
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error(t('message.loadingDataFailed'))
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { 
  pagination.current = 1
  loadTableData() 
}

const handleReset = () => { 
  Object.assign(searchForm, { search: '', category: '', status: '' })
  handleSearch() 
}

const handleSizeChange = size => { 
  pagination.size = size
  loadTableData() 
}

const handleCurrentChange = current => { 
  pagination.current = current
  loadTableData() 
}

const handleSelectionChange = rows => { 
  selectedRows.value = rows 
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      t('message.confirmDelete'), 
      t('common.tip'), 
      { type: 'warning' }
    )
    
    await courseAPI.deleteCourse(row.id)
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
  if (selectedRows.value.length === 0) {
    ElMessage.warning(t('message.noSelectedItems'))
    return
  }
  
  try {
    await ElMessageBox.confirm(
      t('message.confirmBatchDelete'), 
      t('common.tip'), 
      { type: 'warning' }
    )
    
    const ids = selectedRows.value.map(row => row.id)
    await courseAPI.batchDeleteCourses(ids)
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

const handleView = row => {
  console.log('查看课程:', row)
  // 这里可以添加查看课程详情的逻辑
}

const handleMaterials = row => {
  console.log('课程资料:', row)
  // 这里可以添加管理课程资料的逻辑
}

const handleImport = () => {
  ElMessage.info(t('message.importDeveloping'))
}

const handleExport = () => {
  ElMessage.success(t('message.exportReady'))
}

const getStatusType = status => {
  const typeMap = {
    draft: 'info',
    published: 'success',
    archived: 'warning',
    inProgress: 'primary',
    completed: 'success'
  }
  return typeMap[status] || 'info'
}

/* -------- 下拉数据 -------- */
const categoryOptions = ref([])
const positionOptions = ref([])

const loadCategoryOptions = async () => {
  try {
    const { data } = await courseAPI.getCategoryTree()
    categoryOptions.value = data || []
  } catch (error) {
    console.error('加载分类选项失败:', error)
    ElMessage.error(t('message.loadDataFailed'))
  }
}

const loadPositionOptions = async () => {
  try {
    const { data } = await positionAPI.getPositions({ size: 1000 })
    positionOptions.value = data.results || []
  } catch (error) {
    console.error('加载岗位选项失败:', error)
    ElMessage.error(t('message.loadDataFailed'))
  }
}

onMounted(() => {
  loadTableData()
  loadCategoryOptions()
  loadPositionOptions()
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
</style>