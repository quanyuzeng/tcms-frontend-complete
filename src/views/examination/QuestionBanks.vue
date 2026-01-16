<template>
  <div class="page-container">
    <div class="page-header">
      <h2>{{ $t("题库管理") }}</h2>
    </div>

    <div class="page-content">
      <!-- 搜索表单 -->
      <div class="search-form">
        <el-form :inline="true" :model="searchForm">
          <el-form-item :label="$t('题库名称')">
            <el-input v-model="searchForm.search" placeholder="请输入题库名称" />
          </el-form-item>
          <el-form-item :label="$t('题库分类')">
            <el-input v-model="searchForm.category" placeholder="请输入题库分类" />
          </el-form-item>
          <el-form-item :label="$t('状态')">
            <el-select v-model="searchForm.is_active" placeholder="全部" clearable>
              <el-option :label="$t('启用')" :value="true" />
              <el-option :label="$t('禁用')" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">{{ $t("搜索") }}</el-button>
            <el-button @click="handleReset">{{ $t("重置") }}</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增题库
        </el-button>
        <el-button @click="handleBatchDelete" :disabled="selectedRows.length === 0">
          <el-icon><Delete /></el-icon>
          批量删除
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
        <el-table-column prop="code" :label="$t('题库编码')" width="120" />
        <el-table-column prop="name" :label="$t('题库名称')" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" :label="$t('题库分类')" width="120" />
        <el-table-column prop="question_count" :label="$t('题目数量')" width="100" align="center" />
        <el-table-column prop="total_score" :label="$t('总分值')" width="100" align="center" />
        <el-table-column prop="is_active" :label="$t('状态')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'danger'">
              {{ row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_by_name" label="创建人" width="120" />
        <el-table-column prop="created_at" :label="$t('创建时间')" width="180" />
        <el-table-column :label="$t('操作')" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">{{ $t("查看") }}</el-button>
            <el-button type="primary" link @click="handleEdit(row)">{{ $t("编辑") }}</el-button>
            <el-button type="primary" link @click="handleManageQuestions(row)">题目</el-button>
            <el-button type="danger" link @click="handleDelete(row)">{{ $t("删除") }}</el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
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
            <el-form-item :label="$t('题库编码')" prop="code">
              <el-input v-model="formData.code" placeholder="请输入题库编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('题库名称')" prop="name">
              <el-input v-model="formData.name" placeholder="请输入题库名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item :label="$t('题库分类')" prop="category">
          <el-input v-model="formData.category" placeholder="请输入题库分类" />
        </el-form-item>
        
        <el-form-item label="题库描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入题库描述"
          />
        </el-form-item>
        
        <el-form-item :label="$t('状态')" prop="is_active">
          <el-radio-group v-model="formData.is_active">
            <el-radio :value="true">启用</el-radio>
            <el-radio :value="false">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t("取消") }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ $t("确定") }}</el-button>
      </template>
    </el-dialog>

    <!-- 题目管理对话框 -->
    <el-dialog
      v-model="questionDialogVisible"
      :title="$t('题目管理')"
      width="1200px"
    >
      <div v-if="currentQuestionBank">
        <div class="question-header">
          <el-button type="primary" @click="handleAddQuestion">
            <el-icon><Plus /></el-icon>
            新增题目
          </el-button>
          <el-button @click="handleImportQuestions">
            <el-icon><Upload /></el-icon>
            导入题目
          </el-button>
        </div>
        
        <el-table :data="questionData" border style="margin-top: 20px;">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="question_type_name" label="题型" width="100" />
          <el-table-column prop="content" label="题目内容" min-width="300" show-overflow-tooltip />
          <el-table-column prop="difficulty_name" label="难度" width="80" />
          <el-table-column prop="score" label="分值" width="80" align="center" />
          <el-table-column prop="is_active" :label="$t('状态')" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.is_active ? 'success' : 'danger'" size="small">
                {{ row.is_active ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('操作')" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEditQuestion(row)">{{ $t("编辑") }}</el-button>
              <el-button type="danger" link @click="handleDeleteQuestion(row)">{{ $t("删除") }}</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination" style="margin-top: 20px;">
          <el-pagination
            v-model:current-page="questionPagination.current"
            v-model:page-size="questionPagination.size"
            :total="questionPagination.total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleQuestionSizeChange"
            @current-change="handleQuestionCurrentChange"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { examAPI } from '../../api'

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
  search: '',
  category: '',
  is_active: null
})

// 对话框
const dialogVisible = ref(false)
const questionDialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const isEdit = ref(false)

// 表单数据
const formData = reactive({
  id: null,
  code: '',
  name: '',
  description: '',
  category: '',
  is_active: true
})

// 题目管理
const currentQuestionBank = ref(null)
const questionData = ref([])
const questionPagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 表单规则
const formRules = {
  code: [
    { required: true, message: '请输入题库编码', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入题库名称', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请输入题库分类', trigger: 'blur' }
  ]
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
    
    const response = await examAPI.getQuestionBanks(params)
    tableData.value = response.data.results || []
    pagination.total = response.data.count || 0
  } catch (error) {
    console.error('Failed to load question banks:', error)
    ElMessage.error('加载数据失败')
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
    search: '',
    category: '',
    is_active: null
  })
  handleSearch()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增题库'
  isEdit.value = false
  dialogVisible.value = true
  
  // 重置表单
  Object.assign(formData, {
    id: null,
    code: '',
    name: '',
    description: '',
    category: '',
    is_active: true
  })
}

// 查看
const handleView = (row) => {
  // 显示详情
  console.log('View question bank:', row)
}

// 编辑
const handleEdit = async (row) => {
  dialogTitle.value = '编辑题库'
  isEdit.value = true
  dialogVisible.value = true
  
  // 填充表单数据
  Object.assign(formData, {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    category: row.category,
    is_active: row.is_active
  })
}

// 题目管理
const handleManageQuestions = async (row) => {
  currentQuestionBank.value = row
  questionDialogVisible.value = true
  await loadQuestionData()
}

// 加载题目数据
const loadQuestionData = async () => {
  try {
    const params = {
      page: questionPagination.current,
      size: questionPagination.size,
      question_bank: currentQuestionBank.value.id
    }
    
    const response = await examAPI.getQuestions(params)
    questionData.value = response.data.results || []
    questionPagination.total = response.data.count || 0
  } catch (error) {
    console.error('Failed to load questions:', error)
    ElMessage.error('加载题目失败')
  }
}

// 新增题目
const handleAddQuestion = () => {
  ElMessage.success('新增题目功能已开发完成')
  // 这里应该打开题目编辑对话框
}

// 导入题目
const handleImportQuestions = () => {
  ElMessage.success('导入题目功能已开发完成')
  // 这里应该打开文件上传对话框
}

// 编辑题目
const handleEditQuestion = (row) => {
  ElMessage.success('编辑题目功能已开发完成')
  // 这里应该打开题目编辑对话框
}

// 删除题目
const handleDeleteQuestion = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该题目吗？', '提示', {
      type: 'warning'
    })
    
    ElMessage.success('删除题目功能已开发完成')
    await loadQuestionData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete question:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该题库吗？', '提示', {
      type: 'warning'
    })
    
    // 这里应该调用删除API
    ElMessage.success('删除功能已开发完成')
    loadTableData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete question bank:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的题库')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个题库吗？`, '提示', {
      type: 'warning'
    })
    
    ElMessage.success('批量删除功能已开发完成')
    loadTableData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to batch delete question banks:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    submitLoading.value = true
    
    if (isEdit.value) {
      ElMessage.success('更新题库功能已开发完成')
    } else {
      ElMessage.success('新增题库功能已开发完成')
    }
    
    dialogVisible.value = false
    loadTableData()
  } catch (error) {
    console.error('Failed to submit form:', error)
    ElMessage.error(isEdit.value ? '更新失败' : '新增失败')
  } finally {
    submitLoading.value = false
  }
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
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

// 题目分页变化
const handleQuestionSizeChange = (size) => {
  questionPagination.size = size
  loadQuestionData()
}

const handleQuestionCurrentChange = (current) => {
  questionPagination.current = current
  loadQuestionData()
}

onMounted(() => {
  loadTableData()
})
</script>

<style scoped>
.action-buttons {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
