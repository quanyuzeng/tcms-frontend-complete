<template>
  <div class="page-container">
    <div class="page-header">
      <h2>{{ $t("培训管理") }}</h2>
    </div>
    <div class="page-content">
      <el-card>
        <el-result
          icon="info"
          :title="$t('培训管理')"
          sub-title="请选择左侧菜单中的具体功能模块"
        >
          <template #extra>
            <el-button type="primary" @click="$router.push('/courses')">
              课程管理
            </el-button>
            <el-button type="primary" @click="$router.push('/training-plans')">{{ $t("培训计划") }}</el-button>
            <el-button type="primary" @click="$router.push('/training-records')">{{ $t("培训记录") }}</el-button>
          </template>
        </el-result>
      </el-card>
    </div>
  </div>
</template>

<script setup>
// 培训管理首页
</script>
