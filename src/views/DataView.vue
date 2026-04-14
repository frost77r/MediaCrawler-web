<script setup lang="ts">
import { Database } from 'lucide-vue-next';
import DataViewer from '../components/DataViewer.vue';
</script>

<template>
  <div class="dataview-container">
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
  overflow: hidden;
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
