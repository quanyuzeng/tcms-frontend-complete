<template>
  <div class="page-container">
    <div class="page-header">
      <h2>{{ $t("报表管理") }}</h2>
    </div>
    <div class="page-content">
      <el-card>
        <el-result
          icon="info"
          :title="$t('报表管理')"
          sub-title="请选择左侧菜单中的具体功能模块"
        >
          <template #extra>
            <el-button type="primary" @click="$router.push('/reports')">
              报表中心
            </el-button>
          </template>
        </el-result>
      </el-card>
    </div>
  </div>
</template>

<script setup>
// 报表管理首页
</script>
