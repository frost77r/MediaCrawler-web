<script setup lang="ts">
import { X } from 'lucide-vue-next';

const props = defineProps<{
  showDeleteConfirmModal: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:showDeleteConfirmModal', value: boolean): void;
  (e: 'confirmDelete'): void;
}>();

const handleCloseModal = () => {
  emit('update:showDeleteConfirmModal', false);
};

const handleConfirmDelete = () => {
  emit('confirmDelete');
};
</script>

<template>
  <transition name="fade">
    <div v-if="props.showDeleteConfirmModal" class="el-dialog-overlay" @click.self="handleCloseModal">
      <div class="el-dialog-box small">
        <header class="el-dialog-header">
          <span class="el-dialog-title">确认删除</span>
          <button @click="handleCloseModal" class="el-dialog-close"><X /></button>
        </header>
        <main class="el-dialog-body">
          <p>确定要永久删除这条线索吗？删除后将无法恢复。</p>
        </main>
        <footer class="el-dialog-footer">
          <button @click="handleCloseModal" class="el-btn el-btn-text">取消</button>
          <button @click="handleConfirmDelete" class="el-btn el-btn-danger">确认删除</button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* Scoped styles specific to ClueDeleteConfirmModal */
.el-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.el-dialog-box {
  background: #1e293b;
  border-radius: 8px;
  width: 90%;
  max-width: 400px; /* small */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  max-height: 90%;
  overflow: hidden;
}

.el-dialog-header {
  padding: 16px 20px;
  border-bottom: 1px solid #334155;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-dialog-title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.el-dialog-close {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 20px;
  padding: 0;
}

.el-dialog-close:hover {
  color: #fff;
}

.el-dialog-body {
  padding: 20px;
  flex-grow: 1;
  overflow-y: auto;
  color: #cbd5e1;
}

.el-dialog-footer {
  padding: 16px 20px;
  border-top: 1px solid #334155;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
