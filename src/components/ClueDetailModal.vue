<script setup lang="ts">
import { ref, watch } from 'vue';
import { X, ExternalLink, Clock, Construction, CheckCircle2, Trash2 } from 'lucide-vue-next';
import type { ClueDetail } from '../types';

const props = defineProps<{
  showDetailModal: boolean;
  selectedClue: ClueDetail | null;
  detailLoading: boolean;
  getRiskConfig: (level: number) => { label: string, type: string };
  getStatusConfig: (status: number) => { label: string, type: string, icon: any };
  sourceOptions: { value: string; label: string; }[];
}>();

const emit = defineEmits<{
  (e: 'update:showDetailModal', value: boolean): void;
}>();

const handleCloseModal = () => {
  emit('update:showDetailModal', false);
};

const formatDate = (ts: number) => {
  if (!ts) return '-';
  const date = new Date(ts * 1000);
  return date.toLocaleString();
};

const getSourceLabel = (sourceType: string) => {
  const source = props.sourceOptions.find(option => option.value === sourceType);
  return source ? source.label : sourceType;
};
</script>

<template>
  <transition name="fade">
    <div v-if="props.showDetailModal" class="el-dialog-overlay" @click.self="handleCloseModal">
      <div class="el-dialog-box wide">
        <header class="el-dialog-header">
          <span class="el-dialog-title">线索全景详情</span>
          <button @click="handleCloseModal" class="el-dialog-close"><X /></button>
        </header>
        
        <main class="el-dialog-body custom-scrollbar">
          <div v-if="props.detailLoading" class="el-loading-area"><div class="el-spinner"></div><p>正在拉取详情...</p></div>
          <div v-else-if="props.selectedClue" class="el-detail-layout">
            <!-- 左侧：主要信息 -->
            <div class="el-detail-main">
              <div class="el-detail-group">
                <div class="el-detail-title">线索摘要</div>
                <div class="el-detail-content-well">
                  <p><b>可疑原因:</b> {{ props.selectedClue.suspicious_reason || '未定义' }}</p>
                  <hr class="el-hr">
                  <p><b>详细描述:</b> {{ props.selectedClue.clue_desc || '暂无描述' }}</p>
                </div>
              </div>
              
              <div class="el-detail-group">
                <div class="el-detail-title">关联证据 ({{ props.selectedClue.notes.length + props.selectedClue.comments.length }})</div>
                <div class="el-evidence-list">
                  <div v-for="note in props.selectedClue.notes" :key="note.note_id" class="el-evidence-card">
                    <span class="type-tag note">笔记</span>
                    <div class="info">
                      <div class="id">ID: {{ note.note_id }}</div>
                      <div class="type">{{ note.relation_type }}</div>
                    </div>
                    <a :href="`https://www.xiaohongshu.com/explore/${note.note_id}`" target="_blank" class="el-link"><ExternalLink /></a>
                  </div>
                  <div v-for="comment in props.selectedClue.comments" :key="comment.comment_id" class="el-evidence-card">
                    <span class="type-tag comment">评论</span>
                    <div class="info">
                      <div class="id">ID: {{ comment.comment_id }}</div>
                      <div class="type">{{ comment.relation_type }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧：属性状态 -->
            <div class="el-detail-side">
              <div class="el-detail-group">
                <div class="el-detail-title">线索属性</div>
                <div class="el-attr-box">
                  <div class="attr-item"><span class="label">风险等级</span><span class="el-tag" :class="props.getRiskConfig(props.selectedClue.risk_level).type">{{ props.getRiskConfig(props.selectedClue.risk_level).label }}</span></div>
                  <div class="attr-item"><span class="label">来源渠道</span><span class="val">{{ getSourceLabel(props.selectedClue.source_type) }}</span></div>
                  <div class="attr-item"><span class="label">命中规则</span><span class="rule">#{{ props.selectedClue.hit_rule_code }}</span></div>
                </div>
              </div>
              <div class="el-detail-group">
                <div class="el-detail-title">流程处置</div>
                <div class="el-attr-box">
                  <div class="attr-item">
                    <span class="label">当前状态</span>
                    <span class="el-tag-status" :class="props.getStatusConfig(props.selectedClue.status).type">
                      <component :is="props.getStatusConfig(props.selectedClue.status).icon" class="status-i" />
                      {{ props.getStatusConfig(props.selectedClue.status).label }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* Scoped styles specific to ClueDetailModal */
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
  max-width: 900px; /* wide */
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

.el-detail-layout {
  display: grid;
  grid-template-columns: 2fr 1fr; /* Two columns for main and side */
  gap: 20px;
}

.el-detail-group {
  margin-bottom: 20px;
}

.el-detail-title {
  color: #e2e8f0;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.el-detail-content-well {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 15px;
}

.el-detail-content-well p {
  margin-bottom: 8px;
  line-height: 1.6;
}

.el-detail-content-well p:last-child {
  margin-bottom: 0;
}

.el-hr {
  border: none;
  border-top: 1px dashed #334155;
  margin: 15px 0;
}

.el-evidence-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.el-evidence-card {
  display: flex;
  align-items: center;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 10px 15px;
  gap: 10px;
}

.type-tag {
  background: #334155;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.type-tag.note { background-color: #3b82f6; }
.type-tag.comment { background-color: #8b5cf6; }

.el-evidence-card .info {
  flex-grow: 1;
}

.el-evidence-card .info .id {
  font-size: 13px;
  font-weight: 600;
  color: #f8fafc;
}

.el-evidence-card .info .type {
  font-size: 12px;
  color: #94a3b8;
}

.el-link {
  color: #60a5fa;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
}

.el-link:hover {
  text-decoration: underline;
}

.el-attr-box {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.attr-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.attr-item .label {
  font-size: 14px;
  color: #cbd5e1;
}

.attr-item .val {
  font-size: 14px;
  font-weight: 600;
  color: #f8fafc;
}

.attr-item .rule {
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  color: #818cf8;
}

.el-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  border: 1px solid;
}
.el-tag.low { background: rgba(103, 194, 58, 0.1); color: #67c23a; border-color: rgba(103, 194, 58, 0.2); }
.el-tag.medium { background: rgba(230, 162, 60, 0.1); color: #e6a23c; border-color: rgba(230, 162, 60, 0.2); }
.el-tag.high { background: rgba(245, 108, 108, 0.1); color: #f56c6c; border-color: rgba(245, 108, 108, 0.2); }
.el-tag.severe { background: rgba(144, 147, 153, 0.1); color: #909399; border-color: rgba(144, 147, 153, 0.2); }

.el-tag-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
}
.el-tag-status.pending { color: #409eff; }
.el-tag-status.processing { color: #9061f9; }
.el-tag-status.handled { color: #67c23a; }
.el-tag-status.ignored { color: #909399; }

.status-i {
  width: 1em;
  height: 1em;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
