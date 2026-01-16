<template>
  <div class="page-container">
    <div class="page-header">
      <h2>{{ $t("能力管理") }}</h2>
    </div>

    <div class="page-content">
      <!-- 搜索表单 -->
      <div class="search-form">
        <el-form :inline="true" :model="searchForm">
          <el-form-item :label="$t('能力名称')">
            <el-input v-model="searchForm.search" placeholder="请输入能力名称" />
          </el-form-item>
          <el-form-item :label="$t('能力分类')">
            <el-select v-model="searchForm.category" placeholder="全部" clearable>
              <el-option :label="$t('技术能力')" value="technical" />
              <el-option :label="$t('管理能力')" value="management" />
              <el-option :label="$t('通用能力')" value="general" />
              <el-option :label="$t('专业能力')" value="professional" />
            </el-select>
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
          新增能力
        </el-button>
        <el-button @click="handleBatchDelete" :disabled="selectedRows.length === 0">
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
        <el-button @click="handleViewTree">
          <el-icon><Share /></el-icon>
          能力树
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
        <el-table-column prop="code" :label="$t('能力编码')" width="120" />
        <el-table-column prop="name" :label="$t('能力名称')" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category_name" :label="$t('能力分类')" width="120" />
        <el-table-column prop="level" :label="$t('能力层级')" width="100" align="center" />
        <el-table-column prop="parent_name" :label="$t('上级能力')" width="150" show-overflow-tooltip />
        <el-table-column prop="assessment_count" :label="$t('评估次数')" width="100" align="center" />
        <el-table-column prop="is_active" :label="$t('状态')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'danger'">
              {{ row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" :label="$t('创建时间')" width="180" />
        <el-table-column :label="$t('操作')" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">{{ $t("查看") }}</el-button>
            <el-button type="primary" link @click="handleEdit(row)">{{ $t("编辑") }}</el-button>
            <el-button type="primary" link @click="handleAssess(row)">评估</el-button>
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
      width="700px"
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
            <el-form-item :label="$t('能力编码')" prop="code">
              <el-input v-model="formData.code" placeholder="请输入能力编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('能力名称')" prop="name">
              <el-input v-model="formData.name" placeholder="请输入能力名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item :label="$t('能力描述')" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入能力描述"
          />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('能力分类')" prop="category">
              <el-select v-model="formData.category" placeholder="请选择能力分类" style="width: 100%">
                <el-option :label="$t('技术能力')" value="technical" />
                <el-option :label="$t('管理能力')" value="management" />
                <el-option :label="$t('通用能力')" value="general" />
                <el-option :label="$t('专业能力')" value="professional" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('上级能力')" prop="parent">
              <el-select v-model="formData.parent" placeholder="请选择上级能力" style="width: 100%" clearable>
                <el-option
                  v-for="competency in competencyOptions"
                  :key="competency.id"
                  :label="competency.name"
                  :value="competency.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="能力等级定义" prop="level_definitions">
          <el-input
            v-model="formData.level_definitions"
            type="textarea"
            :rows="4"
            placeholder="请输入各等级的定义，按行分隔"
          />
        </el-form-item>
        
        <el-form-item :label="$t('评估标准')" prop="assessment_criteria">
          <el-input
            v-model="formData.assessment_criteria"
            type="textarea"
            :rows="4"
            placeholder="请输入评估标准"
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

    <!-- 能力树对话框 -->
    <el-dialog
      v-model="treeDialogVisible"
      :title="$t('能力树')"
      width="800px"
    >
      <div v-if="treeData.length > 0">
        <el-tree
          :data="treeData"
          :props="treeProps"
          default-expand-all
          node-key="id"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <span>{{ data.name }} ({{ data.code }})</span>
              <el-tag size="small" :type="data.is_active ? 'success' : 'danger'">
                {{ data.is_active ? '启用' : '禁用' }}
              </el-tag>
            </span>
          </template>
        </el-tree>
      </div>
      <el-empty v-else :description="$t('暂无数据')" />
    </el-dialog>

    <!-- 评估对话框 -->
    <el-dialog
      v-model="assessDialogVisible"
      :title="$t('能力评估')"
      width="600px"
    >
      <el-form
        ref="assessFormRef"
        :model="assessForm"
        :rules="assessFormRules"
        label-width="120px"
      >
        <el-form-item :label="$t('评估员工')" prop="user">
          <el-select v-model="assessForm.user" placeholder="请选择员工" style="width: 100%" filterable>
            <el-option
              v-for="user in userOptions"
              :key="user.id"
              :label="user.first_name + user.last_name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="$t('评估等级')" prop="assessed_level">
          <el-select v-model="assessForm.assessed_level" placeholder="请选择评估等级" style="width: 100%">
            <el-option :label="$t('初级')" value="beginner" />
            <el-option :label="$t('中级')" value="intermediate" />
            <el-option :label="$t('高级')" value="advanced" />
            <el-option :label="$t('专家')" value="expert" />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="$t('评估方式')" prop="assessment_method">
          <el-select v-model="assessForm.assessment_method" placeholder="请选择评估方式" style="width: 100%">
            <el-option :label="$t('考试')" value="exam" />
            <el-option label="面试" value="interview" />
            <el-option :label="$t('项目评估')" value="project" />
            <el-option :label="$t('实操考核')" value="practical" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="$t('评估日期')" prop="assessment_date">
          <el-date-picker
            v-model="assessForm.assessment_date"
            type="date"
            placeholder="请选择评估日期"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item :label="$t('有效期至')" prop="expiry_date">
          <el-date-picker
            v-model="assessForm.expiry_date"
            type="date"
            placeholder="请选择有效期"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item :label="$t('评估备注')" prop="notes">
          <el-input
            v-model="assessForm.notes"
            type="textarea"
            :rows="4"
            placeholder="请输入评估备注"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="assessDialogVisible = false">{{ $t("取消") }}</el-button>
        <el-button type="primary" :loading="assessLoading" @click="handleAssessSubmit">{{ $t("确定") }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { competencyAPI, userAPI } from '../../api'
import { useAuthStore } from '../../store/auth'

const authStore = useAuthStore()

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
const treeDialogVisible = ref(false)
const assessDialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const assessLoading = ref(false)
const isEdit = ref(false)

// 表单数据
const formData = reactive({
  id: null,
  code: '',
  name: '',
  description: '',
  category: 'technical',
  parent: null,
  level_definitions: '',
  assessment_criteria: '',
  is_active: true
})

// 评估表单
const assessForm = reactive({
  competency: null,
  user: null,
  assessed_level: 'beginner',
  assessment_method: 'exam',
  assessment_date: new Date(),
  expiry_date: '',
  notes: ''
})

// 选项数据
const competencyOptions = ref([])
const userOptions = ref([])

// 能力树数据
const treeData = ref([])
const treeProps = {
  children: 'children',
  label: 'name'
}

// 当前能力（用于评估）
const currentCompetency = ref(null)

// 表单规则
const formRules = {
  code: [
    { required: true, message: '请输入能力编码', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入能力名称', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择能力分类', trigger: 'change' }
  ]
}

const assessFormRules = {
  user: [
    { required: true, message: '请选择员工', trigger: 'change' }
  ],
  assessed_level: [
    { required: true, message: '请选择评估等级', trigger: 'change' }
  ],
  assessment_method: [
    { required: true, message: '请选择评估方式', trigger: 'change' }
  ],
  assessment_date: [
    { required: true, message: '请选择评估日期', trigger: 'change' }
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
    
    const response = await competencyAPI.getCompetencies(params)
    tableData.value = response.data.results || []
    pagination.total = response.data.count || 0
  } catch (error) {
    console.error('Failed to load competencies:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 加载选项数据
const loadCompetencyOptions = async () => {
  try {
    const response = await competencyAPI.getCompetencies({ size: 1000 })
    competencyOptions.value = response.data.results || []
  } catch (error) {
    console.error('Failed to load competencies:', error)
  }
}

const loadUserOptions = async () => {
  try {
    const response = await userAPI.getUsers({ size: 1000, is_active: true })
    userOptions.value = response.data.results || []
  } catch (error) {
    console.error('Failed to load users:', error)
  }
}

// 加载能力树
const loadCompetencyTree = async () => {
  try {
    const response = await competencyAPI.getCompetencyTree()
    treeData.value = response.data
  } catch (error) {
    console.error('Failed to load competency tree:', error)
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
  dialogTitle.value = '新增能力'
  isEdit.value = false
  dialogVisible.value = true
  
  // 重置表单
  Object.assign(formData, {
    id: null,
    code: '',
    name: '',
    description: '',
    category: 'technical',
    parent: null,
    level_definitions: '',
    assessment_criteria: '',
    is_active: true
  })
}

// 查看
const handleView = (row) => {
  // 显示详情
  console.log('View competency:', row)
}

// 查看能力树
const handleViewTree = () => {
  treeDialogVisible.value = true
  loadCompetencyTree()
}

// 编辑
const handleEdit = async (row) => {
  dialogTitle.value = '编辑能力'
  isEdit.value = true
  dialogVisible.value = true
  
  // 填充表单数据
  Object.assign(formData, {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    category: row.category,
    parent: row.parent,
    level_definitions: row.level_definitions,
    assessment_criteria: row.assessment_criteria,
    is_active: row.is_active
  })
}

// 评估
const handleAssess = (row) => {
  currentCompetency.value = row
  assessDialogVisible.value = true
  assessForm.competency = row.id
  assessForm.assessment_date = new Date()
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该能力吗？', '提示', {
      type: 'warning'
    })
    
    await competencyAPI.deleteCompetency(row.id)
    ElMessage.success('删除成功')
    loadTableData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete competency:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的能力')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个能力吗？`, '提示', {
      type: 'warning'
    })
    
    // 批量删除逻辑
    for (const row of selectedRows.value) {
      await competencyAPI.deleteCompetency(row.id)
    }
    
    ElMessage.success('批量删除成功')
    loadTableData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to batch delete competencies:', error)
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
      await competencyAPI.updateCompetency(formData.id, formData)
      ElMessage.success('更新成功')
    } else {
      await competencyAPI.createCompetency(formData)
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

// 提交评估
const handleAssessSubmit = async () => {
  try {
    await assessFormRef.value.validate()
    
    assessLoading.value = true
    
    await competencyAPI.createAssessment({
      competency: assessForm.competency,
      user: assessForm.user,
      assessed_level: assessForm.assessed_level,
      assessment_method: assessForm.assessment_method,
      assessment_date: assessForm.assessment_date,
      expiry_date: assessForm.expiry_date,
      assessor: authStore.user.id,
      notes: assessForm.notes
    })
    
    ElMessage.success('评估成功')
    assessDialogVisible.value = false
    loadTableData()
  } catch (error) {
    console.error('Failed to submit assessment:', error)
    ElMessage.error('评估失败')
  } finally {
    assessLoading.value = false
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
  loadCompetencyOptions()
  loadUserOptions()
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

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 8px;
}
</style>
