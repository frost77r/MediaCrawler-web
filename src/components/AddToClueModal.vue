<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { X, Search, Plus, Info } from 'lucide-vue-next';
import { clueApi } from '../api/clue';
import type { Clue } from '../types';
import CustomSelect from './CustomSelect.vue';

const props = defineProps<{
  show: boolean;
  itemType: 'note' | 'comment';
  itemId: string;
  noteId?: string;
  // Extra data for auto-filling
  initialData?: {
    nickname?: string;
    user_id?: string;
    source_keyword?: string;
    content?: string;
  };
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'success'): void;
}>();

const clues = ref<Clue[]>([]);
const loading = ref(false);
const submitting = ref(false);
const searchQuery = ref('');
const activeTab = ref<'select' | 'create'>('select');
const selectedClueId = ref<number | null>(null);

const newClue = ref<Clue>({
  clue_title: '',
  risk_level: 1,
  status: 0,
  target_user_id: '',
  target_user_nickname: '',
  source_keyword: '',
  suspicious_reason: '',
  evidence_summary: ''
});

const riskLevelOptions = [
  { value: 0, label: '低' },
  { value: 1, label: '中' },
  { value: 2, label: '高' },
  { value: 3, label: '严重' }
];

const fetchClues = async () => {
  loading.value = true;
  try {
    const res: any = await clueApi.list({ page_size: 100 });
    clues.value = res.items || [];
  } catch (err) {
    console.error('Fetch clues error:', err);
  } finally {
    loading.value = false;
  }
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    fetchClues();
    if (props.initialData) {
      newClue.value.target_user_id = props.initialData.user_id || '';
      newClue.value.target_user_nickname = props.initialData.nickname || '';
      newClue.value.source_keyword = props.initialData.source_keyword || '';
      newClue.value.evidence_summary = props.initialData.content || '';
    }
  }
});

const handleClose = () => {
  emit('update:show', false);
  activeTab.value = 'select';
  selectedClueId.value = null;
};

const handleAdd = async () => {
  if (activeTab.value === 'select' && !selectedClueId.value) {
    alert('请选择一个现有线索');
    return;
  }
  if (activeTab.value === 'create' && !newClue.value.clue_title) {
    alert('请输入线索标题');
    return;
  }

  submitting.value = true;
  try {
    if (activeTab.value === 'create') {
      // 自动生成编号
      newClue.value.clue_no = 'CLUE-' + Date.now().toString().slice(-6);
      newClue.value.source_type = props.itemType === 'note' ? 'note' : 'comment';
      
      if (props.itemType === 'note') {
        newClue.value.note_ids = [props.itemId];
      } else {
        newClue.value.comment_ids = [props.itemId];
        if (props.noteId) {
          // 提示关联所属帖子逻辑在这里简化处理，或者通过 note_ids 传参
        }
      }
      
      await clueApi.create(newClue.value);
    } else {
      // 关联到现有线索
      const payload = {
        clue_id: selectedClueId.value,
        item_type: props.itemType,
        item_id: props.itemId,
        note_id: props.noteId
      };
      await clueApi.addItem(payload);
    }

    emit('success');
    handleClose();
  } catch (err: any) {
    alert(`添加出错: ${err.message}`);
  } finally {
    submitting.value = false;
  }
};

const filteredClues = computed(() => {
  if (!searchQuery.value) return clues.value;
  const q = searchQuery.value.toLowerCase();
  return clues.value.filter(c => 
    c.clue_title?.toLowerCase().includes(q) || 
    c.clue_no?.toLowerCase().includes(q)
  );
});

const getRiskLabel = (level: number) => {
  return riskLevelOptions.find(o => o.value === level)?.label || '低';
};

const getStatusLabel = (status: number) => {
  const labels = ['待处理', '处理中', '已处置', '已忽略'];
  return labels[status] || '待处理';
};
</script>

<template>
  <transition name="fade">
    <div v-if="show" class="modal-overlay" @click.self="handleClose">
      <div class="modal-container medium">
        <header class="modal-header">
          <div class="header-content">
            <Plus class="header-icon" />
            <h3 class="modal-title">添加至线索</h3>
          </div>
          <button @click="handleClose" class="close-btn"><X /></button>
        </header>

        <div class="modal-tabs">
          <button @click="activeTab = 'select'" :class="{ active: activeTab === 'select' }">选择现有线索</button>
          <button @click="activeTab = 'create'" :class="{ active: activeTab === 'create' }">创建新线索</button>
        </div>

        <main class="modal-body custom-scrollbar">
          <!-- Tab 1: 选择现有 -->
          <div v-if="activeTab === 'select'" class="tab-pane select-pane">
            <div class="search-input-box">
              <Search class="w-4 h-4" />
              <input v-model="searchQuery" placeholder="搜索线索标题或编号..." class="custom-input">
            </div>

            <div class="clue-list-wrapper">
              <div v-if="loading" class="loading-hint">加载线索列表中...</div>
              <div v-else-if="clues.length === 0" class="empty-hint">暂无现有线索</div>
              <div 
                v-for="clue in filteredClues" 
                :key="clue.id"
                @click="selectedClueId = clue.id!"
                class="clue-card-mini"
                :class="{ active: selectedClueId === clue.id }"
              >
                <div class="card-left">
                  <div class="c-title">{{ clue.clue_title }}</div>
                  <div class="c-no">{{ clue.clue_no }}</div>
                </div>
                <div class="card-right">
                  <span class="c-risk" :class="'level-' + clue.risk_level">{{ getRiskLabel(clue.risk_level || 0) }}</span>
                  <span class="c-status">{{ getStatusLabel(clue.status || 0) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab 2: 创建新线索 -->
          <div v-else class="tab-pane create-pane">
            <div class="form-grid-mini">
              <div class="form-item span-2">
                <label>线索标题 *</label>
                <input v-model="newClue.clue_title" placeholder="请输入线索标题" class="custom-input">
              </div>
              <div class="form-item">
                <label>风险等级</label>
                <CustomSelect v-model="newClue.risk_level" :options="riskLevelOptions" />
              </div>
              <div class="form-item">
                <label>处理状态</label>
                <input value="待处理" disabled class="custom-input disabled">
              </div>
              <div class="form-item">
                <label>目标用户ID</label>
                <input v-model="newClue.target_user_id" class="custom-input">
              </div>
              <div class="form-item">
                <label>用户昵称</label>
                <input v-model="newClue.target_user_nickname" class="custom-input">
              </div>
              <div class="form-item span-2">
                <label>来源关键词</label>
                <input v-model="newClue.source_keyword" class="custom-input">
              </div>
              <div class="form-item span-2">
                <label>可疑原因 / 逻辑分析 *</label>
                <textarea v-model="newClue.suspicious_reason" rows="2" class="custom-input"></textarea>
              </div>
              <div class="form-item span-2">
                <label>证据摘要</label>
                <textarea v-model="newClue.evidence_summary" rows="2" class="custom-input"></textarea>
              </div>
            </div>
            <div class="auto-hint">
              <Info class="w-3.5 h-3.5" /> 提交后将自动绑定当前 {{ props.itemType === 'note' ? '帖子' : '评论' }} 为核心证据。
            </div>
          </div>
        </main>

        <footer class="modal-footer">
          <button @click="handleClose" class="btn btn-ghost">取消</button>
          <button @click="handleAdd" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? '提交中...' : '确认添加' }}
          </button>
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
  z-index: 2500;
}

.modal-container {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  max-height: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.modal-container.medium { width: 520px; }

.modal-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(15, 23, 42, 0.4);
}

.header-content { display: flex; align-items: center; gap: 0.75rem; }
.header-icon { width: 1.125rem; height: 1.125rem; color: #3b82f6; }
.modal-title { font-size: 1rem; font-weight: 700; color: #fff; }

.close-btn { background: transparent; border: none; color: #64748b; cursor: pointer; padding: 0.25rem; }

.modal-tabs {
  display: flex;
  padding: 0.5rem 1.25rem;
  background: rgba(0, 0, 0, 0.2);
  gap: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.modal-tabs button {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.5rem 0;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.modal-tabs button.active { color: #3b82f6; }
.modal-tabs button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #3b82f6;
  border-radius: 2px;
}

.modal-body {
  padding: 1.25rem;
  overflow-y: auto;
  min-height: 350px;
}

.search-input-box {
  position: relative;
  margin-bottom: 1rem;
}
.search-input-box svg { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #64748b; }
.custom-input {
  width: 100%;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  padding-left: 2.25rem;
  color: #fff;
  font-size: 0.875rem;
  outline: none;
}
.custom-input:focus { border-color: #3b82f6; }
.custom-input.disabled { background: rgba(0, 0, 0, 0.2); color: #64748b; }

.clue-list-wrapper { display: flex; flex-direction: column; gap: 0.5rem; }
.clue-card-mini {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.03);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}
.clue-card-mini:hover { background: rgba(255, 255, 255, 0.06); border-color: rgba(59, 130, 246, 0.3); }
.clue-card-mini.active { background: rgba(59, 130, 246, 0.1); border-color: #3b82f6; }

.c-title { font-weight: 600; color: #fff; font-size: 0.875rem; margin-bottom: 0.25rem; }
.c-no { font-family: monospace; font-size: 0.75rem; color: #64748b; }

.card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; }
.c-risk { font-size: 0.7rem; font-weight: 700; padding: 0.1rem 0.375rem; border-radius: 4px; }
.c-risk.level-0 { color: #10b981; }
.c-risk.level-1 { color: #f59e0b; }
.c-risk.level-2 { color: #ef4444; }
.c-risk.level-3 { color: #dc2626; }
.c-status { font-size: 0.75rem; color: #64748b; }

.form-grid-mini {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.form-item { display: flex; flex-direction: column; gap: 0.375rem; }
.form-item.span-2 { grid-column: span 2; }
.form-item label { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
textarea.custom-input { resize: vertical; padding-left: 0.75rem; }

.auto-hint {
  margin-top: 1.25rem;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 6px;
  padding: 0.625rem 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #60a5fa;
}

.modal-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  background: rgba(15, 23, 42, 0.2);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
  border: 1px solid transparent;
}

.btn-primary { background: #3b82f6; color: #fff; }
.btn-primary:hover { background: #2563eb; }

.btn-ghost { background: transparent; color: #94a3b8; }
.btn-ghost:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }

.loading-hint, .empty-hint { text-align: center; padding: 3rem; color: #475569; font-style: italic; font-size: 0.875rem; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
</style>
