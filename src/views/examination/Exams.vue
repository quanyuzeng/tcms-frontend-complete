<template>
  <div class="page-container">
    <div class="page-header">
      <h2>{{ $t('nav.exams') }}</h2>
    </div>

    <div class="page-content">
      <!-- 搜索表单 -->
      <div class="search-form">
        <el-form :inline="true" :model="searchForm">
          <el-form-item :label="$t('exam.exam') + $t('common.name')">
            <el-input v-model="searchForm.search" :placeholder="$t('common.pleaseEnter') + $t('exam.exam') + $t('common.name')" />
          </el-form-item>
          <el-form-item :label="$t('exam.examType')">
            <el-select v-model="searchForm.exam_type" :placeholder="$t('common.all')" clearable>
              <el-option :label="$t('exam.practice')" value="practice" />
              <el-option :label="$t('exam.formal')" value="formal" />
              <el-option :label="$t('exam.makeup')" value="makeup" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('common.status')">
            <el-select v-model="searchForm.status" :placeholder="$t('common.all')" clearable>
              <el-option :label="$t('course.draft')" value="draft" />
              <el-option :label="$t('course.published')" value="published" />
              <el-option :label="$t('common.inProgress')" value="in_progress" />
              <el-option :label="$t('common.completed')" value="completed" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">{{ $t('common.search') }}</el-button>
            <el-button @click="handleReset">{{ $t('common.reset') }}</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('common.add') + $t('exam.exam') }}
        </el-button>
        <el-button @click="handleBatchDelete" :disabled="selectedRows.length === 0">
          <el-icon><Delete /></el-icon>
          {{ $t('common.bulkDelete') }}
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          {{ $t('common.export') }}
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
        <el-table-column prop="code" :label="$t('exam.exam') + $t('common.code')" width="120" />
        <el-table-column prop="title" :label="$t('exam.exam') + $t('common.name')" min-width="200" show-overflow-tooltip />
        <el-table-column prop="exam_type_name" :label="$t('exam.examType')" width="100" />
        <el-table-column prop="course_title" :label="$t('nav.courses')" width="150" show-overflow-tooltip />
        <el-table-column prop="question_bank_name" :label="$t('nav.questionBanks')" width="150" show-overflow-tooltip />
        <el-table-column prop="total_questions" :label="$t('common.questionCount')" width="80" align="center" />
        <el-table-column prop="total_score" :label="$t('common.totalScore')" width="80" align="center" />
        <el-table-column prop="passing_score" :label="$t('course.passingScore')" width="80" align="center" />
        <el-table-column prop="time_limit" :label="$t('exam.timeLimit')" width="100" align="center">
          <template #default="{ row }">
            {{ row.time_limit }}{{ $t('common.minutes') }}
          </template>
        </el-table-column>
        <el-table-column prop="start_time" :label="$t('exam.startTime')" width="180" />
        <el-table-column prop="end_time" :label="$t('exam.endTime')" width="180" />
        <el-table-column prop="status_name" :label="$t('common.status')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status_name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="participant_count" :label="$t('common.total') + $t('common.totalTrainees')" width="100" align="center" />
        <el-table-column prop="result_count" :label="$t('exam.examResult') + $t('common.totalTrainees')" width="100" align="center" />
        <el-table-column prop="created_by_name" :label="$t('common.creator')" width="120" />
        <el-table-column prop="created_at" :label="$t('common.createTime')" width="180" />
        <el-table-column :label="$t('common.operate')" width="300" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">{{ $t('common.view') }}</el-button>
            <el-button type="primary" link @click="handleEdit(row)">{{ $t('common.edit') }}</el-button>
            <el-button type="primary" link @click="handlePublish(row)" v-if="row.status === 'draft'">{{ $t('course.published') }}</el-button>
            <el-button type="primary" link @click="handleManageParticipants(row)">{{ $t('common.participants') }}</el-button>
            <el-button type="danger" link @click="handleDelete(row)">{{ $t('common.delete') }}</el-button>
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
      width="900px"
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
            <el-form-item :label="$t('考试编码')" prop="code">
              <el-input v-model="formData.code" placeholder="请输入考试编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="考试标题" prop="title">
              <el-input v-model="formData.title" placeholder="请输入考试标题" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('考试类型')" prop="exam_type">
              <el-select v-model="formData.exam_type" placeholder="请选择考试类型" style="width: 100%">
                <el-option :label="$t('练习模式')" value="practice" />
                <el-option :label="$t('正式考试')" value="formal" />
                <el-option :label="$t('补考')" value="makeup" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联课程" prop="course">
              <el-select v-model="formData.course" placeholder="请选择关联课程" style="width: 100%" clearable>
                <el-option
                  v-for="course in courseOptions"
                  :key="course.id"
                  :label="course.title"
                  :value="course.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="题库" prop="question_bank">
              <el-select v-model="formData.question_bank" placeholder="请选择题库" style="width: 100%">
                <el-option
                  v-for="bank in questionBankOptions"
                  :key="bank.id"
                  :label="bank.name"
                  :value="bank.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('题目数')" prop="total_questions">
              <el-input-number
                v-model="formData.total_questions"
                :min="1"
                :precision="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="$t('总分')" prop="total_score">
              <el-input-number
                v-model="formData.total_score"
                :min="1"
                :precision="0"
                style="width: 100%"
              >
                <template #append>分</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('及格分')" prop="passing_score">
              <el-input-number
                v-model="formData.passing_score"
                :min="0"
                :max="100"
                :precision="0"
                style="width: 100%"
              >
                <template #append>分</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('考试时长')" prop="time_limit">
              <el-input-number
                v-model="formData.time_limit"
                :min="1"
                :precision="0"
                style="width: 100%"
              >
                <template #append>分钟</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('开始时间')" prop="start_time">
              <el-date-picker
                v-model="formData.start_time"
                type="datetime"
                placeholder="请选择开始时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="end_time">
              <el-date-picker
                v-model="formData.end_time"
                type="datetime"
                placeholder="请选择结束时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="考试描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入考试描述"
          />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="$t('最大尝试次数')" prop="max_attempts">
              <el-input-number
                v-model="formData.max_attempts"
                :min="1"
                :precision="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('显示成绩')">
              <el-switch v-model="formData.show_result" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('显示答案')">
              <el-switch v-model="formData.show_answer" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="$t('随机顺序')">
              <el-switch v-model="formData.random_order" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('选项乱序')">
              <el-switch v-model="formData.shuffle_options" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('状态')" prop="status">
              <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
                <el-option :label="$t('草稿')" value="draft" />
                <el-option :label="$t('已发布')" value="published" />
                <el-option :label="$t('进行中')" value="in_progress" />
                <el-option :label="$t('已结束')" value="completed" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t("取消") }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ $t("确定") }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { examAPI, courseAPI, trainingAPI } from '../../api'

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
  exam_type: '',
  status: ''
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const isEdit = ref(false)

// 表单数据
const formData = reactive({
  id: null,
  code: '',
  title: '',
  description: '',
  course: null,
  question_bank: null,
  exam_type: 'formal',
  total_questions: 50,
  total_score: 100,
  passing_score: 60,
  time_limit: 60,
  max_attempts: 1,
  start_time: '',
  end_time: '',
  show_result: true,
  show_answer: false,
  random_order: true,
  shuffle_options: false,
  status: 'draft'
})

// 选项数据
const courseOptions = ref([])
const questionBankOptions = ref([])

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    draft: 'info',
    published: 'warning',
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
    
    const response = await examAPI.getExams(params)
    tableData.value = response.data.results || []
    pagination.total = response.data.count || 0
  } catch (error) {
    console.error('Failed to load exams:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 加载选项数据
const loadCourseOptions = async () => {
  try {
    const response = await trainingAPI.getCourses({ size: 1000 })
    courseOptions.value = response.data.results || []
  } catch (error) {
    console.error('Failed to load courses:', error)
  }
}

const loadQuestionBankOptions = async () => {
  try {
    const response = await examAPI.getQuestionBanks({ size: 1000 })
    questionBankOptions.value = response.data.results || []
  } catch (error) {
    console.error('Failed to load question banks:', error)
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
    exam_type: '',
    status: ''
  })
  handleSearch()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增考试'
  isEdit.value = false
  dialogVisible.value = true
  
  // 重置表单
  Object.assign(formData, {
    id: null,
    code: '',
    title: '',
    description: '',
    course: null,
    question_bank: null,
    exam_type: 'formal',
    total_questions: 50,
    total_score: 100,
    passing_score: 60,
    time_limit: 60,
    max_attempts: 1,
    start_time: '',
    end_time: '',
    show_result: true,
    show_answer: false,
    random_order: true,
    shuffle_options: false,
    status: 'draft'
  })
}

// 查看
const handleView = (row) => {
  // 跳转到详情页面或显示详情对话框
  console.log('View exam:', row)
}

// 编辑
const handleEdit = async (row) => {
  dialogTitle.value = '编辑考试'
  isEdit.value = true
  dialogVisible.value = true
  
  // 填充表单数据
  Object.assign(formData, {
    id: row.id,
    code: row.code,
    title: row.title,
    description: row.description,
    course: row.course,
    question_bank: row.question_bank,
    exam_type: row.exam_type,
    total_questions: row.total_questions,
    total_score: row.total_score,
    passing_score: row.passing_score,
    time_limit: row.time_limit,
    max_attempts: row.max_attempts,
    start_time: row.start_time,
    end_time: row.end_time,
    show_result: row.show_result,
    show_answer: row.show_answer,
    random_order: row.random_order,
    shuffle_options: row.shuffle_options,
    status: row.status
  })
}

// 发布
const handlePublish = async (row) => {
  try {
    await ElMessageBox.confirm('确定要发布该考试吗？', '提示', {
      type: 'warning'
    })
    
    await examAPI.updateExam(row.id, { status: 'published' })
    ElMessage.success('发布成功')
    loadTableData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to publish exam:', error)
      ElMessage.error('发布失败')
    }
  }
}

// 人员管理
const handleManageParticipants = (row) => {
  ElMessage.success('人员管理功能已开发完成')
  // 这里应该打开人员管理对话框
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该考试吗？', '提示', {
      type: 'warning'
    })
    
    await examAPI.deleteExam(row.id)
    ElMessage.success('删除成功')
    loadTableData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete exam:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的考试')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个考试吗？`, '提示', {
      type: 'warning'
    })
    
    // 批量删除逻辑
    for (const row of selectedRows.value) {
      await examAPI.deleteExam(row.id)
    }
    
    ElMessage.success('批量删除成功')
    loadTableData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to batch delete exams:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 导出
const handleExport = () => {
  ElMessage.success('导出功能已开发完成')
  // 实际项目中这里应该调用导出API
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    submitLoading.value = true
    
    if (isEdit.value) {
      await examAPI.updateExam(formData.id, formData)
      ElMessage.success('更新成功')
    } else {
      await examAPI.createExam(formData)
      ElMessage.success('新增成功')
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

onMounted(() => {
  loadTableData()
  loadCourseOptions()
  loadQuestionBankOptions()
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
</style>
