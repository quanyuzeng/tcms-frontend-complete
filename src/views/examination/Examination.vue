<template>
  <div class="page-container">
    <div class="page-header">
      <h2>{{ $t("考试管理") }}</h2>
    </div>
    <div class="page-content">
      <el-card>
        <el-result
          icon="info"
          :title="$t('考试管理')"
          sub-title="请选择左侧菜单中的具体功能模块"
        >
          <template #extra>
            <el-button type="primary" @click="$router.push('/question-banks')">{{ $t("题库管理") }}</el-button>
            <el-button type="primary" @click="$router.push('/exams')">{{ $t("考试管理") }}</el-button>
            <el-button type="primary" @click="$router.push('/exam-results')">{{ $t("考试成绩") }}</el-button>
          </template>
        </el-result>
      </el-card>
    </div>
  </div>
</template>

<script setup>
// 考试管理首页
</script>
