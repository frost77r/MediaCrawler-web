<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  X, ExternalLink, Clock, Construction, CheckCircle2, 
  Trash2, Shield, Info, Link, User, FileText, 
  History, PencilLine, Ban, MoreHorizontal
} from 'lucide-vue-next';
import type { ClueDetail } from '../types';

const props = defineProps<{
  showDetailModal: boolean;
  selectedClue: ClueDetail | null;
  detailLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:showDetailModal', value: boolean): void;
  (e: 'update-status', id: number, status: number): void;
  (e: 'edit', clue: any): void;
  (e: 'delete', id: number): void;
}>();

const handleCloseModal = () => {
  emit('update:showDetailModal', false);
};

const formatDate = (ts: number | undefined) => {
  if (!ts) return '-';
  const date = new Date(ts * 1000);
  return date.toLocaleString();
};

const getRiskConfig = (level: number | undefined) => {
  const configs: Record<number, { label: string, type: string, color: string }> = {
    0: { label: '低', type: 'low', color: '#67c23a' },
    1: { label: '中', type: 'medium', color: '#e6a23c' },
    2: { label: '高', type: 'high', color: '#f56c6c' },
    3: { label: '严重', type: 'severe', color: '#ff0000' }
  };
  return configs[level || 0] || { label: '未知', type: 'unknown', color: '#909399' };
};

const getStatusConfig = (status: number | undefined) => {
  const configs: Record<number, { label: string, type: string, icon: any }> = {
    0: { label: '待处理', type: 'pending', icon: Clock },
    1: { label: '处理中', type: 'processing', icon: Construction },
    2: { label: '已处置', type: 'handled', icon: CheckCircle2 },
    3: { label: '已忽略', type: 'ignored', icon: Trash2 }
  };
  return configs[status || 0] || { label: '未知', type: 'unknown', icon: Clock };
};

const getSourceLabel = (type: string | undefined) => {
  const types: Record<string, string> = {
    'manual': '手动录入',
    'rule': '系统规则',
    'note': '帖子分析',
    'comment': '评论分析'
  };
  return types[type || 'manual'] || type;
};
</script>

<template>
  <transition name="fade">
    <div v-if="props.showDetailModal" class="modal-overlay" @click.self="handleCloseModal">
      <div class="modal-container x-large">
        <header class="modal-header">
          <div class="header-left">
            <span class="clue-no">{{ props.selectedClue?.clue_no || 'CLUE-0000' }}</span>
            <h3 class="modal-title">线索详情</h3>
          </div>
          <div class="header-actions">
            <button @click="emit('edit', props.selectedClue)" class="btn-icon"><PencilLine /></button>
            <button @click="handleCloseModal" class="btn-icon"><X /></button>
          </div>
        </header>

        <main class="modal-body custom-scrollbar">
          <div v-if="props.detailLoading" class="loading-state">
            <div class="spinner"></div>
            <p>正在深度拉取全景数据...</p>
          </div>
          
          <div v-else-if="props.selectedClue" class="detail-grid">
            <!-- 1. 基础信息区 -->
            <section class="detail-section span-2">
              <h4 class="section-title"><Info class="w-4 h-4" /> 基础信息</h4>
              <div class="info-grid">
                <div class="info-cell">
                  <label>线索标题</label>
                  <div class="val-text bold">{{ props.selectedClue.clue_title }}</div>
                </div>
                <div class="info-cell">
                  <label>风险等级</label>
                  <div class="val-text">
                    <span class="tag-risk" :class="getRiskConfig(props.selectedClue.risk_level).type">
                      {{ getRiskConfig(props.selectedClue.risk_level).label }}
                    </span>
                  </div>
                </div>
                <div class="info-cell">
                  <label>处理状态</label>
                  <div class="val-text">
                    <span class="tag-status" :class="getStatusConfig(props.selectedClue.status).type">
                      <component :is="getStatusConfig(props.selectedClue.status).icon" class="w-3 h-3" />
                      {{ getStatusConfig(props.selectedClue.status).label }}
                    </span>
                  </div>
                </div>
                <div class="info-cell">
                  <label>线索来源</label>
                  <div class="val-text">{{ getSourceLabel(props.selectedClue.source_type) }}</div>
                </div>
                <div class="info-cell">
                  <label>命中规则</label>
                  <div class="val-text rule-text">#{{ props.selectedClue.hit_rule_name || '未命中规则' }}</div>
                </div>
                <div class="info-cell">
                  <label>来源关键词</label>
                  <div class="val-text keyword-text">{{ props.selectedClue.source_keyword || '-' }}</div>
                </div>
                <div class="info-cell">
                  <label>创建时间</label>
                  <div class="val-text time">{{ formatDate(props.selectedClue.create_time) }}</div>
                </div>
                <div class="info-cell">
                  <label>更新时间</label>
                  <div class="val-text time">{{ formatDate(props.selectedClue.update_time) }}</div>
                </div>
                <div class="info-cell">
                  <label>处理人</label>
                  <div class="val-text handler">{{ props.selectedClue.handler || '未分配' }}</div>
                </div>
              </div>
            </section>

            <!-- 2. 可疑说明区 -->
            <section class="detail-section span-2">
              <h4 class="section-title"><FileText class="w-4 h-4" /> 可疑说明</h4>
              <div class="desc-box">
                <div class="desc-item">
                  <label>线索描述</label>
                  <p>{{ props.selectedClue.clue_desc || '暂无描述信息' }}</p>
                </div>
                <div class="desc-item highlight">
                  <label>可疑原因 / 逻辑分析</label>
                  <p>{{ props.selectedClue.suspicious_reason || '未定义可疑逻辑' }}</p>
                </div>
                <div class="desc-item">
                  <label>证据摘要</label>
                  <p>{{ props.selectedClue.evidence_summary || '暂无证据摘要' }}</p>
                </div>
                <div v-if="props.selectedClue.handle_result" class="desc-item result">
                  <label>处理结果</label>
                  <p>{{ props.selectedClue.handle_result }}</p>
                </div>
              </div>
            </section>

            <!-- 3. 目标用户信息区 -->
            <section class="detail-section">
              <h4 class="section-title"><User class="w-4 h-4" /> 目标用户</h4>
              <div class="user-card">
                <div class="user-avatar-box">
                  <div class="avatar-placeholder">{{ (props.selectedClue.target_user_nickname || 'U')[0] }}</div>
                </div>
                <div class="user-details">
                  <div class="u-nick">{{ props.selectedClue.target_user_nickname || '未知用户' }}</div>
                  <div class="u-id">ID: {{ props.selectedClue.target_user_id || '-' }}</div>
                  <div class="u-meta">IP: {{ props.selectedClue.platform || '未知' }}</div>
                </div>
              </div>
            </section>

            <!-- 4 & 5. 关联证据区 -->
            <section class="detail-section span-2">
              <h4 class="section-title"><Link class="w-4 h-4" /> 关联证据链</h4>
              <div class="evidence-tabs">
                <div class="tab-content">
                  <div class="evidence-table-wrapper">
                    <table class="evidence-table">
                      <thead>
                        <tr>
                          <th>类型</th>
                          <th>ID</th>
                          <th>内容摘要</th>
                          <th>核心</th>
                          <th>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="note in props.selectedClue.notes" :key="note.note_id">
                          <td><span class="ev-tag note">帖子</span></td>
                          <td class="mono">{{ note.note_id }}</td>
                          <td class="ellipsis">{{ note.note?.title || '-' }}</td>
                          <td><span v-if="note.evidence_flag" class="core-dot"></span></td>
                          <td><button class="btn-link-icon"><ExternalLink /></button></td>
                        </tr>
                        <tr v-for="comment in props.selectedClue.comments" :key="comment.comment_id">
                          <td><span class="ev-tag comment">评论</span></td>
                          <td class="mono">{{ comment.comment_id }}</td>
                          <td class="ellipsis">{{ comment.comment?.content || '-' }}</td>
                          <td><span v-if="comment.evidence_flag" class="core-dot"></span></td>
                          <td><button class="btn-link-icon"><ExternalLink /></button></td>
                        </tr>
                        <tr v-if="!props.selectedClue.notes?.length && !props.selectedClue.comments?.length">
                          <td colspan="5" class="empty-text">暂无关联证据</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            <!-- 6. 处理记录区 -->
            <section class="detail-section">
              <h4 class="section-title"><History class="w-4 h-4" /> 处理记录</h4>
              <div class="history-timeline">
                <div v-for="(log, idx) in props.selectedClue.logs || []" :key="idx" class="timeline-item">
                  <div class="timeline-point"></div>
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <span class="log-user">{{ log.user }}</span>
                      <span class="log-time">{{ formatDate(log.time) }}</span>
                    </div>
                    <div class="log-action">{{ log.action }}</div>
                  </div>
                </div>
                <div v-if="!props.selectedClue.logs?.length" class="empty-history">
                  暂无处理记录
                </div>
              </div>
            </section>
          </div>
        </main>

        <footer class="modal-footer">
          <div class="footer-left">
            <button @click="emit('delete', props.selectedClue?.id!)" class="btn btn-danger btn-outline">
              <Trash2 class="w-4 h-4" /> 删除线索
            </button>
          </div>
          <div class="footer-right">
            <button @click="handleCloseModal" class="btn btn-ghost">关闭</button>
            <button class="btn btn-secondary">标记处理中</button>
            <button class="btn btn-success">处置完成</button>
            <button class="btn btn-warning">忽略线索</button>
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
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 1.5rem;
}

.modal-container {
  background: #111827;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  max-height: 95%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}

.modal-container.x-large { width: 1100px; }

.modal-header {
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(15, 23, 42, 0.6);
}

.header-left { display: flex; align-items: center; gap: 1rem; }
.clue-no {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-family: monospace;
  font-weight: 700;
  font-size: 0.875rem;
  border: 1px solid rgba(59, 130, 246, 0.2);
}
.modal-title { font-size: 1.25rem; font-weight: 700; color: #fff; }

.header-actions { display: flex; gap: 0.75rem; }
.btn-icon {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}
.btn-icon:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }

.modal-body {
  padding: 1.75rem;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.detail-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.75rem;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  padding: 1.5rem;
}
.detail-section.span-2 { grid-column: span 2; }

.section-title {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #60a5fa;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

/* Base Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.info-cell label { font-size: 0.75rem; color: #64748b; margin-bottom: 0.375rem; display: block; }
.val-text { font-size: 0.9375rem; color: #e5e7eb; }
.val-text.bold { font-weight: 600; color: #fff; }
.val-text.time { color: #94a3b8; font-size: 0.875rem; }
.val-text.rule-text { color: #a78bfa; font-weight: 600; font-family: monospace; }
.val-text.keyword-text { color: #34d399; }

/* Status & Risk Tags */
.tag-risk {
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid transparent;
}
.tag-risk.low { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: rgba(16, 185, 129, 0.2); }
.tag-risk.medium { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border-color: rgba(245, 158, 11, 0.2); }
.tag-risk.high { background: rgba(239, 68, 68, 0.1); color: #f87171; border-color: rgba(239, 68, 68, 0.2); }
.tag-risk.severe { background: rgba(220, 38, 38, 0.2); color: #ef4444; border-color: #ef4444; }

.tag-status {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}
.tag-status.pending { color: #60a5fa; background: rgba(59, 130, 246, 0.1); }
.tag-status.processing { color: #a78bfa; background: rgba(139, 92, 246, 0.1); }
.tag-status.handled { color: #34d399; background: rgba(16, 185, 129, 0.1); }
.tag-status.ignored { color: #94a3b8; background: rgba(148, 163, 184, 0.1); }

/* Description Box */
.desc-box { display: flex; flex-direction: column; gap: 1.5rem; }
.desc-item label { font-size: 0.8125rem; color: #64748b; font-weight: 600; margin-bottom: 0.5rem; display: block; }
.desc-item p { font-size: 0.9375rem; color: #d1d5db; line-height: 1.7; white-space: pre-wrap; }
.desc-item.highlight {
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.1);
  padding: 1rem;
  border-radius: 8px;
}
.desc-item.highlight p { color: #60a5fa; font-weight: 500; }
.desc-item.result { border-top: 1px dashed rgba(255, 255, 255, 0.1); padding-top: 1rem; }

/* User Card */
.user-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 1.25rem;
  border-radius: 12px;
}
.avatar-placeholder {
  width: 54px;
  height: 54px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
}
.user-details { display: flex; flex-direction: column; gap: 0.25rem; }
.u-nick { font-size: 1.125rem; font-weight: 700; color: #fff; }
.u-id { font-size: 0.8125rem; color: #64748b; font-family: monospace; }
.u-meta { font-size: 0.75rem; color: #3b82f6; font-weight: 600; }

/* Evidence Table */
.evidence-table-wrapper {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
}
.evidence-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.evidence-table th { padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; color: #64748b; background: rgba(255, 255, 255, 0.02); }
.evidence-table td { padding: 0.875rem 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.03); }
.ev-tag { padding: 0.125rem 0.375rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; }
.ev-tag.note { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.ev-tag.comment { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.core-dot { width: 8px; height: 8px; background: #f59e0b; border-radius: 50%; display: block; box-shadow: 0 0 8px #f59e0b; }
.btn-link-icon { background: transparent; border: none; color: #64748b; cursor: pointer; transition: 0.2s; }
.btn-link-icon:hover { color: #3b82f6; }

/* History Timeline */
.history-timeline { display: flex; flex-direction: column; gap: 1.25rem; }
.timeline-item { display: flex; gap: 1rem; position: relative; }
.timeline-point {
  width: 10px; height: 10px; background: #3b82f6; border-radius: 50%; margin-top: 0.375rem; z-index: 1;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}
.timeline-item::after {
  content: ''; position: absolute; left: 4px; top: 1.25rem; bottom: -1rem; width: 2px;
  background: rgba(255, 255, 255, 0.05);
}
.timeline-item:last-child::after { display: none; }
.timeline-content { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
.timeline-header { display: flex; justify-content: space-between; align-items: center; }
.log-user { font-size: 0.8125rem; font-weight: 700; color: #e5e7eb; }
.log-time { font-size: 0.75rem; color: #64748b; }
.log-action { font-size: 0.875rem; color: #94a3b8; }

/* Modal Footer */
.modal-footer {
  padding: 1.25rem 1.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(15, 23, 42, 0.6);
}
.footer-right { display: flex; gap: 0.75rem; }

/* Global components reuse */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 38px;
  padding: 0 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
  border: 1px solid transparent;
}

.btn-primary { background: #3b82f6; color: #fff; }
.btn-primary:hover { background: #2563eb; }

.btn-secondary { background: #8b5cf6; color: #fff; }
.btn-secondary:hover { background: #7c3aed; }

.btn-success { background: #10b981; color: #fff; }
.btn-success:hover { background: #059669; }

.btn-warning { background: #f59e0b; color: #fff; }
.btn-warning:hover { background: #d97706; }

.btn-danger { background: #ef4444; color: #fff; }
.btn-danger:hover { background: #dc2626; }
.btn-danger.btn-outline { background: transparent; border-color: rgba(239, 68, 68, 0.3); color: #f87171; }
.btn-danger.btn-outline:hover { background: rgba(239, 68, 68, 0.1); border-color: #ef4444; }

.btn-ghost { background: transparent; color: #94a3b8; }
.btn-ghost:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }

.loading-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; padding: 4rem; }
.spinner { width: 40px; height: 40px; border: 4px solid rgba(59, 130, 246, 0.1); border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty-text, .empty-history { text-align: center; padding: 2rem; color: #475569; font-style: italic; font-size: 0.875rem; }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
