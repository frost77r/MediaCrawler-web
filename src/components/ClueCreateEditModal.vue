<script setup lang="ts">
import { ref, watch } from 'vue';
import { X } from 'lucide-vue-next';
import CustomSelect from './CustomSelect.vue';
import type { Clue } from '../types';

const props = defineProps<{
  showCreateModal: boolean;
  showEditModal: boolean;
  clueForm: Clue;
  submitLoading: boolean;
  riskLevelOptions: { value: number | string; label: string; }[];
  sourceOptions: { value: string; label: string; }[];
  getStatusConfig: (status: number) => { label: string, type: string, icon: any };
}>();

const emit = defineEmits<{
  (e: 'update:showCreateModal', value: boolean): void;
  (e: 'update:showEditModal', value: boolean): void;
  (e: 'saveClue'): void;
  (e: 'update:clueForm', value: Clue): void;
}>();

// Internal form state to allow direct v-model binding in the component
const internalClueForm = ref<Clue>({ ...props.clueForm });

watch(() => props.clueForm, (newVal) => {
  internalClueForm.value = { ...newVal };
}, { deep: true });

watch(internalClueForm, (newVal) => {
  emit('update:clueForm', newVal);
}, { deep: true });

const handleCloseModal = () => {
  emit('update:showCreateModal', false);
  emit('update:showEditModal', false);
};

const handleSave = () => {
  emit('saveClue');
};

</script>

<template>
  <transition name="fade">
    <div v-if="props.showCreateModal || props.showEditModal" class="el-dialog-overlay" @click.self="handleCloseModal">
      <div class="el-dialog-box">
        <header class="el-dialog-header">
          <span class="el-dialog-title">{{ props.showEditModal ? '修改线索信息' : '手动新增线索' }}</span>
          <button @click="handleCloseModal" class="el-dialog-close"><X /></button>
        </header>
        
        <main class="el-dialog-body custom-scrollbar">
          <div class="el-form-mock">
            <div class="el-form-item">
              <label class="el-form-label">线索标题</label>
              <div class="el-form-content">
                <input v-model="internalClueForm.clue_title" placeholder="请输入线索标题" class="el-form-input">
              </div>
            </div>
            <div class="el-form-row">
              <div class="el-form-item">
                <label class="el-form-label">目标用户</label>
                <div class="el-form-content">
                  <input v-model="internalClueForm.target_user_id" placeholder="用户 ID" class="el-form-input">
                </div>
              </div>
              <div class="el-form-item">
                <label class="el-form-label">风险等级</label>
                <div class="el-form-content">
                  <CustomSelect v-model="internalClueForm.risk_level" :options="props.riskLevelOptions.slice(1)" />
                </div>
              </div>
            </div>
            <div class="el-form-row">
              <div class="el-form-item">
                <label class="el-form-label">来源渠道</label>
                <div class="el-form-content">
                  <CustomSelect v-model="internalClueForm.source_type" :options="props.sourceOptions" />
                </div>
              </div>
            </div>
            <div class="el-form-item">
              <label class="el-form-label">线索描述</label>
              <div class="el-form-content">
                <textarea v-model="internalClueForm.clue_desc" rows="3" placeholder="请输入详细线索描述" class="el-form-input"></textarea>
              </div>
            </div>
            <div class="el-form-item">
              <label class="el-form-label">可疑逻辑</label>
              <div class="el-form-content">
                <textarea v-model="internalClueForm.suspicious_reason" rows="2" placeholder="为什么认为该内容可疑？" class="el-form-input"></textarea>
              </div>
            </div>
          </div>

          <div v-if="props.showEditModal" class="el-detail-group">
            <div class="el-detail-title">流程处置</div>
            <div class="el-status-btns">
              <button v-for="s in [0, 1, 2, 3]" :key="s" @click="internalClueForm.status = s" class="status-btn" :class="[internalClueForm.status === s ? props.getStatusConfig(s).type : 'off']">{{ props.getStatusConfig(s).label }}</button>
            </div>
          </div>

        </main>

        <footer class="el-dialog-footer">
          <button @click="handleCloseModal" class="el-btn el-btn-text">取消</button>
          <button @click="handleSave" class="el-btn el-btn-primary" :disabled="props.submitLoading">
            {{ props.submitLoading ? '保存中...' : '提交保存' }}
          </button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* Scoped styles specific to ClueCreateEditModal */
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
  max-width: 600px;
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

/* Form styles */
.el-form-mock {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.el-form-item {
  display: flex;
  flex-direction: column;
}

.el-form-label {
  color: #e2e8f0;
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: 500;
}

.el-form-content {
  flex-grow: 1;
}

.el-form-input {
  width: 100%;
  padding: 8px 12px;
  background: #0f172a;
  border: 1px solid #475569;
  border-radius: 4px;
  color: #f8fafc;
  font-size: 14px;
  box-sizing: border-box;
}

.el-form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.el-form-row {
  display: flex;
  gap: 16px;
}

.el-form-row .el-form-item {
  flex: 1;
}

/* Status buttons in edit modal */
.el-detail-group {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #334155;
}

.el-detail-title {
  color: #e2e8f0;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.el-status-btns {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.status-btn {
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid transparent;
  background-color: #334155;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
}

.status-btn.off {
  opacity: 0.7;
}

.status-btn.off:hover {
  background-color: #475569;
}

/* Status colors - should match getStatusConfig */
.status-btn.pending { background-color: #1e3a8a; border-color: #3b82f6; color: #93c5fd; }
.status-btn.processing { background-color: #4c1d95; border-color: #8b5cf6; color: #d8b4fe; }
.status-btn.handled { background-color: #166534; border-color: #22c55e; color: #86efac; }
.status-btn.ignored { background-color: #4b5563; border-color: #6b7280; color: #d1d5db; }

.status-btn.pending.off:hover { background-color: #3b82f6; }
.status-btn.processing.off:hover { background-color: #8b5cf6; }
.status-btn.handled.off:hover { background-color: #22c55e; }
.status-btn.ignored.off:hover { background-color: #6b7280; }

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
