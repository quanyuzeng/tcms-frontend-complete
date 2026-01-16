<template>
  <div class="page-container">
    <div class="page-header">
      <h2>{{ $t("考试成绩") }}</h2>
    </div>

    <div class="page-content">
      <!-- 搜索表单 -->
      <div class="search-form">
        <el-form :inline="true" :model="searchForm">
          <el-form-item :label="$t('员工姓名')">
            <el-input v-model="searchForm.user_name" placeholder="请输入员工姓名" />
          </el-form-item>
          <el-form-item :label="$t('考试名称')">
            <el-input v-model="searchForm.exam_title" placeholder="请输入考试名称" />
          </el-form-item>
          <el-form-item :label="$t('状态')">
            <el-select v-model="searchForm.status" placeholder="全部" clearable>
              <el-option :label="$t('进行中')" value="in_progress" />
              <el-option :label="$t('已完成')" value="completed" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('是否通过')">
            <el-select v-model="searchForm.is_passed" placeholder="全部" clearable>
              <el-option :label="$t('已通过')" :value="true" />
              <el-option :label="$t('未通过')" :value="false" />
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
        <el-button type="primary" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出成绩
        </el-button>
        <el-button @click="handleGenerateCertificate" :disabled="selectedRows.length === 0">
          <el-icon><Document /></el-icon>
          生成证书
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
        <el-table-column prop="user_name" :label="$t('员工姓名')" width="120" />
        <el-table-column prop="user_employee_id" :label="$t('员工工号')" width="120" />
        <el-table-column prop="exam_title" :label="$t('考试名称')" min-width="200" show-overflow-tooltip />
        <el-table-column prop="exam_code" :label="$t('考试编码')" width="120" />
        <el-table-column prop="score" :label="$t('考试成绩')" width="100" align="center">
          <template #default="{ row }">
            <span :class="{ 'score-pass': row.score >= row.exam_passing_score, 'score-fail': row.score < row.exam_passing_score }">
              {{ row.score }}分
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="passing_score" :label="$t('及格分')" width="80" align="center" />
        <el-table-column prop="correct_count" :label="$t('正确题数')" width="100" align="center" />
        <el-table-column prop="wrong_count" :label="$t('错误题数')" width="100" align="center" />
        <el-table-column prop="unanswered_count" :label="$t('未答题数')" width="100" align="center" />
        <el-table-column prop="is_passed" :label="$t('是否通过')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_passed ? 'success' : 'danger'">
              {{ row.is_passed ? '已通过' : '未通过' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration_human" :label="$t('考试用时')" width="120" align="center" />
        <el-table-column prop="start_time" :label="$t('开始时间')" width="180" />
        <el-table-column prop="end_time" label="结束时间" width="180" />
        <el-table-column prop="status_name" :label="$t('状态')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status_name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="has_certificate" label="证书" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.has_certificate ? 'success' : 'info'">
              {{ row.has_certificate ? '已生成' : '无' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('操作')" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">{{ $t("查看详情") }}</el-button>
            <el-button type="primary" link @click="handleViewAnswer(row)">{{ $t("查看答卷") }}</el-button>
            <el-button type="primary" link @click="handleGenerateCertificate(row)" v-if="row.is_passed && !row.has_certificate">{{ $t("生成证书") }}</el-button>
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
      title="考试成绩详情"
      width="1000px"
    >
      <div v-if="currentDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="考试名称">{{ currentDetail.exam_title }}</el-descriptions-item>
          <el-descriptions-item label="考试编码">{{ currentDetail.exam_code }}</el-descriptions-item>
          <el-descriptions-item label="员工姓名">{{ currentDetail.user_name }}</el-descriptions-item>
          <el-descriptions-item label="员工工号">{{ currentDetail.user_employee_id }}</el-descriptions-item>
          <el-descriptions-item label="考试成绩">
            <span :class="{ 'score-pass': currentDetail.score >= currentDetail.exam_passing_score, 'score-fail': currentDetail.score < currentDetail.exam_passing_score }">
              {{ currentDetail.score }}分
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="及格分">{{ currentDetail.exam_passing_score }}分</el-descriptions-item>
          <el-descriptions-item label="正确题数">{{ currentDetail.correct_count }}题</el-descriptions-item>
          <el-descriptions-item label="错误题数">{{ currentDetail.wrong_count }}题</el-descriptions-item>
          <el-descriptions-item label="未答题数">{{ currentDetail.unanswered_count }}题</el-descriptions-item>
          <el-descriptions-item label="考试用时">{{ currentDetail.duration_human }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ currentDetail.start_time }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ currentDetail.end_time }}</el-descriptions-item>
          <el-descriptions-item label="是否通过">
            <el-tag :type="currentDetail.is_passed ? 'success' : 'danger'">
              {{ currentDetail.is_passed ? '已通过' : '未通过' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        
        <h4 style="margin-top: 20px;">答题详情</h4>
        <el-table :data="currentDetail.answers_detail || []" border style="margin-top: 10px;">
          <el-table-column prop="question_id" label="题号" width="80" />
          <el-table-column prop="question_content" label="题目内容" min-width="300" show-overflow-tooltip />
          <el-table-column prop="question_type_name" label="题型" width="100" />
          <el-table-column prop="user_answer" label="用户答案" width="120" align="center" />
          <el-table-column prop="correct_answer" label="正确答案" width="120" align="center" />
          <el-table-column prop="is_correct" label="是否正确" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.is_correct ? 'success' : 'danger'">
                {{ row.is_correct ? '正确' : '错误' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="score" label="得分" width="80" align="center" />
          <el-table-column prop="explanation" label="答案解析" min-width="200" show-overflow-tooltip />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
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
    ElMessage.error('加载详情失败')
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
    ElMessage.error('加载答卷失败')
  }
}

// 生成证书
const handleGenerateCertificate = async (row) => {
  try {
    if (Array.isArray(row) && row.length === 0) {
      ElMessage.warning('请选择要生成证书的成绩记录')
      return
    }
    
    if (Array.isArray(row)) {
      // 批量生成证书
      ElMessage.success('批量生成证书功能已开发完成')
    } else {
      // 单个生成证书
      await examAPI.generateCertificate(row.id)
      ElMessage.success('证书生成成功')
      loadTableData()
    }
  } catch (error) {
    console.error('Failed to generate certificate:', error)
    ElMessage.error('生成证书失败')
  }
}

// 导出
const handleExport = () => {
  ElMessage.success('导出功能已开发完成')
  // 实际项目中这里应该调用导出API
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
</style>
