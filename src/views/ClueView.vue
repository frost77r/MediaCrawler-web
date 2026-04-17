<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  Search, Filter, CheckCircle2, 
  Clock, Trash2, Plus,
  ChevronLeft, ChevronRight, Eye,
  Construction, PencilLine,
  Download, Users, ArrowRightLeft, Ban, ChevronDown, ChevronUp
} from 'lucide-vue-next';
import { clueApi } from '../api/clue';
import type { Clue, ClueDetail } from '../types';
import CustomSelect from '../components/CustomSelect.vue';
import ClueCreateEditModal from '../components/ClueCreateEditModal.vue';
import ClueDetailModal from '../components/ClueDetailModal.vue';
import ClueDeleteConfirmModal from '../components/ClueDeleteConfirmModal.vue';

// 状态管理
const loading = ref(false);
const clues = ref<Clue[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(15);

// 筛选状态
const showAdvancedFilter = ref(false);
const selectedIds = ref<number[]>([]);
const filters = ref({
  keyword: '',
  source_type: 'all',
  status: 'all' as any,
  risk_level: 'all' as any,
  time_range: 'create_time',
  start_time: '',
  end_time: '',
  // 高级筛选
  source_keyword: '',
  hit_rule: '',
  handler: '',
  platform: 'all',
  is_core_evidence: 'all'
});

// 下拉框配置
const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 0, label: '待处理' },
  { value: 1, label: '处理中' },
  { value: 2, label: '已处置' },
  { value: 3, label: '已忽略' }
];

const riskLevelOptions = [
  { value: 'all', label: '全部风险' },
  { value: 0, label: '低' },
  { value: 1, label: '中' },
  { value: 2, label: '高' },
  { value: 3, label: '严重' }
];

const sourceOptions = [
  { value: 'all', label: '全部来源' },
  { value: 'manual', label: '手动录入' },
  { value: 'rule', label: '系统规则' },
  { value: 'note', label: '帖子' },
  { value: 'comment', label: '评论' }
];

const platformOptions = [
  { value: 'all', label: '全部平台' },
  { value: 'xhs', label: '小红书' },
  { value: 'douyin', label: '抖音' },
  { value: 'bilibili', label: 'B站' }
];

// 模态框控制
const isDetailModalVisible = ref(false);
const selectedClueForDetail = ref<ClueDetail | null>(null);
const showDeleteConfirmModal = ref(false);
const isCreateModalVisible = ref(false);
const isEditModalVisible = ref(false);
const isSubmitLoading = ref(false);
const detailLoading = ref(false);
const clueToDelete = ref<number | number[] | null>(null);

const clueForm = ref<Clue>({
  clue_no: '',
  clue_title: '',
  clue_desc: '',
  target_user_id: '',
  target_user_nickname: '',
  source_type: 'manual',
  risk_level: 0,
  suspicious_reason: '',
  evidence_summary: '',
  status: 0,
  note_ids: [],
  comment_ids: []
});

// 数据请求
const fetchClues = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: page.value,
      page_size: pageSize.value,
      keyword: filters.value.keyword || undefined,
      source_type: filters.value.source_type !== 'all' ? filters.value.source_type : undefined,
      status: filters.value.status !== 'all' ? filters.value.status : undefined,
      risk_level: filters.value.risk_level !== 'all' ? filters.value.risk_level : undefined,
      source_keyword: filters.value.source_keyword || undefined,
      hit_rule: filters.value.hit_rule || undefined,
      handler: filters.value.handler || undefined,
      platform: filters.value.platform !== 'all' ? filters.value.platform : undefined
    };

    const res: any = await clueApi.list(params);
    clues.value = res.items;
    total.value = res.total;
  } catch (error) {
    console.error('获取线索失败:', error);
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = {
    keyword: '',
    source_type: 'all',
    status: 'all',
    risk_level: 'all',
    time_range: 'create_time',
    start_time: '',
    end_time: '',
    source_keyword: '',
    hit_rule: '',
    handler: '',
    platform: 'all',
    is_core_evidence: 'all'
  };
  fetchClues();
};

// 批量操作
const toggleSelectAll = () => {
  if (selectedIds.value.length === clues.value.length) {
    selectedIds.value = [];
  } else {
    selectedIds.value = clues.value.map(c => c.id!).filter(id => id !== undefined);
  }
};

const handleBulkDelete = () => {
  if (selectedIds.value.length === 0) return;
  clueToDelete.value = [...selectedIds.value];
  showDeleteConfirmModal.value = true;
};

// 弹窗逻辑
const handleOpenCreate = () => {
  clueForm.value = {
    clue_no: '',
    clue_title: '',
    clue_desc: '',
    target_user_id: '',
    target_user_nickname: '',
    source_type: 'manual',
    risk_level: 0,
    suspicious_reason: '',
    evidence_summary: '',
    status: 0,
    note_ids: [],
    comment_ids: []
  };
  isCreateModalVisible.value = true;
};

const handleOpenEdit = async (clue: Clue) => {
  detailLoading.value = true;
  isEditModalVisible.value = true;
  try {
    const detail: any = await clueApi.getDetail(clue.id!);
    clueForm.value = {
      ...detail,
      note_ids: detail.notes?.map((n: any) => n.note_id) || [],
      comment_ids: detail.comments?.map((c: any) => c.comment_id) || []
    };
  } catch (error) {
    console.error('获取编辑详情失败:', error);
  } finally {
    detailLoading.value = false;
  }
};

const handleSaveClue = async (data: Clue) => {
  isSubmitLoading.value = true;
  try {
    if (data.id) {
      await clueApi.update(data.id, data);
    } else {
      await clueApi.create(data);
    }
    isCreateModalVisible.value = false;
    isEditModalVisible.value = false;
    fetchClues();
  } catch (error) {
    console.error('保存失败:', error);
  } finally {
    isSubmitLoading.value = false;
  }
};

const handleViewDetail = async (id: number) => {
  detailLoading.value = true;
  isDetailModalVisible.value = true;
  try {
    const res: any = await clueApi.getDetail(id);
    selectedClueForDetail.value = res;
  } catch (error) {
    console.error('获取详情失败:', error);
  } finally {
    detailLoading.value = false;
  }
};

const handleDeleteClue = (id: number) => {
  clueToDelete.value = id;
  showDeleteConfirmModal.value = true;
};

const confirmDeleteClue = async () => {
  if (!clueToDelete.value) return;
  try {
    if (Array.isArray(clueToDelete.value)) {
      // 批量删除
      for (const id of clueToDelete.value) {
        await clueApi.delete(id);
      }
      selectedIds.value = [];
    } else {
      await clueApi.delete(clueToDelete.value);
    }
    fetchClues();
    showDeleteConfirmModal.value = false;
    clueToDelete.value = null;
  } catch (error) {
    console.error('删除失败:', error);
  }
};

// 工具函数
const getRiskConfig = (level: number) => {
  const configs: Record<number, { label: string, type: string, color: string }> = {
    0: { label: '低', type: 'low', color: '#10b981' },
    1: { label: '中', type: 'medium', color: '#f59e0b' },
    2: { label: '高', type: 'high', color: '#f43f5e' },
    3: { label: '严重', type: 'severe', color: '#e11d48' }
  };
  return configs[level] || { label: '未知', type: 'unknown', color: '#94a3b8' };
};

const getStatusConfig = (status: number) => {
  const configs: Record<number, { label: string, type: string, icon: any }> = {
    0: { label: '待处理', type: 'pending', icon: Clock },
    1: { label: '处理中', type: 'processing', icon: Construction },
    2: { label: '已处置', type: 'handled', icon: CheckCircle2 },
    3: { label: '已忽略', type: 'ignored', icon: Trash2 }
  };
  return configs[status] || { label: '未知', type: 'unknown', icon: Clock };
};

const getSourceLabel = (type: string) => {
  const types: Record<string, string> = {
    'manual': '手动录入',
    'rule': '系统规则',
    'note': '帖子',
    'comment': '评论'
  };
  return types[type] || type;
};

const formatDate = (ts: number | undefined) => {
  if (!ts) return '-';
  const date = new Date(ts * 1000);
  return date.toLocaleString();
};

onMounted(() => {
  fetchClues();
});
</script>

<template>
  <div class="clue-management">
    <!-- 筛选区 -->
    <div class="filter-container">
      <div class="filter-top">
        <div class="filter-main">
          <div class="filter-item search-box">
            <div class="input-wrapper">
              <Search class="icon-search" />
              <input v-model="filters.keyword" @keyup.enter="fetchClues" placeholder="搜索标题/编号/用户/内容..." class="custom-input">
            </div>
          </div>
          <div class="filter-item">
            <CustomSelect v-model="filters.source_type" :options="sourceOptions" @change="fetchClues" />
          </div>
          <div class="filter-item">
            <CustomSelect v-model="filters.status" :options="statusOptions" @change="fetchClues" />
          </div>
          <div class="filter-item">
            <CustomSelect v-model="filters.risk_level" :options="riskLevelOptions" @change="fetchClues" />
          </div>
          <div class="filter-actions">
            <button @click="fetchClues" class="btn btn-secondary"><Filter class="w-4 h-4" /> 筛选</button>
            <button @click="resetFilters" class="btn btn-ghost">重置</button>
            <button @click="showAdvancedFilter = !showAdvancedFilter" class="btn btn-link">
              {{ showAdvancedFilter ? '收起高级' : '高级筛选' }}
              <component :is="showAdvancedFilter ? ChevronUp : ChevronDown" class="w-4 h-4" />
            </button>
          </div>
        </div>
        <div class="global-actions">
          <button class="btn btn-ghost"><Download class="w-4 h-4" /> 导出</button>
          <button @click="handleOpenCreate" class="btn btn-primary"><Plus class="w-4 h-4" /> 新增线索</button>
        </div>
      </div>

      <!-- 高级筛选 -->
      <transition name="expand">
        <div v-if="showAdvancedFilter" class="filter-advanced">
          <div class="adv-grid">
            <div class="adv-item">
              <label>来源关键词</label>
              <input v-model="filters.source_keyword" placeholder="关键词..." class="custom-input">
            </div>
            <div class="adv-item">
              <label>命中规则</label>
              <input v-model="filters.hit_rule" placeholder="规则名称..." class="custom-input">
            </div>
            <div class="adv-item">
              <label>处理人</label>
              <input v-model="filters.handler" placeholder="姓名..." class="custom-input">
            </div>
            <div class="adv-item">
              <label>所属平台</label>
              <CustomSelect v-model="filters.platform" :options="platformOptions" />
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- 操作区 -->
    <div class="action-bar" v-show="selectedIds.length > 0">
      <div class="bulk-actions">
        <template v-if="selectedIds.length > 0">
          <span class="selection-info">已选 {{ selectedIds.length }} 项</span>
          <button class="btn btn-secondary btn-sm"><Users class="w-3.5 h-3.5" /> 批量分派</button>
          <button class="btn btn-secondary btn-sm"><ArrowRightLeft class="w-3.5 h-3.5" /> 修改状态</button>
          <button class="btn btn-secondary btn-sm"><Ban class="w-3.5 h-3.5" /> 批量忽略</button>
          <button @click="handleBulkDelete" class="btn btn-danger btn-sm"><Trash2 class="w-3.5 h-3.5" /> 批量删除</button>
        </template>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <div class="table-wrapper custom-scrollbar">
        <table class="data-table">
          <thead>
            <tr>
              <th class="checkbox-col">
                <input type="checkbox" :checked="selectedIds.length === clues.length && clues.length > 0" @change="toggleSelectAll">
              </th>
              <th style="width: 120px">线索编号</th>
              <th style="width: 150px">线索标题</th>
              <th style="width: 120px">线索来源</th>
              <th style="width: 200px">来源内容摘要</th>
              <th style="width: 100px">风险等级</th>
              <th style="width: 120px">处理状态</th>
              <th style="width: 120px">目标用户</th>
              <th style="width: 80px">关联数</th>
              <th style="width: 180px">发现时间</th>
              <th style="width: 120px; text-align: center;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" v-for="i in 10" :key="i" class="skeleton-row">
              <td colspan="11"><div class="skeleton-bar"></div></td>
            </tr>
            <tr v-else-if="clues.length === 0">
              <td colspan="11" class="empty-row">暂无相关线索数据</td>
            </tr>
            <tr v-for="clue in clues" :key="clue.id" :class="{ selected: selectedIds.includes(clue.id!) }">
              <td class="checkbox-col">
                <input type="checkbox" v-model="selectedIds" :value="clue.id">
              </td>
              <td class="mono-text">{{ clue.clue_no || 'CLUE-0000' }}</td>
              <td class="clue-title" :title="clue.clue_title">{{ clue.clue_title }}</td>
              <td>
                <span class="source-tag" :class="clue.source_type">
                  {{ getSourceLabel(clue.source_type || 'manual') }}
                </span>
              </td>
              <td class="summary-cell" :title="clue.clue_desc || clue.source_content_summary">
                <div class="summary-content">
                  <span class="source-id" v-if="clue.source_note_id">#{{ clue.source_note_id.slice(-6) }}</span>
                  {{ clue.source_content_summary || clue.clue_desc || '-' }}
                </div>
              </td>
              <td>
                <div class="risk-indicator">
                  <span class="risk-dot" :style="{ backgroundColor: getRiskConfig(clue.risk_level || 0).color }"></span>
                  {{ getRiskConfig(clue.risk_level || 0).label }}
                </div>
              </td>
              <td>
                <span class="status-badge" :class="getStatusConfig(clue.status || 0).type">
                  <component :is="getStatusConfig(clue.status || 0).icon" class="w-3 h-3" />
                  {{ getStatusConfig(clue.status || 0).label }}
                </span>
              </td>
              <td>
                <div class="user-info">
                  <div class="user-nick">{{ clue.target_user_nickname || '-' }}</div>
                  <div class="user-id">{{ clue.target_user_id || '-' }}</div>
                </div>
              </td>
              <td>
                <div class="count-badges">
                  <span class="count-tag" title="帖子">{{ clue.related_note_count || 0 }}</span>
                  <span class="count-tag secondary" title="评论">{{ clue.related_comment_count || 0 }}</span>
                </div>
              </td>
              <td class="time-text">{{ formatDate(clue.create_time) }}</td>
              <td>
                <div class="op-group">
                  <button @click="handleViewDetail(clue.id!)" class="op-btn view" title="详情"><Eye /></button>
                  <button @click="handleOpenEdit(clue)" class="op-btn edit" title="编辑"><PencilLine /></button>
                  <button @click="handleDeleteClue(clue.id!)" class="op-btn delete" title="删除"><Trash2 /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <footer class="pagination">
        <div class="pagination-info">
          共 <span class="total-count">{{ total }}</span> 条线索
        </div>
        <div class="pagination-controls">
          <button :disabled="page === 1" @click="page--; fetchClues()" class="page-btn">
            <ChevronLeft class="w-4 h-4" />
          </button>
          <span class="page-indicator">第 {{ page }} 页</span>
          <button :disabled="page * pageSize >= total" @click="page++; fetchClues()" class="page-btn">
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>

    <!-- 弹窗组件 -->
    <ClueCreateEditModal
      v-model:showCreateModal="isCreateModalVisible"
      v-model:showEditModal="isEditModalVisible"
      v-model:clueForm="clueForm"
      :submitLoading="isSubmitLoading"
      @saveClue="handleSaveClue"
    />

    <ClueDetailModal
      v-model:showDetailModal="isDetailModalVisible"
      :selectedClue="selectedClueForDetail"
      :detailLoading="detailLoading"
      @update-status="fetchClues"
      @edit="handleOpenEdit"
      @delete="handleDeleteClue"
    />

    <ClueDeleteConfirmModal
      v-model:showDeleteConfirmModal="showDeleteConfirmModal"
      :isBatch="Array.isArray(clueToDelete)"
      :count="Array.isArray(clueToDelete) ? clueToDelete.length : 1"
      @confirmDelete="confirmDeleteClue"
    />
  </div>
</template>

<style scoped>
.clue-management {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 2rem;
  background-color: transparent;
  gap: 1.5rem;
  color: var(--text-main);
}

/* Header */
.page-header {
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
  color: #fff;
  letter-spacing: -0.025em;
}

.header-desc {
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  border-left: 1px solid var(--glass-border);
  padding-left: 1rem;
}

/* Filter Container */
.filter-container {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.filter-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.filter-main {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  flex: 1;
}

.global-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.action-divider {
  width: 1px;
  height: 1.5rem;
  background-color: var(--glass-border);
  margin: 0 0.25rem;
}

.search-box { width: 300px; }
.input-wrapper { position: relative; width: 100%; }
.icon-search { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); width: 1rem; color: #64748b; }
.custom-input {
  width: 100%;
  height: 36px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding-left: 2.25rem;
  padding-right: 0.75rem;
  color: #fff;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s;
}
.custom-input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }

.filter-item { min-width: 140px; }
.filter-actions { display: flex; align-items: center; gap: 0.75rem; margin-left: auto; }

/* Advanced Filter */
.filter-advanced {
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.adv-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}
.adv-item { display: flex; flex-direction: column; gap: 0.5rem; }
.adv-item label { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }

/* Action Bar */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.bulk-actions { display: flex; align-items: center; gap: 0.75rem; }
.selection-info { font-size: 0.875rem; color: var(--accent); font-weight: 600; margin-right: 0.5rem; }
.right-actions { display: flex; align-items: center; gap: 0.75rem; }

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 36px;
  padding: 0 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: 0.2s;
  border: 1px solid transparent;
}
.btn-sm { height: 32px; padding: 0 0.75rem; font-size: 0.75rem; }

.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-hover); }

.btn-secondary { background: rgba(51, 65, 85, 0.8); color: #e2e8f0; border-color: rgba(255, 255, 255, 0.1); }
.btn-secondary:hover { background: #475569; }

.btn-danger { background: rgba(239, 68, 68, 0.15); color: #f87171; border-color: rgba(239, 68, 68, 0.2); }
.btn-danger:hover { background: rgba(239, 68, 68, 0.25); }

.btn-ghost { background: transparent; color: var(--text-muted); }
.btn-ghost:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }

.btn-link { background: transparent; color: var(--accent); padding: 0; }
.btn-link:hover { text-decoration: underline; }

/* Table */
.table-container {
  flex: 1;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-wrapper { flex: 1; overflow: auto; }

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.95);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  border-bottom: 1px solid var(--glass-border);
}

.data-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 0.875rem;
  vertical-align: middle;
}

.data-table tr:hover { background: rgba(59, 130, 246, 0.04); }
.data-table tr.selected { background: rgba(59, 130, 246, 0.08); }

.checkbox-col { width: 48px; text-align: center; }
.checkbox-col input { width: 16px; height: 16px; cursor: pointer; accent-color: var(--accent); }

.mono-text { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: var(--text-muted); font-size: 0.75rem; }
.clue-title { font-weight: 600; color: #fff; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.source-tag {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}
.source-tag.manual { background: rgba(148, 163, 184, 0.1); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.2); }
.source-tag.rule { background: rgba(139, 92, 246, 0.1); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.2); }
.source-tag.note { background: rgba(59, 130, 246, 0.1); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.2); }
.source-tag.comment { background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); }

.summary-cell { max-width: 280px; }
.summary-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-muted);
}
.source-id { color: var(--accent); font-size: 0.75rem; margin-right: 0.25rem; font-weight: 600; }

.risk-indicator { display: flex; align-items: center; gap: 0.5rem; }
.risk-dot { width: 8px; height: 8px; border-radius: 50%; }

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
}
.status-badge.pending { color: #60a5fa; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); }
.status-badge.processing { color: #a78bfa; background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.2); }
.status-badge.handled { color: #34d399; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); }
.status-badge.ignored { color: #94a3b8; background: rgba(100, 116, 139, 0.1); border: 1px solid rgba(100, 116, 139, 0.2); }

.user-info { display: flex; flex-direction: column; }
.user-nick { color: #f1f5f9; font-weight: 500; }
.user-id { color: var(--text-muted); font-size: 0.75rem; }

.count-badges { display: flex; gap: 0.375rem; }
.count-tag {
  background: rgba(59, 130, 246, 0.1);
  color: var(--accent);
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
}
.count-tag.secondary { background: rgba(16, 185, 129, 0.1); color: #10b981; }

.time-text { color: var(--text-muted); font-size: 0.75rem; }

/* Operations */
.op-group { display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
.op-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--text-muted);
  transition: all 0.2s;
  border-radius: 0.25rem;
}
.op-btn svg { width: 1.125rem; height: 1.125rem; }
.op-btn:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }
.op-btn.delete:hover { color: #f43f5e; background: rgba(244, 63, 94, 0.1); }

/* Pagination */
.pagination {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.pagination-info { font-size: 0.875rem; color: var(--text-muted); }
.total-count { color: #fff; font-weight: 600; }
.pagination-controls { display: flex; align-items: center; gap: 1rem; }
.page-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  cursor: pointer;
}
.page-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}
.page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.page-indicator { font-size: 0.875rem; color: #fff; min-width: 80px; text-align: center; }

/* Transitions */
.expand-enter-active, .expand-leave-active { transition: all 0.3s ease-out; max-height: 200px; overflow: hidden; }
.expand-enter-from, .expand-leave-to { max-height: 0; opacity: 0; padding-top: 0; }

/* Skeleton */
.skeleton-bar { height: 1.5rem; background: rgba(255, 255, 255, 0.03); border-radius: 4px; animation: pulse 2s infinite; }
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

.empty-row { text-align: center; padding: 3rem !important; color: var(--text-muted); font-style: italic; }

.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
</style>
