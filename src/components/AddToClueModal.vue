<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { X, Search, Plus } from 'lucide-vue-next';
import { clueApi } from '../api/clue';
import type { Clue } from '../types';

const props = defineProps<{
  show: boolean;
  itemType: 'note' | 'comment';
  itemId: string;
  noteId?: string;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'success'): void;
}>();

const clues = ref<Clue[]>([]);
const loading = ref(false);
const submitting = ref(false);
const searchQuery = ref('');
const selectedClueId = ref<number | null>(null);

const isCreatingNew = ref(false);
const newClueTitle = ref('');
const newClueNo = ref(`CLUE-${Date.now()}`);

const fetchClues = async () => {
  loading.value = true;
  try {
    const res = await clueApi.list({ page_size: 50 });
    clues.value = res.data?.items || [];
  } catch (err) {
    console.error('Fetch clues error:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchClues();
});

const handleClose = () => {
  emit('update:show', false);
  isCreatingNew.value = false;
  selectedClueId.value = null;
  newClueTitle.value = '';
};

const handleAdd = async () => {
  if (!isCreatingNew.value && !selectedClueId.value) {
    alert('请选择一个线索或创建新线索');
    return;
  }
  if (isCreatingNew.value && !newClueTitle.value) {
    alert('请输入线索标题');
    return;
  }

  submitting.value = true;
  try {
    const payload: any = {
      item_type: props.itemType,
      item_id: props.itemId,
      note_id: props.noteId,
    };

    if (isCreatingNew.value) {
      payload.clue_title = newClueTitle.value;
      payload.clue_no = newClueNo.value;
    } else {
      payload.clue_id = selectedClueId.value;
    }

    const res = await clueApi.addItem(payload);
    if (res.error) {
      alert(`添加失败: ${res.error}`);
    } else {
      alert('已成功添加到线索');
      emit('success');
      handleClose();
    }
  } catch (err: any) {
    alert(`添加出错: ${err.message}`);
  } finally {
    submitting.value = false;
  }
};

const filteredClues = () => {
  if (!searchQuery.value) return clues.value;
  const q = searchQuery.value.toLowerCase();
  return clues.value.filter(c => 
    c.clue_title.toLowerCase().includes(q) || 
    c.clue_no.toLowerCase().includes(q)
  );
};
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="handleClose">
    <div class="modal-box">
      <header class="modal-header">
        <span class="modal-title">添加至线索</span>
        <button @click="handleClose" class="close-btn"><X /></button>
      </header>

      <main class="modal-body">
        <div class="mode-switch">
          <button 
            @click="isCreatingNew = false" 
            :class="['switch-btn', !isCreatingNew ? 'active' : '']"
          >
            选择现有线索
          </button>
          <button 
            @click="isCreatingNew = true" 
            :class="['switch-btn', isCreatingNew ? 'active' : '']"
          >
            创建新线索
          </button>
        </div>

        <div v-if="!isCreatingNew" class="clue-selector">
          <div class="search-bar">
            <Search class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="搜索线索标题/编号..." class="search-input">
          </div>
          
          <div class="clue-list custom-scrollbar">
            <div v-if="loading" class="hint">正在加载线索...</div>
            <div v-else-if="clues.length === 0" class="hint">暂无现有线索，请先创建</div>
            <div 
              v-for="clue in filteredClues()" 
              :key="clue.id"
              @click="selectedClueId = clue.id"
              :class="['clue-item', selectedClueId === clue.id ? 'active' : '']"
            >
              <div class="clue-item-title">{{ clue.clue_title }}</div>
              <div class="clue-item-no">{{ clue.clue_no }}</div>
            </div>
          </div>
        </div>

        <div v-else class="new-clue-form">
          <div class="form-item">
            <label>线索标题</label>
            <input v-model="newClueTitle" type="text" placeholder="请输入线索标题" class="form-input">
          </div>
          <div class="form-item">
            <label>线索编号</label>
            <input v-model="newClueNo" type="text" class="form-input">
          </div>
        </div>
      </main>

      <footer class="modal-footer">
        <button @click="handleClose" class="btn btn-text">取消</button>
        <button @click="handleAdd" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? '提交中...' : '确定添加' }}
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-box {
  background: #1e293b;
  border-radius: 1rem;
  width: 450px;
  max-width: 90%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header {
  padding: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  color: #fff;
  font-size: 1.125rem;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.modal-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.mode-switch {
  display: flex;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.25rem;
  border-radius: 0.75rem;
  gap: 0.25rem;
}

.switch-btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  background: none;
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.switch-btn.active {
  background: #3b82f6;
  color: #fff;
}

.clue-selector {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.search-bar {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 0.875rem;
  height: 0.875rem;
  color: #64748b;
}

.search-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  color: #fff;
  font-size: 0.875rem;
  outline: none;
}

.clue-list {
  max-height: 250px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-right: 0.5rem;
}

.clue-item {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clue-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.clue-item.active {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
}

.clue-item-title {
  color: #f1f5f9;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.clue-item-no {
  color: #64748b;
  font-size: 0.75rem;
}

.hint {
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
  padding: 2rem 0;
}

.new-clue-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-item label {
  font-size: 0.875rem;
  color: #94a3b8;
  font-weight: 500;
}

.form-input {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.625rem 0.75rem;
  color: #fff;
  font-size: 0.875rem;
  outline: none;
}

.modal-footer {
  padding: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-text {
  background: none;
  border: none;
  color: #94a3b8;
}

.btn-text:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.btn-primary {
  background: #3b82f6;
  border: none;
  color: #fff;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 10px;
}
</style>
