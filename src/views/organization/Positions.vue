<template>
  <div class="positions">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-row :gutter="20" align="middle">
        <el-col :span="12">
          <h2>{{ $t('nav.positions') }}</h2>
        </el-col>
        <el-col :span="12" class="text-right">
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            {{ $t('common.add') }}
          </el-button>
          <el-button :icon="Download" @click="handleExport">
            {{ $t('common.export') }}
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item :label="$t('position.positionName')">
          <el-input
            v-model="searchForm.name"
            :placeholder="$t('common.pleaseEnter')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="$t('position.positionLevel')">
          <el-select
            v-model="searchForm.level"
            :placeholder="$t('common.pleaseSelect')"
            clearable
            style="width: 150px"
          >
            <el-option :label="$t('position.junior')" value="junior" />
            <el-option :label="$t('position.intermediate')" value="intermediate" />
            <el-option :label="$t('position.senior')" value="senior" />
            <el-option :label="$t('position.expert')" value="expert" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('department.departmentName')">
          <el-input
            v-model="searchForm.department"
            :placeholder="$t('common.pleaseEnter')"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item :label="$t('common.status')">
          <el-select
            v-model="searchForm.status"
            :placeholder="$t('common.pleaseSelect')"
            clearable
            style="width: 120px"
          >
            <el-option :label="$t('common.enabled')" value="enabled" />
            <el-option :label="$t('common.disabled')" value="disabled" />
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

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        ref="tableRef"
        :data="tableData"
        v-loading="loading"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column
          prop="id"
          label="ID"
          width="80"
          show-overflow-tooltip
        />
        <el-table-column
          prop="name"
          :label="$t('position.positionName')"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="code"
          :label="$t('common.code')"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="level"
          :label="$t('position.positionLevel')"
          width="120"
          align="center"
        >
          <template #default="scope">
            <el-tag :type="getLevelTagType(scope.row.level)">
              {{ $t(`position.${scope.row.level}`) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="department"
          :label="$t('department.departmentName')"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="employeeCount"
          :label="$t('position.employeeCount')"
          width="100"
          align="center"
        />
        <el-table-column
          prop="requiredTrainingHours"
          :label="$t('position.requiredTrainingHours')"
          width="140"
          align="center"
        >
          <template #default="scope">
            {{ scope.row.requiredTrainingHours }} 小时
          </template>
        </el-table-column>
        <el-table-column
          prop="minExperience"
          :label="$t('position.minExperience')"
          width="140"
          align="center"
        >
          <template #default="scope">
            {{ scope.row.minExperience }} 年
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          :label="$t('common.status')"
          width="100"
          align="center"
        >
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              active-value="enabled"
              inactive-value="disabled"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          :label="$t('common.createTime')"
          width="180"
          align="center"
        />
        <el-table-column
          :label="$t('common.operate')"
          width="180"
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
              type="warning"
              :icon="Edit"
              circle
              size="small"
              @click="handleEdit(scope.row)"
            />
            <el-button
              type="danger"
              :icon="Delete"
              circle
              size="small"
              @click="handleDelete(scope.row)"
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="140px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('position.positionName')" prop="name">
              <el-input
                v-model="formData.name"
                :placeholder="$t('common.pleaseEnter')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('common.code')" prop="code">
              <el-input
                v-model="formData.code"
                :placeholder="$t('common.pleaseEnter')"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('position.positionLevel')" prop="level">
              <el-select
                v-model="formData.level"
                :placeholder="$t('common.pleaseSelect')"
                style="width: 100%"
              >
                <el-option :label="$t('position.junior')" value="junior" />
                <el-option :label="$t('position.intermediate')" value="intermediate" />
                <el-option :label="$t('position.senior')" value="senior" />
                <el-option :label="$t('position.expert')" value="expert" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('department.departmentName')" prop="department">
              <el-input
                v-model="formData.department"
                :placeholder="$t('common.pleaseEnter')"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('position.requiredTrainingHours')" prop="requiredTrainingHours">
              <el-input-number
                v-model="formData.requiredTrainingHours"
                :min="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('position.minExperience')" prop="minExperience">
              <el-input-number
                v-model="formData.minExperience"
                :min="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item :label="$t('position.minEducation')" prop="minEducation">
          <el-select
            v-model="formData.minEducation"
            :placeholder="$t('common.pleaseSelect')"
            style="width: 100%"
          >
            <el-option label="初中及以下" value="middle_school" />
            <el-option label="高中/中专" value="high_school" />
            <el-option label="大专" value="associate" />
            <el-option label="本科" value="bachelor" />
            <el-option label="硕士" value="master" />
            <el-option label="博士" value="phd" />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="$t('position.responsibilities')" prop="responsibilities">
          <el-input
            v-model="formData.responsibilities"
            type="textarea"
            :rows="3"
            :placeholder="$t('common.pleaseEnter')"
          />
        </el-form-item>
        
        <el-form-item :label="$t('position.qualifications')" prop="qualifications">
          <el-input
            v-model="formData.qualifications"
            type="textarea"
            :rows="3"
            :placeholder="$t('common.pleaseEnter')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogClose">
          {{ $t('common.cancel') }}
        </el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ $t('common.save') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  Search, 
  Refresh, 
  Edit, 
  Delete, 
  View,
  Download
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogType = ref('add') // add or edit
const tableRef = ref()
const formRef = ref()
const selectedRows = ref([])

// 搜索表单
const searchForm = reactive({
  name: '',
  level: '',
  department: '',
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

// 表单数据
const formData = reactive({
  id: null,
  name: '',
  code: '',
  level: 'junior',
  department: '',
  employeeCount: 0,
  requiredTrainingHours: 0,
  minExperience: 0,
  minEducation: 'bachelor',
  responsibilities: '',
  qualifications: '',
  status: 'enabled'
})

// 表单验证规则
const formRules = reactive({
  name: [
    { required: true, message: '请输入岗位名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入岗位编码', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请选择岗位级别', trigger: 'change' }
  ],
  department: [
    { required: true, message: '请输入所属部门', trigger: 'blur' }
  ],
  requiredTrainingHours: [
    { required: true, message: '请输入要求培训时长', trigger: 'blur' },
    { type: 'number', min: 0, message: '培训时长不能为负数', trigger: 'blur' }
  ],
  minExperience: [
    { required: true, message: '请输入最低工作经验', trigger: 'blur' },
    { type: 'number', min: 0, message: '工作经验不能为负数', trigger: 'blur' }
  ]
})

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
        name: '初级操作工',
        code: 'OP-JUNIOR',
        level: 'junior',
        department: '生产部',
        employeeCount: 25,
        requiredTrainingHours: 40,
        minExperience: 0,
        minEducation: 'high_school',
        responsibilities: '负责生产线设备的基本操作和日常维护',
        qualifications: '高中以上学历，身体健康，能适应倒班工作',
        status: 'enabled',
        createTime: '2024-01-10 10:00:00'
      },
      {
        id: 2,
        name: '中级技术员',
        code: 'TECH-MID',
        level: 'intermediate',
        department: '技术部',
        employeeCount: 12,
        requiredTrainingHours: 80,
        minExperience: 2,
        minEducation: 'associate',
        responsibilities: '负责设备调试、故障排除和技术改进',
        qualifications: '大专以上学历，2年以上相关工作经验',
        status: 'enabled',
        createTime: '2024-01-12 14:30:00'
      },
      {
        id: 3,
        name: '高级工程师',
        code: 'ENG-SENIOR',
        level: 'senior',
        department: '研发部',
        employeeCount: 8,
        requiredTrainingHours: 120,
        minExperience: 5,
        minEducation: 'bachelor',
        responsibilities: '负责新产品研发、技术方案制定和团队管理',
        qualifications: '本科以上学历，5年以上研发经验',
        status: 'enabled',
        createTime: '2024-01-15 09:15:00'
      }
    ]
    
    // 应用搜索过滤
    let filteredData = mockData
    if (searchForm.name) {
      filteredData = filteredData.filter(item => 
        item.name.includes(searchForm.name)
      )
    }
    if (searchForm.level) {
      filteredData = filteredData.filter(item => 
        item.level === searchForm.level
      )
    }
    if (searchForm.department) {
      filteredData = filteredData.filter(item => 
        item.department.includes(searchForm.department)
      )
    }
    if (searchForm.status) {
      filteredData = filteredData.filter(item => 
        item.status === searchForm.status
      )
    }
    
    pagination.total = filteredData.length
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize
    tableData.value = filteredData.slice(startIndex, startIndex + pagination.pageSize)
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error('加载岗位数据失败:', error)
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
    name: '',
    level: '',
    department: '',
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

const handleSelectionChange = (val) => {
  selectedRows.value = val
}

const handleAdd = () => {
  dialogTitle.value = '新增岗位'
  dialogType.value = 'add'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑岗位'
  dialogType.value = 'edit'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleView = (row) => {
  // 查看详情
  ElMessage.info('查看功能开发中...')
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该岗位吗？', '提示', {
      type: 'warning'
    })
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除岗位失败:', error)
    }
  }
}

const handleStatusChange = async (row) => {
  try {
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('状态更新失败')
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
  }
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success(dialogType.value === 'add' ? '新增成功' : '更新成功')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    if (error !== false) {
      ElMessage.error(dialogType.value === 'add' ? '新增失败' : '更新失败')
      console.error('提交表单失败:', error)
    }
  } finally {
    submitLoading.value = false
  }
}

const handleDialogClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    name: '',
    code: '',
    level: 'junior',
    department: '',
    employeeCount: 0,
    requiredTrainingHours: 0,
    minExperience: 0,
    minEducation: 'bachelor',
    responsibilities: '',
    qualifications: '',
    status: 'enabled'
  })
}

const getLevelTagType = (level) => {
  const types = {
    junior: 'info',
    intermediate: 'success',
    senior: 'warning',
    expert: 'danger'
  }
  return types[level] || 'info'
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.positions {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.text-right {
  text-align: right;
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