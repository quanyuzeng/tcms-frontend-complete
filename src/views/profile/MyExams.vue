<template>
  <div class="my-exams">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-row :gutter="20" align="middle">
        <el-col :span="12">
          <h2>{{ $t('nav.myexams') }}</h2>
        </el-col>
        <el-col :span="12" class="text-right">
          <el-button :icon="Download" @click="handleExport">
            {{ $t('common.export') }}
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="24" :sm="12" :md="6" v-for="card in statCards" :key="card.title">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-card-content">
            <el-icon :size="48" :color="card.color">
              <component :is="card.icon" />
            </el-icon>
            <div class="stat-card-info">
              <div class="stat-card-title">{{ card.title }}</div>
              <div class="stat-card-value">{{ card.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item :label="$t('exam.exam')">
          <el-input
            v-model="searchForm.examName"
            :placeholder="$t('common.pleaseEnter')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('exam.examType')">
          <el-select
            v-model="searchForm.examType"
            :placeholder="$t('common.pleaseSelect')"
            clearable
            style="width: 150px"
          >
            <el-option :label="$t('exam.practice')" value="practice" />
            <el-option :label="$t('exam.formal')" value="formal" />
            <el-option :label="$t('exam.makeup')" value="makeup" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('common.status')">
          <el-select
            v-model="searchForm.status"
            :placeholder="$t('common.pleaseSelect')"
            clearable
            style="width: 150px"
          >
            <el-option :label="$t('common.pending')" value="pending" />
            <el-option :label="$t('common.inProgress')" value="in_progress" />
            <el-option :label="$t('common.completed')" value="completed" />
            <el-option :label="$t('common.passed')" value="passed" />
            <el-option :label="$t('common.failed')" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            {{ $t('common.search') }}
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">
            {{ $t('common.reset') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 考试记录表格 -->
    <el-card class="table-card">
      <el-table
        ref="tableRef"
        :data="tableData"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column
          prop="id"
          label="ID"
          width="80"
          show-overflow-tooltip
        />
        <el-table-column
          prop="examName"
          :label="$t('exam.exam')"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="examType"
          :label="$t('exam.examType')"
          width="120"
          align="center"
        >
          <template #default="scope">
            <el-tag :type="getExamTypeTagType(scope.row.examType)">
              {{ $t(`exam.${scope.row.examType}`) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="totalQuestions"
          :label="$t('exam.totalQuestions')"
          width="100"
          align="center"
        />
        <el-table-column
          prop="totalScore"
          :label="$t('exam.totalScore')"
          width="100"
          align="center"
        />
        <el-table-column
          prop="passingScore"
          :label="$t('exam.passingScore')"
          width="100"
          align="center"
        />
        <el-table-column
          prop="startTime"
          :label="$t('exam.startTime')"
          width="180"
          align="center"
        />
        <el-table-column
          prop="endTime"
          :label="$t('exam.endTime')"
          width="180"
          align="center"
        />
        <el-table-column
          prop="duration"
          :label="$t('exam.duration')"
          width="120"
          align="center"
        >
          <template #default="scope">
            {{ formatDuration(scope.row.duration) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="score"
          :label="$t('common.score')"
          width="100"
          align="center"
        >
          <template #default="scope">
            <el-tag v-if="scope.row.score !== null" :type="getScoreTagType(scope.row.score, scope.row.passingScore)">
              {{ scope.row.score }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="correctCount"
          :label="$t('exam.correctCount')"
          width="100"
          align="center"
        >
          <template #default="scope">
            <span v-if="scope.row.correctCount !== null">
              {{ scope.row.correctCount }} / {{ scope.row.totalQuestions }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="isPassed"
          :label="$t('common.result')"
          width="100"
          align="center"
          fixed="right"
        >
          <template #default="scope">
            <el-tag v-if="scope.row.isPassed !== null" :type="scope.row.isPassed ? 'success' : 'danger'">
              {{ scope.row.isPassed ? $t('common.passed') : $t('common.failed') }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.operate')"
          width="120"
          fixed="right"
          align="center"
        >
          <template #default="scope">
            <el-button
              type="primary"
              :icon="View"
              circle
              size="small"
              @click="handleView(scope.row)"
            />
            <el-button
              v-if="scope.row.status === 'pending'"
              type="success"
              :icon="EditPen"
              circle
              size="small"
              @click="handleStartExam(scope.row)"
            />
            <el-button
              v-if="scope.row.status === 'failed' && scope.row.examType === 'formal'"
              type="warning"
              :icon="EditPen"
              circle
              size="small"
              @click="handleRetakeExam(scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Search, 
  Refresh, 
  View,
  EditPen,
  Download,
  Edit,
  Trophy,
  CircleCheck,
  CircleClose
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

// 响应式数据
const router = useRouter()
const loading = ref(false)
const tableRef = ref()

// 搜索表单
const searchForm = reactive({
  examName: '',
  examType: '',
  status: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const tableData = ref([])

// 统计卡片
const statCards = ref([
  { title: '总考试次数', value: '0', icon: Edit, color: '#409EFF' },
  { title: '通过次数', value: '0', icon: CircleCheck, color: '#67C23A' },
  { title: '未通过次数', value: '0', icon: CircleClose, color: '#F56C6C' },
  { title: '平均分数', value: '0', icon: Trophy, color: '#E6A23C' }
])

// 方法
const loadData = async () => {
  loading.value = true
  try {
    // 模拟数据加载
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟数据
    const mockData = [
      {
        id: 1,
        examName: '设备安全操作规范考试',
        examType: 'formal',
        totalQuestions: 50,
        totalScore: 100,
        passingScore: 60,
        startTime: '2024-01-15 09:00:00',
        endTime: '2024-01-15 10:00:00',
        duration: 3600, // 秒
        score: 88,
        correctCount: 44,
        isPassed: true,
        status: 'completed'
      },
      {
        id: 2,
        examName: '质量管理体系基础考试',
        examType: 'practice',
        totalQuestions: 30,
        totalScore: 100,
        passingScore: 70,
        startTime: '2024-01-14 14:00:00',
        endTime: '2024-01-14 14:30:00',
        duration: 1800,
        score: 92,
        correctCount: 28,
        isPassed: true,
        status: 'completed'
      },
      {
        id: 3,
        examName: '高级操作技巧考试',
        examType: 'formal',
        totalQuestions: 40,
        totalScore: 100,
        passingScore: 60,
        startTime: null,
        endTime: null,
        duration: null,
        score: null,
        correctCount: null,
        isPassed: null,
        status: 'pending'
      },
      {
        id: 4,
        examName: '应急处理流程考试',
        examType: 'makeup',
        totalQuestions: 25,
        totalScore: 100,
        passingScore: 60,
        startTime: '2024-01-10 16:00:00',
        endTime: '2024-01-10 16:25:00',
        duration: 1500,
        score: 55,
        correctCount: 14,
        isPassed: false,
        status: 'failed'
      }
    ]
    
    // 应用搜索过滤
    let filteredData = mockData
    if (searchForm.examName) {
      filteredData = filteredData.filter(item => 
        item.examName.includes(searchForm.examName)
      )
    }
    if (searchForm.examType) {
      filteredData = filteredData.filter(item => 
        item.examType === searchForm.examType
      )
    }
    if (searchForm.status) {
      filteredData = filteredData.filter(item => {
        if (searchForm.status === 'passed') return item.isPassed === true
        if (searchForm.status === 'failed') return item.isPassed === false
        return item.status === searchForm.status
      })
    }
    
    pagination.total = filteredData.length
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize
    tableData.value = filteredData.slice(startIndex, startIndex + pagination.pageSize)
    
    // 更新统计数据
    const passed = mockData.filter(item => item.isPassed === true).length
    const failed = mockData.filter(item => item.isPassed === false).length
    const avgScore = mockData.filter(item => item.score !== null).reduce((sum, item, _, arr) => 
      sum + item.score / arr.length, 0)
    
    statCards.value = [
      { title: '总考试次数', value: mockData.length.toString(), icon: Edit, color: '#409EFF' },
      { title: '通过次数', value: passed.toString(), icon: CircleCheck, color: '#67C23A' },
      { title: '未通过次数', value: failed.toString(), icon: CircleClose, color: '#F56C6C' },
      { title: '平均分数', value: Math.round(avgScore).toString(), icon: Trophy, color: '#E6A23C' }
    ]
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error('加载考试记录失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

const handleReset = () => {
  Object.assign(searchForm, {
    examName: '',
    examType: '',
    status: ''
  })
  handleSearch()
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
  loadData()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  loadData()
}

const handleView = (row) => {
  ElMessage.info('查看考试详情功能开发中...')
}

const handleStartExam = (row) => {
  ElMessage.info('开始考试功能开发中...')
}

const handleRetakeExam = (row) => {
  ElMessage.info('补考功能开发中...')
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 辅助方法
const formatDuration = (seconds) => {
  if (!seconds) return '-'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分钟`
}

const getExamTypeTagType = (type) => {
  const types = {
    practice: 'info',
    formal: 'primary',
    makeup: 'warning'
  }
  return types[type] || 'info'
}

const getScoreTagType = (score, passingScore) => {
  if (score >= passingScore) return 'success'
  if (score >= passingScore - 10) return 'warning'
  return 'danger'
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.my-exams {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.text-right {
  text-align: right;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
}

.stat-card-info {
  text-align: right;
}

.stat-card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-card-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
  }
  
  .search-form .el-form-item {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .pagination {
    justify-content: center;
  }
}
</style>