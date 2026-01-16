<template>
  <div class="my-certificates">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-row :gutter="20" align="middle">
        <el-col :span="12">
          <h2>{{ $t('nav.mycertificates') }}</h2>
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
        <el-form-item :label="$t('competency.certificate')">
          <el-input
            v-model="searchForm.certificateName"
            :placeholder="$t('common.pleaseEnter')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('competency.certificateType')">
          <el-select
            v-model="searchForm.certificateType"
            :placeholder="$t('common.pleaseSelect')"
            clearable
            style="width: 150px"
          >
            <el-option label="培训证书" value="training" />
            <el-option label="资格证书" value="qualification" />
            <el-option label="技能证书" value="skill" />
            <el-option label="安全证书" value="safety" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('common.status')">
          <el-select
            v-model="searchForm.status"
            :placeholder="$t('common.pleaseSelect')"
            clearable
            style="width": "150px"
          >
            <el-option :label="$t('common.valid')" value="valid" />
            <el-option :label="$t('common.expired')" value="expired" />
            <el-option :label="$t('common.expiringSoon')" value="expiring_soon" />
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

    <!-- 证书展示 -->
    <el-row :gutter="20" class="certificate-grid">
      <el-col
        v-for="certificate in certificateData"
        :key="certificate.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
      >
        <el-card class="certificate-card" shadow="hover">
          <div class="certificate-header">
            <el-avatar
              :size="64"
              :src="certificate.icon"
              class="certificate-icon"
            >
              <el-icon :size="32"><Certificate /></el-icon>
            </el-avatar>
            <div class="certificate-title">
              <h4>{{ certificate.name }}</h4>
              <p>{{ certificate.certificateNo }}</p>
            </div>
          </div>
          
          <el-divider />
          
          <div class="certificate-info">
            <el-row :gutter="10">
              <el-col :span="12">
                <div class="info-item">
                  <span class="info-label">{{ $t('competency.certificateType') }}:</span>
                  <span class="info-value">{{ getCertificateTypeLabel(certificate.certificateType) }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <span class="info-label">{{ $t('common.level') }}:</span>
                  <span class="info-value">{{ certificate.level }}</span>
                </div>
              </el-col>
            </el-row>
            
            <div class="info-item">
              <span class="info-label">{{ $t('competency.issueDate') }}:</span>
              <span class="info-value">{{ certificate.issueDate }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">{{ $t('competency.expiryDate') }}:</span>
              <span class="info-value">{{ certificate.expiryDate || $t('common.permanent') }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">{{ $t('common.status') }}:</span>
              <el-tag :type="getStatusTagType(certificate.status)">
                {{ getStatusLabel(certificate.status) }}
              </el-tag>
            </div>
            
            <div class="info-item">
              <span class="info-label">{{ $t('competency.verificationCode') }}:</span>
              <span class="info-value verification-code">{{ certificate.verificationCode }}</span>
            </div>
          </div>
          
          <el-divider />
          
          <div class="certificate-actions">
            <el-button
              type="primary"
              :icon="View"
              size="small"
              style="width: 100%"
              @click="handleView(certificate)"
            >
              {{ $t('common.view') }}
            </el-button>
            <el-row :gutter="5" style="margin-top: 10px">
              <el-col :span="12">
                <el-button
                  :icon="Download"
                  size="small"
                  style="width: 100%"
                  @click="handleDownload(certificate)"
                >
                  {{ $t('common.download') }}
                </el-button>
              </el-col>
              <el-col :span="12">
                <el-button
                  :icon="View"
                  size="small"
                  style="width: 100%"
                  @click="handleVerify(certificate)"
                >
                  {{ $t('common.verify') }}
                </el-button>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      :page-sizes="[12, 24, 48, 96]"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      class="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Search, 
  Refresh, 
  View,
  Download,
  Certificate,
  Warning,
  CircleCheck,
  Clock
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)

// 搜索表单
const searchForm = reactive({
  certificateName: '',
  certificateType: '',
  status: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 12,
  total: 0
})

// 证书数据
const certificateData = ref([])

// 统计卡片
const statCards = ref([
  { title: '总证书数', value: '0', icon: Certificate, color: '#409EFF' },
  { title: '有效证书', value: '0', icon: CircleCheck, color: '#67C23A' },
  { title: '即将过期', value: '0', icon: Clock, color: '#E6A23C' },
  { title: '已过期', value: '0', icon: Warning, color: '#F56C6C' }
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
        name: '设备操作安全证书',
        certificateNo: 'CERT-2024-001',
        certificateType: 'safety',
        level: '初级',
        issueDate: '2024-01-15',
        expiryDate: '2027-01-15',
        verificationCode: 'VER123456789',
        status: 'valid'
      },
      {
        id: 2,
        name: '质量管理体系培训证书',
        certificateNo: 'CERT-2024-002',
        certificateType: 'training',
        level: '中级',
        issueDate: '2024-01-10',
        expiryDate: null,
        verificationCode: 'VER987654321',
        status: 'valid'
      },
      {
        id: 3,
        name: '高级操作技能证书',
        certificateNo: 'CERT-2024-003',
        certificateType: 'skill',
        level: '高级',
        issueDate: '2023-12-20',
        expiryDate: '2024-12-20',
        verificationCode: 'VER456789123',
        status: 'expiring_soon'
      },
      {
        id: 4,
        name: '安全生产资格证书',
        certificateNo: 'CERT-2023-001',
        certificateType: 'qualification',
        level: '中级',
        issueDate: '2023-01-05',
        expiryDate: '2024-01-05',
        verificationCode: 'VER789123456',
        status: 'expired'
      }
    ]
    
    // 应用搜索过滤
    let filteredData = mockData
    if (searchForm.certificateName) {
      filteredData = filteredData.filter(item => 
        item.name.includes(searchForm.certificateName)
      )
    }
    if (searchForm.certificateType) {
      filteredData = filteredData.filter(item => 
        item.certificateType === searchForm.certificateType
      )
    }
    if (searchForm.status) {
      filteredData = filteredData.filter(item => 
        item.status === searchForm.status
      )
    }
    
    pagination.total = filteredData.length
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize
    certificateData.value = filteredData.slice(startIndex, startIndex + pagination.pageSize)
    
    // 更新统计数据
    const valid = mockData.filter(item => item.status === 'valid').length
    const expired = mockData.filter(item => item.status === 'expired').length
    const expiringSoon = mockData.filter(item => item.status === 'expiring_soon').length
    
    statCards.value = [
      { title: '总证书数', value: mockData.length.toString(), icon: Certificate, color: '#409EFF' },
      { title: '有效证书', value: valid.toString(), icon: CircleCheck, color: '#67C23A' },
      { title: '即将过期', value: expiringSoon.toString(), icon: Clock, color: '#E6A23C' },
      { title: '已过期', value: expired.toString(), icon: Warning, color: '#F56C6C' }
    ]
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error('加载证书数据失败:', error)
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
    certificateName: '',
    certificateType: '',
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

const handleView = (certificate) => {
  ElMessage.info('查看证书详情功能开发中...')
}

const handleDownload = (certificate) => {
  ElMessage.info('下载证书功能开发中...')
}

const handleVerify = (certificate) => {
  ElMessage.info('证书验证功能开发中...')
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 辅助方法
const getCertificateTypeLabel = (type) => {
  const labels = {
    training: '培训证书',
    qualification: '资格证书',
    skill: '技能证书',
    safety: '安全证书'
  }
  return labels[type] || type
}

const getStatusLabel = (status) => {
  const labels = {
    valid: '有效',
    expired: '已过期',
    expiring_soon: '即将过期'
  }
  return labels[status] || status
}

const getStatusTagType = (status) => {
  const types = {
    valid: 'success',
    expired: 'danger',
    expiring_soon: 'warning'
  }
  return types[status] || 'info'
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.my-certificates {
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

.certificate-grid {
  margin-bottom: 20px;
}

.certificate-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.certificate-card:hover {
  transform: translateY(-5px);
}

.certificate-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.certificate-icon {
  margin-right: 15px;
}

.certificate-title h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #303133;
}

.certificate-title p {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.certificate-info {
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}

.info-label {
  color: #606266;
}

.info-value {
  color: #303133;
  font-weight: 500;
}

.verification-code {
  font-family: monospace;
  background-color: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
}

.certificate-actions {
  margin-top: 15px;
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