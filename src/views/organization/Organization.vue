<template>
  <div class="page-container">
    <div class="page-header">
      <h2>{{ $t("组织管理") }}</h2>
    </div>
    <div class="page-content">
      <el-card>
        <el-result
          icon="info"
          :title="$t('组织管理')"
          sub-title="请选择左侧菜单中的具体功能模块"
        >
          <template #extra>
            <el-button type="primary" @click="$router.push('/departments')">{{ $t("部门管理") }}</el-button>
            <el-button type="primary" @click="$router.push('/positions')">{{ $t("岗位管理") }}</el-button>
          </template>
        </el-result>
      </el-card>
    </div>
  </div>
</template>

<script setup>
// 组织管理首页
</script>
