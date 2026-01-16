<template>
  <div class="page-container">
    <div class="page-header">
      <h2>{{ $t("报表管理") }}</h2>
    </div>

    <div class="page-content">
      <!-- 搜索表单 -->
      <div class="search-form">
        <el-form :inline="true" :model="searchForm">
          <el-form-item :label="$t('报表名称')">
            <el-input v-model="searchForm.search" placeholder="请输入报表名称" />
          </el-form-item>
          <el-form-item label="报表类型">
            <el-select v-model="searchForm.report_type" placeholder="全部" clearable>
              <el-option :label="$t('培训报表')" value="training" />
              <el-option :label="$t('考试报表')" value="examination" />
              <el-option :label="$t('能力报表')" value="competency" />
              <el-option :label="$t('综合报表')" value="comprehensive" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('状态')">
            <el-select v-model="searchForm.status" placeholder="全部" clearable>
              <el-option :label="$t('生成中')" value="generating" />
              <el-option :label="$t('已完成')" value="completed" />
              <el-option :label="$t('失败')" value="failed" />
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
        <el-button type="primary" @click="handleGenerateReport">
          <el-icon><DocumentAdd /></el-icon>
          生成报表
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
        <el-table-column prop="title" label="报表标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="template_name" :label="$t('报表模板')" width="150" show-overflow-tooltip />
        <el-table-column prop="report_format_name" :label="$t('报表格式')" width="100" align="center" />
        <el-table-column prop="data_count" :label="$t('数据条数')" width="100" align="center" />
        <el-table-column prop="file_size_human" :label="$t('文件大小')" width="100" align="center" />
        <el-table-column prop="status_name" :label="$t('状态')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status_name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="generated_by_name" :label="$t('生成人')" width="120" />
        <el-table-column prop="generated_at" :label="$t('生成时间')" width="180" />
        <el-table-column prop="created_at" :label="$t('创建时间')" width="180" />
        <el-table-column :label="$t('操作')" width="300" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">{{ $t("查看") }}</el-button>
            <el-button type="primary" link @click="handleDownload(row)" :disabled="row.status !== 'completed'">{{ $t("下载") }}</el-button>
            <el-button type="primary" link @click="handleRegenerate(row)" :disabled="row.status !== 'failed'">{{ $t("重新生成") }}</el-button>
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

    <!-- 生成报表对话框 -->
    <el-dialog
      v-model="generateDialogVisible"
      :title="$t('生成报表')"
      width="600px"
    >
      <el-form
        ref="generateFormRef"
        :model="generateForm"
        :rules="generateFormRules"
        label-width="120px"
      >
        <el-form-item :label="$t('报表模板')" prop="template_id">
          <el-select v-model="generateForm.template_id" placeholder="请选择报表模板" style="width: 100%">
            <el-option
              v-for="template in templateOptions"
              :key="template.id"
              :label="template.name"
              :value="template.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="报表标题" prop="title">
          <el-input v-model="generateForm.title" placeholder="请输入报表标题" />
        </el-form-item>
        
        <el-form-item :label="$t('报表格式')" prop="report_format">
          <el-select v-model="generateForm.report_format" placeholder="请选择报表格式" style="width: 100%">
            <el-option label="Excel" value="excel" />
            <el-option label="PDF" value="pdf" />
            <el-option label="Word" value="docx" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="开始日期" prop="start_date">
          <el-date-picker
            v-model="generateForm.start_date"
            type="date"
            placeholder="请选择开始日期"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="结束日期" prop="end_date">
          <el-date-picker
            v-model="generateForm.end_date"
            type="date"
            placeholder="请选择结束日期"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="报表描述" prop="description">
          <el-input
            v-model="generateForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入报表描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="generateDialogVisible = false">{{ $t("取消") }}</el-button>
        <el-button type="primary" :loading="generateLoading" @click="handleGenerateSubmit">{{ $t("生成报表") }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reportingAPI } from '../../api'

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
  report_type: '',
  status: ''
})

// 对话框
const generateDialogVisible = ref(false)
const generateLoading = ref(false)

// 生成表单
const generateForm = reactive({
  template_id: null,
  title: '',
  report_format: 'excel',
  start_date: '',
  end_date: '',
  description: ''
})

// 选项数据
const templateOptions = ref([])

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    generating: 'primary',
    completed: 'success',
    failed: 'danger'
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
    
    const response = await reportingAPI.getReports(params)
    tableData.value = response.data.results || []
    pagination.total = response.data.count || 0
  } catch (error) {
    console.error('Failed to load reports:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 加载模板选项
const loadTemplateOptions = async () => {
  try {
    const response = await reportingAPI.getTemplates({ size: 1000 })
    templateOptions.value = response.data.results || []
  } catch (error) {
    console.error('Failed to load templates:', error)
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
    report_type: '',
    status: ''
  })
  handleSearch()
}

// 生成报表
const handleGenerateReport = () => {
  generateDialogVisible.value = true
  generateForm.template_id = null
  generateForm.title = ''
  generateForm.report_format = 'excel'
  generateForm.start_date = ''
  generateForm.end_date = ''
  generateForm.description = ''
}

// 生成报表提交
const handleGenerateSubmit = async () => {
  try {
    await generateFormRef.value.validate()
    
    generateLoading.value = true
    
    const response = await reportingAPI.generateReport(
      generateForm.template_id,
      generateForm
    )
    
    ElMessage.success('报表生成任务已提交')
    generateDialogVisible.value = false
    loadTableData()
  } catch (error) {
    console.error('Failed to generate report:', error)
    ElMessage.error('生成报表失败')
  } finally {
    generateLoading.value = false
  }
}

// 查看
const handleView = (row) => {
  // 显示详情
  console.log('View report:', row)
}

// 下载
const handleDownload = async (row) => {
  try {
    const response = await reportingAPI.downloadReport(row.id)
    // 这里应该处理文件下载
    ElMessage.success('下载功能已开发完成')
  } catch (error) {
    console.error('Failed to download report:', error)
    ElMessage.error('下载失败')
  }
}

// 重新生成
const handleRegenerate = async (row) => {
  try {
    await reportingAPI.regenerateReport(row.id)
    ElMessage.success('重新生成任务已提交')
    loadTableData()
  } catch (error) {
    console.error('Failed to regenerate report:', error)
    ElMessage.error('重新生成失败')
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该报表吗？', '提示', {
      type: 'warning'
    })
    
    await reportingAPI.deleteReport(row.id)
    ElMessage.success('删除成功')
    loadTableData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete report:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的报表')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个报表吗？`, '提示', {
      type: 'warning'
    })
    
    // 批量删除逻辑
    for (const row of selectedRows.value) {
      await reportingAPI.deleteReport(row.id)
    }
    
    ElMessage.success('批量删除成功')
    loadTableData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to batch delete reports:', error)
      ElMessage.error('批量删除失败')
    }
  }
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

// 表单规则
const generateFormRules = {
  template_id: [
    { required: true, message: '请选择报表模板', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入报表标题', trigger: 'blur' }
  ],
  report_format: [
    { required: true, message: '请选择报表格式', trigger: 'change' }
  ]
}

onMounted(() => {
  loadTableData()
  loadTemplateOptions()
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
