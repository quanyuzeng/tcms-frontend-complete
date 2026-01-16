<template>
  <div class="audit-logs">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-row :gutter="20" align="middle">
        <el-col :span="12">
          <h2>{{ $t("审计日志") }}</h2>
        </el-col>
        <el-col :span="12" class="text-right">
          <el-button :icon="Download" @click="handleExport">{{ $t('common.export') }}</el-button>
          <el-button :icon="Delete" type="danger" @click="handleBatchDelete">{{ $t('common.batchDelete') }}</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item :label="$t('操作人')">
          <el-input v-model="searchForm.operator" placeholder="请输入操作人姓名" clearable style="width:150px" />
        </el-form-item>
        <el-form-item :label="$t('操作类型')">
          <el-select v-model="searchForm.action" placeholder="请选择操作类型" clearable style="width:150px">
            <el-option :label="$t('登录')" value="login" />
            <el-option :label="$t('登出')" value="logout" />
            <el-option :label="$t('创建')" value="create" />
            <el-option :label="$t('更新')" value="update" />
            <el-option :label="$t('删除')" value="delete" />
            <el-option :label="$t('查询')" value="query" />
            <el-option :label="$t('导出')" value="export" />
            <el-option :label="$t('导入')" value="import" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('模块')">
          <el-select v-model="searchForm.module" placeholder="请选择模块" clearable style="width:150px">
            <el-option :label="$t('用户管理')" value="user" />
            <el-option :label="$t('角色管理')" value="role" />
            <el-option label="课程管理" value="course" />
            <el-option :label="$t('考试管理')" value="exam" />
            <el-option :label="$t('能力管理')" value="competency" />
            <el-option :label="$t('报表管理')" value="report" />
            <el-option label="系统管理" value="system" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('操作时间')">
          <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width:240px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">{{ $t('common.search') }}</el-button>
          <el-button :icon="Refresh" @click="handleReset">{{ $t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table ref="tableRef" :data="tableData" v-loading="loading" stripe style="width:100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" show-overflow-tooltip />
        <el-table-column prop="operator" :label="$t('操作人')" width="120" show-overflow-tooltip />
        <el-table-column prop="action" :label="$t('操作类型')" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getActionTagType(scope.row.action)">{{ getActionLabel(scope.row.action) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" :label="$t('模块')" width="100" align="center">
          <template #default="scope">{{ getModuleLabel(scope.row.module) }}</template>
        </el-table-column>
        <el-table-column prop="description" :label="$t('操作描述')" min-width="200" show-overflow-tooltip />
        <el-table-column prop="ipAddress" :label="$t('IP地址')" width="120" show-overflow-tooltip />
        <el-table-column prop="userAgent" :label="$t('客户端')" min-width="150" show-overflow-tooltip>
          <template #default="scope">
            <el-tooltip :content="scope.row.userAgent" placement="top">
              <span>{{ getClientInfo(scope.row.userAgent) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="$t('状态')" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'">
              {{ scope.row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('操作时间')" width="180" align="center" />
        <el-table-column :label="$t('common.operate')" width="120" fixed="right" align="center">
          <template #default="scope">
            <el-button type="primary" :icon="View" circle size="small" @click="handleView(scope.row)" />
            <el-button type="danger" :icon="Delete" circle size="small" @click="handleDelete(scope.row)" />
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
        :page-sizes="[10,20,50,100]" :total="pagination.total" layout="total,sizes,prev,pager,next,jumper"
        class="pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="日志详情" width="800px" @close="handleDetailDialogClose">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ currentLog.id }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ currentLog.operator }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">
          <el-tag :type="getActionTagType(currentLog.action)">{{ getActionLabel(currentLog.action) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="模块">{{ getModuleLabel(currentLog.module) }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ currentLog.ipAddress }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ currentLog.createTime }}</el-descriptions-item>
        <el-descriptions-item label="状态" :span="2">
          <el-tag :type="currentLog.status === 'success' ? 'success' : 'danger'">
            {{ currentLog.status === 'success' ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作描述" :span="2">{{ currentLog.description }}</el-descriptions-item>
        <el-descriptions-item label="客户端信息" :span="2">{{ currentLog.userAgent }}</el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2">
          <pre>{{ JSON.stringify(currentLog.requestParams, null, 2) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="响应结果" :span="2" v-if="currentLog.responseResult">
          <pre>{{ JSON.stringify(currentLog.responseResult, null, 2) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="错误信息" :span="2" v-if="currentLog.errorMessage">
          <el-tag type="danger">{{ currentLog.errorMessage }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, View, Delete, Download } from '@element-plus/icons-vue'
import { auditLogAPI } from '@/api/reporting'

/* -------- 弹窗状态 -------- */
const detailDialogVisible = ref(false)
const currentLog = ref({})

/* -------- 表格 / 分页 -------- */
const tableRef = ref()
const tableData = ref([])
const loading = ref(false)
const selectedRows = ref([])

const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })
const searchForm = reactive({ operator: '', action: '', module: '', dateRange: [] })

/* -------- 两步关闭（详情弹窗） -------- */
const handleDetailDialogClose = () => { detailDialogVisible.value = false }
watch(detailDialogVisible, val => { if (!val) currentLog.value = {} })

/* -------- 模拟数据加载（保持原逻辑） -------- */
const loadData = async () => {
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  const mock = [
    {
      id: 1, operator: '张三', action: 'login', module: 'user',
      description: '用户登录系统', ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      status: 'success', createTime: '2024-01-15 14:30:00',
      requestParams: { username: 'zhangsan' }, responseResult: { token: 'jwt_xxx' }, errorMessage: null
    },
    {
      id: 2, operator: '李四', action: 'create', module: 'course',
      description: '创建新课程：设备安全操作规范', ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      status: 'success', createTime: '2024-01-15 10:15:00',
      requestParams: { name: '设备安全操作规范' }, responseResult: { id: 15 }, errorMessage: null
    }
  ]
  let filtered = mock
  if (searchForm.operator) filtered = filtered.filter(item => item.operator.includes(searchForm.operator))
  if (searchForm.action) filtered = filtered.filter(item => item.action === searchForm.action)
  if (searchForm.module) filtered = filtered.filter(item => item.module === searchForm.module)
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    const [start, end] = searchForm.dateRange
    filtered = filtered.filter(item => {
      const t = new Date(item.createTime)
      return t >= start && t <= end
    })
  }
  pagination.total = filtered.length
  const start = (pagination.currentPage - 1) * pagination.pageSize
  tableData.value = filtered.slice(start, start + pagination.pageSize)
  loading.value = false
}

/* -------- 业务函数 -------- */
const handleSearch = () => { pagination.currentPage = 1; loadData() }
const handleReset = () => {
  Object.assign(searchForm, { operator: '', action: '', module: '', dateRange: [] })
  handleSearch()
}
const handleSizeChange = val => { pagination.pageSize = val; loadData() }
const handleCurrentChange = val => { pagination.currentPage = val; loadData() }
const handleSelectionChange = val => (selectedRows.value = val)
const handleView = row => {
  currentLog.value = row
  detailDialogVisible.value = true
}
const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定删除该日志吗？', '提示', { type: 'warning' })
  ElMessage.success('删除成功')
  loadData()
}
const handleBatchDelete = async () => {
  if (!selectedRows.value.length) return ElMessage.warning('请先选择日志')
  await ElMessageBox.confirm(`确定批量删除 ${selectedRows.value.length} 条日志吗？`, '提示', { type: 'warning' })
  ElMessage.success('批量删除成功')
  loadData()
}
const handleExport = () => ElMessage.info('导出功能开发中')

/* -------- 辅助函数 -------- */
const getActionLabel = (action) => ({ login: '登录', logout: '登出', create: '创建', update: '更新', delete: '删除', query: '查询', export: '导出', import: '导入' }[action] || action)
const getActionTagType = (action) => ({ login: 'success', logout: 'info', create: 'primary', update: 'warning', delete: 'danger', query: '', export: 'primary', import: 'warning' }[action] || '')
const getModuleLabel = (module) => ({ user: '用户管理', role: '角色管理', course: '课程管理', exam: '考试管理', competency: '能力管理', report: '报表管理', system: '系统管理' }[module] || module)
const getClientInfo = (ua) => (ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : ua.includes('Edge') ? 'Edge' : 'Unknown')

onMounted(() => loadData())
</script>

<style scoped>
.audit-logs { padding: 20px; }
.page-header { margin-bottom: 20px; }
.text-right { text-align: right; }
.search-card { margin-bottom: 20px; }
.search-form { display: flex; flex-wrap: wrap; gap: 10px; }
.table-card { margin-bottom: 20px; }
.pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
pre { background: #f5f7fa; padding: 10px; border-radius: 4px; max-height: 200px; overflow-y: auto; white-space: pre-wrap; word-wrap: break-word; }
@media (max-width: 768px) {
  .search-form { flex-direction: column; }
  .search-form .el-form-item { margin-right: 0; margin-bottom: 10px; }
  .pagination { justify-content: center; }
}
</style>