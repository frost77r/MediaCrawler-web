<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { X, Info, FileText, Link, Trash2, Plus, ExternalLink } from 'lucide-vue-next';
import CustomSelect from './CustomSelect.vue';
import type { Clue } from '../types';

const props = defineProps<{
  showCreateModal: boolean;
  showEditModal: boolean;
  clueForm: Clue;
  submitLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:showCreateModal', value: boolean): void;
  (e: 'update:showEditModal', value: boolean): void;
  (e: 'saveClue', payload: Clue): void;
}>();

const internalClueForm = ref<Clue>({ ...props.clueForm });

// Mock source data for display (in real app, this would be fetched or passed)

watch(() => props.clueForm, (newVal) => {
  internalClueForm.value = { ...newVal };
}, { deep: true });

const handleCloseModal = () => {
  emit('update:showCreateModal', false);
  emit('update:showEditModal', false);
};

const handleSave = () => {
  emit('saveClue', internalClueForm.value);
};

const riskLevelOptions = [
  { value: 0, label: '低' },
  { value: 1, label: '中' },
  { value: 2, label: '高' },
  { value: 3, label: '严重' }
];

const statusOptions = [
  { value: 0, label: '待处理' },
  { value: 1, label: '处理中' },
  { value: 2, label: '已处置' },
  { value: 3, label: '已忽略' }
];

const sourceOptions = [
  { value: 'manual', label: '手动录入' },
  { value: 'rule', label: '系统规则' },
  { value: 'note', label: '帖子分析' },
  { value: 'comment', label: '评论分析' }
];

const getStatusClass = (status: number) => {
  const classes = ['pending', 'processing', 'handled', 'ignored'];
  return classes[status] || 'pending';
};

const isManual = computed(() => internalClueForm.value.source_type === 'manual');
const isNote = computed(() => internalClueForm.value.source_type === 'note');
const isComment = computed(() => internalClueForm.value.source_type === 'comment');

</script>

<template>
  <transition name="fade">
    <div v-if="props.showCreateModal || props.showEditModal" class="modal-overlay" @click.self="handleCloseModal">
      <div class="modal-container large">
        <header class="modal-header">
          <div class="header-content">
            <Plus v-if="props.showCreateModal" class="header-icon" />
            <PencilLine v-else class="header-icon" />
            <h3 class="modal-title">{{ props.showEditModal ? '修改线索' : '新增线索' }}</h3>
          </div>
          <button @click="handleCloseModal" class="close-btn"><X /></button>
        </header>

        <main class="modal-body custom-scrollbar">
          <!-- 区块1：来源信息区 (只读) -->
          <section v-if="!isManual" class="form-section source-info-section">
            <h4 class="section-title"><Info class="w-4 h-4" /> 来源信息</h4>
            <div class="source-card">
              <template v-if="isNote">
                <div class="source-grid">
                  <div class="info-item">
                    <label>线索来源</label>
                    <span class="val-tag blue">帖子</span>
                  </div>
                  <div class="info-item">
                    <label>帖子ID</label>
                    <span class="val-text mono">{{ internalClueForm.source_note_id || '-' }}</span>
                  </div>
                  <div class="info-item">
                    <label>用户昵称</label>
                    <span class="val-text">{{ internalClueForm.target_user_nickname || '-' }}</span>
                  </div>
                  <div class="info-item">
                    <label>IP归属地</label>
                    <span class="val-text">北京</span>
                  </div>
                </div>
                <div class="source-content-box">
                  <label>来源内容摘要</label>
                  <p class="content-p">{{ internalClueForm.source_content_summary || '无摘要内容' }}</p>
                </div>
              </template>
              
              <template v-if="isComment">
                <div class="source-grid">
                  <div class="info-item">
                    <label>线索来源</label>
                    <span class="val-tag green">评论</span>
                  </div>
                  <div class="info-item">
                    <label>评论ID</label>
                    <span class="val-text mono">{{ internalClueForm.source_comment_id || '-' }}</span>
                  </div>
                  <div class="info-item">
                    <label>所属帖子ID</label>
                    <span class="val-text mono">{{ internalClueForm.source_note_id || '-' }}</span>
                  </div>
                  <div class="info-item">
                    <label>用户昵称</label>
                    <span class="val-text">{{ internalClueForm.target_user_nickname || '-' }}</span>
                  </div>
                </div>
                <div class="source-content-box">
                  <label>评论内容</label>
                  <p class="content-p">{{ internalClueForm.source_content_summary || '无评论内容' }}</p>
                </div>
              </template>
            </div>
          </section>

          <section v-else class="form-section">
            <div class="manual-source-banner">
              <Info class="w-4 h-4" /> 当前为手动录入模式，不关联原始帖子或评论详情。
            </div>
          </section>

          <!-- 区块2：线索信息区 (可编辑) -->
          <section class="form-section">
            <h4 class="section-title"><FileText class="w-4 h-4" /> 线索详情</h4>
            <div class="form-grid">
              <div class="form-item span-full">
                <label class="required">线索标题</label>
                <input v-model="internalClueForm.clue_title" placeholder="简要描述该线索的核心内容" class="form-input">
              </div>
              
              <div class="form-item">
                <label>目标用户ID</label>
                <input v-model="internalClueForm.target_user_id" placeholder="user_id" class="form-input">
              </div>
              <div class="form-item">
                <label>目标用户昵称</label>
                <input v-model="internalClueForm.target_user_nickname" placeholder="昵称" class="form-input">
              </div>
              <div class="form-item">
                <label class="required">风险等级</label>
                <CustomSelect v-model="internalClueForm.risk_level" :options="riskLevelOptions" />
              </div>

              <div class="form-item">
                <label>线索来源</label>
                <CustomSelect v-model="internalClueForm.source_type" :options="sourceOptions" />
              </div>
              <div class="form-item">
                <label>处理状态</label>
                <div class="status-radio-group">
                  <button 
                    v-for="opt in statusOptions" 
                    :key="opt.value"
                    @click="internalClueForm.status = opt.value"
                    class="status-radio-btn"
                    :class="[getStatusClass(opt.value), { active: internalClueForm.status === opt.value }]"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>
              <div class="form-item">
                <label>来源关键词</label>
                <input v-model="internalClueForm.source_keyword" placeholder="采集该内容的搜索词" class="form-input">
              </div>

              <div class="form-item">
                <label>命中规则</label>
                <input v-model="internalClueForm.hit_rule_name" placeholder="命中的系统规则名称" class="form-input">
              </div>
              <div class="form-item">
                <label>处理人</label>
                <input v-model="internalClueForm.handler" placeholder="分派给..." class="form-input">
              </div>

              <div class="form-item span-full">
                <label>线索描述</label>
                <textarea v-model="internalClueForm.clue_desc" rows="2" placeholder="详细说明线索的具体背景..." class="form-input"></textarea>
              </div>
              <div class="form-item span-full">
                <label class="required">可疑原因 / 逻辑分析</label>
                <textarea v-model="internalClueForm.suspicious_reason" rows="3" placeholder="请详细阐述该线索的危害性或可疑点（必填）..." class="form-input highlighted"></textarea>
              </div>
              <div class="form-item span-full">
                <label>证据摘要</label>
                <textarea v-model="internalClueForm.evidence_summary" rows="2" placeholder="对关联证据链的简要说明..." class="form-input"></textarea>
              </div>
            </div>
          </section>

          <!-- 区块3：关联证据区 -->
          <section class="form-section">
            <h4 class="section-title"><Link class="w-4 h-4" /> 关联证据链</h4>
            <div class="evidence-box">
              <div class="evidence-header">
                <span class="evidence-count">已关联 {{ (internalClueForm.note_ids?.length || 0) + (internalClueForm.comment_ids?.length || 0) }} 项证据</span>
                <div class="evidence-actions">
                  <button class="btn btn-ghost btn-sm"><Plus class="w-3.5 h-3.5" /> 关联帖子</button>
                  <button class="btn btn-ghost btn-sm"><Plus class="w-3.5 h-3.5" /> 关联评论</button>
                </div>
              </div>

              <div class="evidence-list">
                <div v-if="!internalClueForm.note_ids?.length && !internalClueForm.comment_ids?.length" class="empty-evidence">
                  暂无关联证据，请至少保留当前来源项
                </div>
                
                <div v-for="nid in internalClueForm.note_ids" :key="nid" class="evidence-item">
                  <div class="ev-info">
                    <span class="ev-type note">帖子</span>
                    <span class="ev-id">{{ nid }}</span>
                    <span class="ev-core-badge">核心证据</span>
                  </div>
                  <div class="ev-ops">
                    <button class="ev-btn" title="查看"><ExternalLink /></button>
                    <button class="ev-btn delete" title="移除"><Trash2 /></button>
                  </div>
                </div>

                <div v-for="cid in internalClueForm.comment_ids" :key="cid" class="evidence-item">
                  <div class="ev-info">
                    <span class="ev-type comment">评论</span>
                    <span class="ev-id">{{ cid }}</span>
                  </div>
                  <div class="ev-ops">
                    <button class="ev-btn" title="查看"><ExternalLink /></button>
                    <button class="ev-btn delete" title="移除"><Trash2 /></button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer class="modal-footer">
          <div class="footer-left">
            <button v-if="props.showEditModal" class="btn btn-danger"><Trash2 class="w-4 h-4" /> 删除线索</button>
          </div>
          <div class="footer-right">
            <button @click="handleCloseModal" class="btn btn-ghost">取消</button>
            <button @click="handleSave" class="btn btn-primary" :disabled="props.submitLoading">
              {{ props.submitLoading ? '保存中...' : '保存' }}
            </button>
            <button v-if="props.showCreateModal" @click="handleSave" class="btn btn-secondary">保存并继续处理</button>
          </div>
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
  z-index: 2000;
  padding: 2rem;
}

.modal-container {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  max-height: 95%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.modal-container.large { width: 900px; }

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(15, 23, 42, 0.4);
}

.header-content { display: flex; align-items: center; gap: 0.75rem; }
.header-icon { width: 1.25rem; height: 1.25rem; color: #3b82f6; }
.modal-title { font-size: 1.125rem; font-weight: 600; color: #fff; }

.close-btn { background: transparent; border: none; color: #64748b; cursor: pointer; padding: 0.25rem; }
.close-btn:hover { color: #fff; }

.modal-body {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Sections */
.form-section { display: flex; flex-direction: column; gap: 1rem; }
.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #94a3b8;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* Source Info Section */
.source-card {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.source-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.info-item { display: flex; flex-direction: column; gap: 0.375rem; }
.info-item label { font-size: 0.75rem; color: #64748b; }
.val-text { font-size: 0.875rem; color: #e2e8f0; }
.val-text.mono { font-family: monospace; font-size: 0.8rem; }
.val-tag {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
}
.val-tag.blue { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.val-tag.green { background: rgba(16, 185, 129, 0.2); color: #34d399; }

.source-content-box { display: flex; flex-direction: column; gap: 0.5rem; }
.source-content-box label { font-size: 0.75rem; color: #64748b; }
.content-p {
  font-size: 0.875rem;
  color: #94a3b8;
  line-height: 1.5;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.75rem;
  border-radius: 6px;
}

.manual-source-banner {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #60a5fa;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem 1.5rem;
}

.form-item { display: flex; flex-direction: column; gap: 0.5rem; }
.form-item.span-full { grid-column: span 3; }
.form-item label { font-size: 0.875rem; color: #e2e8f0; font-weight: 500; }
.form-item label.required::after { content: ' *'; color: #ef4444; }

.form-input {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 0.625rem 0.875rem;
  color: #f8fafc;
  font-size: 0.875rem;
  transition: all 0.2s;
}
.form-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); outline: none; }
.form-input.highlighted { border-color: rgba(59, 130, 246, 0.5); background: rgba(59, 130, 246, 0.05); }

textarea.form-input { resize: vertical; line-height: 1.6; }

/* Status Radio Group */
.status-radio-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.status-radio-btn {
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  transition: all 0.2s;
}

.status-radio-btn.active.pending { background: #3b82f6; color: #fff; }
.status-radio-btn.active.processing { background: #8b5cf6; color: #fff; }
.status-radio-btn.active.handled { background: #10b981; color: #fff; }
.status-radio-btn.active.ignored { background: #64748b; color: #fff; }

.status-radio-btn:not(.active):hover { background: rgba(255, 255, 255, 0.1); color: #fff; }

/* Evidence Box */
.evidence-box {
  background: rgba(15, 23, 42, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
}

.evidence-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.evidence-count { font-size: 0.75rem; color: #64748b; }
.evidence-actions { display: flex; gap: 0.5rem; }

.evidence-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.evidence-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.625rem 1rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.02);
}

.ev-info { display: flex; align-items: center; gap: 0.75rem; }
.ev-type { font-size: 0.7rem; font-weight: 700; padding: 0.125rem 0.375rem; border-radius: 4px; }
.ev-type.note { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.ev-type.comment { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.ev-id { font-family: monospace; font-size: 0.75rem; color: #94a3b8; }
.ev-core-badge { font-size: 0.7rem; color: #f59e0b; background: rgba(245, 158, 11, 0.1); padding: 0.125rem 0.375rem; border-radius: 4px; }

.ev-ops { display: flex; gap: 0.5rem; }
.ev-btn { background: transparent; border: none; color: #64748b; cursor: pointer; padding: 0.25rem; transition: 0.2s; }
.ev-btn svg { width: 1rem; height: 1rem; }
.ev-btn:hover { color: #fff; }
.ev-btn.delete:hover { color: #ef4444; }

.empty-evidence { text-align: center; padding: 2rem; color: #475569; font-size: 0.875rem; font-style: italic; }

/* Footer */
.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(15, 23, 42, 0.4);
}
.footer-right { display: flex; gap: 1rem; }

/* Global components reuse */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 38px;
  padding: 0 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
  border: 1px solid transparent;
}
.btn-sm { height: 30px; padding: 0 0.75rem; font-size: 0.75rem; }

.btn-primary { background: #3b82f6; color: #fff; }
.btn-primary:hover { background: #2563eb; }

.btn-secondary { background: rgba(59, 130, 246, 0.1); color: #60a5fa; border-color: rgba(59, 130, 246, 0.2); }
.btn-secondary:hover { background: rgba(59, 130, 246, 0.2); }

.btn-danger { background: rgba(239, 68, 68, 0.15); color: #f87171; border-color: rgba(239, 68, 68, 0.2); }
.btn-danger:hover { background: rgba(239, 68, 68, 0.25); }

.btn-ghost { background: transparent; color: #94a3b8; }
.btn-ghost:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
