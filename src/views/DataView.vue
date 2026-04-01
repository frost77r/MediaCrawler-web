<script setup lang="ts">
import { Database } from 'lucide-vue-next';
import DataViewer from '../components/DataViewer.vue';
</script>

<template>
  <div class="dataview-container">
    <!-- Header -->
    <div class="dataview-header">
      <div class="header-info">
        <h3 class="header-title">数据展示</h3>
        <p class="header-desc">浏览已采集的多平台帖子、视频及评论数据</p>
      </div>

      <div class="db-status">
        <Database class="w-4 h-4" />
        <span>数据库连接正常</span>
      </div>
    </div>

    <!-- Data Viewer Content -->
    <main class="dataview-content">
      <div class="viewer-wrapper">
        <DataViewer />
      </div>
    </main>
  </div>
</template>

<style scoped>
.dataview-container {
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  overflow: hidden;
}

.dataview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.025em;
  margin-bottom: 0.5rem;
}

.header-desc {
  color: #94a3b8;
  font-weight: 500;
}

.db-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
  padding: 0.625rem 1.5rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 700;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.dataview-content {
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  background-color: var(--color-dark-glass);
  border: 1px solid var(--color-dark-border);
  border-radius: 2.5rem;
  padding: 2rem;
  backdrop-filter: blur(12px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.viewer-wrapper {
  flex: 1 1 0%;
  min-height: 0;
}
</style>
