<script setup lang="ts">
import { X, AlertTriangle } from 'lucide-vue-next';

const props = defineProps<{
  showDeleteConfirmModal: boolean;
  isBatch?: boolean;
  count?: number;
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
    <div v-if="props.showDeleteConfirmModal" class="modal-overlay" @click.self="handleCloseModal">
      <div class="modal-container mini">
        <header class="modal-header">
          <div class="header-content">
            <AlertTriangle class="header-icon danger" />
            <h3 class="modal-title">确认删除</h3>
          </div>
          <button @click="handleCloseModal" class="close-btn"><X /></button>
        </header>
        
        <main class="modal-body">
          <p class="confirm-text">
            {{ props.isBatch ? `确定要批量删除选中的 ${props.count || 0} 条线索吗？` : '确定要永久删除这条线索吗？' }}
          </p>
          <p class="warning-text">删除后该线索不可恢复，请谨慎操作。</p>
        </main>
        
        <footer class="modal-footer">
          <button @click="handleCloseModal" class="btn btn-ghost">取消</button>
          <button @click="handleConfirmDelete" class="btn btn-danger">确认删除</button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
}

.modal-container {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content { display: flex; align-items: center; gap: 0.75rem; }
.header-icon.danger { color: #ef4444; }
.modal-title { color: #fff; font-size: 1rem; font-weight: 600; }

.close-btn { background: transparent; border: none; color: #64748b; cursor: pointer; padding: 0.25rem; }

.modal-body {
  padding: 1.5rem 1.25rem;
}

.confirm-text { color: #f8fafc; font-size: 0.9375rem; margin-bottom: 0.5rem; }
.warning-text { color: #94a3b8; font-size: 0.875rem; }

.modal-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.1);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
  border: 1px solid transparent;
}

.btn-danger { background: #ef4444; color: #fff; }
.btn-danger:hover { background: #dc2626; }

.btn-ghost { background: transparent; color: #94a3b8; }
.btn-ghost:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
