<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="24" :sm="12" :md="6" v-for="card in statCards" :key="card.titleKey">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-card-content">
            <el-icon :size="48" :color="card.color">
              <component :is="card.icon" />
            </el-icon>
            <div class="stat-card-info">
              <div class="stat-card-title">{{ t(`common.${card.titleKey}`) }}</div>
              <div class="stat-card-value">{{ card.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-section">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>{{ t('common.trainingCompletionTrend') }}</span>
              <el-date-picker
                v-model="trainingDateRange"
                type="daterange"
                :range-separator="$t('common.to')"
                :start-placeholder="$t('common.startPlaceholder')"
                :end-placeholder="$t('common.endPlaceholder')"
                size="small"
                style="width: 240px"
              />
            </div>
          </template>
          <div ref="trainingChart" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>{{ t('common.examScoreDistribution') }}</span>
              <el-select v-model="examFilter" size="small" style="width: 120px">
                <el-option :label="$t('common.all')" value="all" />
                <el-option :label="$t('common.thisMonth')" value="month" />
                <el-option :label="$t('common.thisWeek')" value="week" />
              </el-select>
            </div>
          </template>
          <div ref="examChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作和待办事项 -->
    <el-row :gutter="20" class="bottom-section">
      <el-col :xs="24" :lg="12">
        <el-card class="quick-actions">
          <template #header>
            <span>{{ t('common.quickActions') }}</span>
          </template>
          <el-row :gutter="20">
            <el-col :span="8" v-for="action in quickActions" :key="action.titleKey">
              <div class="quick-action-item" @click="handleQuickAction(action)">
                <el-icon :size="32" :color="action.color">
                  <component :is="action.icon" />
                </el-icon>
                <span>{{ t(`common.${action.titleKey}`) }}</span>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card class="todo-list">
          <template #header>
            <span>{{ t('common.todoList') }}</span>
            <el-badge :value="todoCount" class="todo-badge" />
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="todo in todoList"
              :key="todo.id"
              :timestamp="todo.timestamp"
              :type="todo.type"
            >
              {{ t(`common.${todo.contentKey}`) }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import * as echarts from 'echarts'
import {
  Notebook,
  User,
  EditPen,
  DocumentChecked as Certificate,
  Plus,
  Calendar,
  Edit,
  Star
} from '@element-plus/icons-vue'

const router = useRouter()
const { t } = useI18n()

// 统计卡片
const statCards = ref([
  { titleKey: 'totalCourses', value: '156', icon: Notebook, color: '#409EFF' },
  { titleKey: 'totalTrainees', value: '1 234', icon: User, color: '#67C23A' },
  { titleKey: 'totalExams', value: '892', icon: EditPen, color: '#E6A23C' },
  { titleKey: 'totalCertificates', value: '567', icon: Certificate, color: '#909399' }
])

// 图表相关
const trainingChart = ref()
const examChart = ref()
let trainingChartInstance = null
let examChartInstance = null

const trainingDateRange = ref([])
const examFilter = ref('all')

// 快捷操作
const quickActions = ref([
  { titleKey: 'addCourse', icon: Plus, color: '#409EFF', action: 'course' },
  { titleKey: 'createTraining', icon: Calendar, color: '#67C23A', action: 'training' },
  { titleKey: 'scheduleExam', icon: Edit, color: '#E6A23C', action: 'exam' },
  { titleKey: 'competencyAssessment', icon: Star, color: '#909399', action: 'assessment' }
])

// 待办事项
const todoCount = ref(3)
const todoList = ref([
  { id: 1, contentKey: 'approveTrainingPlan', timestamp: '2024-01-15', type: 'warning' },
  { id: 2, contentKey: 'publishMonthlyCourses', timestamp: '2024-01-16', type: 'primary' },
  { id: 3, contentKey: 'reviewCompetencyAssessment', timestamp: '2024-01-17', type: 'info' }
])

// 初始化图表
const initCharts = () => {
  // 培训完成率趋势图
  trainingChartInstance = echarts.init(trainingChart.value)
  const trainingOption = {
    tooltip: { trigger: 'axis' },
    legend: {
      data: [t('common.completionRate'), t('common.totalTrainees')]
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: [
      {
        type: 'value',
        name: t('common.completionRate') + '(%)',
        min: 0,
        max: 100
      },
      {
        type: 'value',
        name: t('common.totalTrainees'),
        min: 0
      }
    ],
    series: [
      {
        name: t('common.completionRate'),
        type: 'line',
        yAxisIndex: 0,
        data: [85, 88, 90, 89, 94, 96],
        itemStyle: { color: '#409EFF' }
      },
      {
        name: t('common.totalTrainees'),
        type: 'bar',
        yAxisIndex: 1,
        data: [120, 132, 101, 134, 90, 230],
        itemStyle: { color: '#67C23A' }
      }
    ]
  }
  trainingChartInstance.setOption(trainingOption)

  // 考试成绩分布图
  examChartInstance = echarts.init(examChart.value)
  const examOption = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: t('common.examScoreDistribution'),
        type: 'pie',
        radius: '50%',
        data: [
          { value: 35, name: t('common.excellent'), itemStyle: { color: '#67C23A' } },
          { value: 45, name: t('common.good'), itemStyle: { color: '#409EFF' } },
          { value: 15, name: t('common.pass'), itemStyle: { color: '#E6A23C' } },
          { value: 5, name: t('common.fail'), itemStyle: { color: '#F56C6C' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  examChartInstance.setOption(examOption)
}

// 加载统计数据
const loadStatistics = async () => {
  // 模拟数据
  statCards.value = [
    { titleKey: 'totalCourses', value: '156', icon: Notebook, color: '#409EFF' },
    { titleKey: 'totalTrainees', value: '1 234', icon: User, color: '#67C23A' },
    { titleKey: 'totalExams', value: '892', icon: EditPen, color: '#E6A23C' },
    { titleKey: 'totalCertificates', value: '567', icon: Certificate, color: '#909399' }
  ]
}

// 处理快捷操作
const handleQuickAction = (action) => {
  const router = useRouter()
  switch (action.action) {
    case 'course':
      router.push('/courses')
      break
    case 'training':
      router.push('/training-plans')
      break
    case 'exam':
      router.push('/exams')
      break
    case 'assessment':
      router.push('/assessments')
      break
  }
}

// 响应式图表
const handleResize = () => {
  trainingChartInstance?.resize()
  examChartInstance?.resize()
}

onMounted(() => {
  loadStatistics()
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  trainingChartInstance?.dispose()
  examChartInstance?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
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

.chart-section {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-header span:first-of-type {
  margin-right: 15px;
}
.chart-container {
  height: 300px;
}

.bottom-section {
  margin-bottom: 20px;
}

.quick-actions {
  margin-bottom: 20px;
}

.quick-action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.quick-action-item:hover {
  background-color: #f5f7fa;
}

.quick-action-item span {
  margin-top: 10px;
  font-size: 14px;
  color: #606266;
}

.todo-list {
  margin-bottom: 20px;
}

.todo-badge {
  margin-left: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard {
    padding: 10px;
  }
  
  .chart-container {
    height: 250px;
  }
  
  .quick-action-item {
    padding: 15px;
  }
}
</style>