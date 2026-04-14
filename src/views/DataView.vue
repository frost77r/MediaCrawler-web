<script setup lang="ts">
import { Database } from 'lucide-vue-next';
import DataViewer from '../components/DataViewer.vue';
</script>

<template>
  <div class="dataview-container">
    <!-- Header -->
    <header class="dataview-header">
      <div class="header-info">
        <div class="title-wrapper">
          <Database class="title-icon" />
          <h3 class="header-title">数据展示</h3>
        </div>
        <p class="header-desc">浏览已采集的多平台帖子、视频及评论数据</p>
      </div>

      <div class="db-status">
        <Database class="w-4 h-4" />
        <span>数据库连接正常</span>
      </div>
    </header>

    <!-- Data Viewer Content -->
    <main class="dataview-content">
      <DataViewer />
    </main>
  </div>
</template>

<style scoped>
.dataview-container {
  padding: 1.5rem 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
}

.dataview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  background: var(--glass-bg);
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--glass-border);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-accent);
}

.header-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.025em;
}

.header-desc {
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.875rem;
  border-left: 1px solid var(--glass-border);
  padding-left: 1rem;
}

.db-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #10b981;
  padding: 0.375rem 1rem;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 600;
}

.dataview-content {
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  background-color: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  padding: 1.5rem;
  overflow: hidden;
}
</style>
