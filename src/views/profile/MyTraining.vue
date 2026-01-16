<template>
  <div class="my-training">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-row :gutter="20" align="middle">
        <el-col :span="12">
          <h2>{{ $t('nav.mytraining') }}</h2>
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
        <el-form-item :label="$t('course.courseName')">
          <el-input
            v-model="searchForm.courseName"
            :placeholder="$t('common.pleaseEnter')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('training.planTitle')">
          <el-input
            v-model="searchForm.planTitle"
            :placeholder="$t('common.pleaseEnter')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('training.progress')">
          <el-select
            v-model="searchForm.progress"
            :placeholder="$t('common.pleaseSelect')"
            clearable
            style="width: 150px"
          >
            <el-option :label="$t('training.notStarted')" value="not_started" />
            <el-option :label="$t('training.inProgress')" value="in_progress" />
            <el-option :label="$t('training.completed')" value="completed" />
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

    <!-- 培训记录表格 -->
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
          prop="planTitle"
          :label="$t('training.planTitle')"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          prop="courseName"
          :label="$t('course.courseName')"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          prop="courseType"
          :label="$t('course.courseType')"
          width="120"
          align="center"
        >
          <template #default="scope">
            <el-tag :type="getCourseTypeTagType(scope.row.courseType)">
              {{ getCourseTypeLabel(scope.row.courseType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="instructor"
          :label="$t('course.instructor')"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="startDate"
          :label="$t('training.startDate')"
          width="150"
          align="center"
        />
        <el-table-column
          prop="endDate"
          :label="$t('training.endDate')"
          width="150"
          align="center"
        />
        <el-table-column
          prop="totalHours"
          :label="$t('training.totalHours')"
          width="100"
          align="center"
        >
          <template #default="scope">
            {{ scope.row.totalHours }} 小时
          </template>
        </el-table-column>
        <el-table-column
          prop="studyDuration"
          :label="$t('training.studyDuration')"
          width="120"
          align="center"
        >
          <template #default="scope">
            {{ scope.row.studyDuration }} 小时
          </template>
        </el-table-column>
        <el-table-column
          prop="progress"
          :label="$t('training.progress')"
          width="150"
          align="center"
        >
          <template #default="scope">
            <el-progress
              :percentage="scope.row.progress"
              :color="getProgressColor(scope.row.progress)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="score"
          :label="$t('common.score')"
          width="100"
          align="center"
        >
          <template #default="scope">
            <el-tag v-if="scope.row.score !== null" :type="getScoreTagType(scope.row.score)">
              {{ scope.row.score }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          :label="$t('common.status')"
          width="100"
          align="center"
          fixed="right"
        >
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
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
              v-if="scope.row.status === 'in_progress'"
              type="success"
              :icon="Reading"
              circle
              size="small"
              @click="handleContinue(scope.row)"
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
  Reading,
  Download,
  Notebook,
  User,
  EditPen,
  Certificate
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

// 响应式数据
const router = useRouter()
const loading = ref(false)
const tableRef = ref()

// 搜索表单
const searchForm = reactive({
  courseName: '',
  planTitle: '',
  progress: ''
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
  { title: '总培训次数', value: '0', icon: Notebook, color: '#409EFF' },
  { title: '已完成课程', value: '0', icon: User, color: '#67C23A' },
  { title: '进行中课程', value: '0', icon: Reading, color: '#E6A23C' },
  { title: '平均分数', value: '0', icon: EditPen, color: '#909399' }
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
        planTitle: '新员工入职培训计划',
        courseName: '设备安全操作规范',
        courseType: 'offline',
        instructor: '李师傅',
        startDate: '2024-01-10',
        endDate: '2024-01-15',
        totalHours: 16,
        studyDuration: 12,
        progress: 75,
        score: 88,
        status: 'in_progress'
      },
      {
        id: 2,
        planTitle: '质量意识培训计划',
        courseName: '质量管理体系基础',
        courseType: 'online',
        instructor: '王主管',
        startDate: '2024-01-05',
        endDate: '2024-01-08',
        totalHours: 8,
        studyDuration: 8,
        progress: 100,
        score: 92,
        status: 'completed'
      },
      {
        id: 3,
        planTitle: '技能提升培训计划',
        courseName: '高级操作技巧',
        courseType: 'mixed',
        instructor: '张工程师',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        totalHours: 24,
        studyDuration: 0,
        progress: 0,
        score: null,
        status: 'not_started'
      },
      {
        id: 4,
        planTitle: '安全生产培训计划',
        courseName: '应急处理流程',
        courseType: 'offline',
        instructor: '安全主管',
        startDate: '2024-01-08',
        endDate: '2024-01-10',
        totalHours: 12,
        studyDuration: 12,
        progress: 100,
        score: 85,
        status: 'completed'
      }
    ]
    
    // 应用搜索过滤
    let filteredData = mockData
    if (searchForm.courseName) {
      filteredData = filteredData.filter(item => 
        item.courseName.includes(searchForm.courseName)
      )
    }
    if (searchForm.planTitle) {
      filteredData = filteredData.filter(item => 
        item.planTitle.includes(searchForm.planTitle)
      )
    }
    if (searchForm.progress) {
      filteredData = filteredData.filter(item => {
        if (searchForm.progress === 'not_started') return item.progress === 0
        if (searchForm.progress === 'in_progress') return item.progress > 0 && item.progress < 100
        if (searchForm.progress === 'completed') return item.progress === 100
        return true
      })
    }
    
    pagination.total = filteredData.length
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize
    tableData.value = filteredData.slice(startIndex, startIndex + pagination.pageSize)
    
    // 更新统计数据
    const completed = mockData.filter(item => item.status === 'completed').length
    const inProgress = mockData.filter(item => item.status === 'in_progress').length
    const totalHours = mockData.reduce((sum, item) => sum + item.studyDuration, 0)
    const avgScore = mockData.filter(item => item.score !== null).reduce((sum, item, _, arr) => 
      sum + (item.score || 0) / arr.length, 0)
    
    statCards.value = [
      { title: '总培训次数', value: mockData.length.toString(), icon: Notebook, color: '#409EFF' },
      { title: '已完成课程', value: completed.toString(), icon: User, color: '#67C23A' },
      { title: '进行中课程', value: inProgress.toString(), icon: Reading, color: '#E6A23C' },
      { title: '平均分数', value: Math.round(avgScore).toString(), icon: EditPen, color: '#909399' }
    ]
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error('加载培训记录失败:', error)
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
    courseName: '',
    planTitle: '',
    progress: ''
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
  ElMessage.info('查看培训详情功能开发中...')
}

const handleContinue = (row) => {
  ElMessage.info('继续学习功能开发中...')
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 辅助方法
const getCourseTypeLabel = (type) => {
  const labels = {
    online: '在线课程',
    offline: '线下培训',
    mixed: '混合式'
  }
  return labels[type] || type
}

const getCourseTypeTagType = (type) => {
  const types = {
    online: 'primary',
    offline: 'success',
    mixed: 'warning'
  }
  return types[type] || 'info'
}

const getStatusLabel = (status) => {
  const labels = {
    not_started: '未开始',
    in_progress: '进行中',
    completed: '已完成'
  }
  return labels[status] || status
}

const getStatusTagType = (status) => {
  const types = {
    not_started: 'info',
    in_progress: 'primary',
    completed: 'success'
  }
  return types[status] || 'info'
}

const getProgressColor = (progress) => {
  if (progress === 0) return '#909399'
  if (progress < 50) return '#F56C6C'
  if (progress < 80) return '#E6A23C'
  if (progress < 100) return '#409EFF'
  return '#67C23A'
}

const getScoreTagType = (score) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'primary'
  if (score >= 60) return 'warning'
  return 'danger'
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.my-training {
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