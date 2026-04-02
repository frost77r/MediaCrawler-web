<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  Search, Filter, AlertTriangle, CheckCircle2, 
  Clock, ExternalLink, Trash2, Plus,
  ChevronLeft, ChevronRight, Eye, ShieldAlert,
  Construction, X, PencilLine
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
const filters = ref({
  status: 'all' as any,
  risk_level: 'all' as any,
  keyword: ''
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
  { value: 0, label: '低风险' },
  { value: 1, label: '中风险' },
  { value: 2, label: '高风险' },
  { value: 3, label: '严重' }
];

const sourceOptions = [
  { value: 'manual', label: '手动录入' },
  { value: 'rule', label: '规则引擎' },
  { value: 'note', label: '笔记分析' },
  { value: 'comment', label: '评论分析' }
];

// 模态框控制

const isDetailModalVisible = ref(false);
const selectedClueForDetail = ref<ClueDetail | null>(null);
const showDeleteConfirmModal = ref(false);
const isCreateModalVisible = ref(false);
const isEditModalVisible = ref(false);
const isSubmitLoading = ref(false);
const detailLoading = ref(false);
const clueToDelete = ref<number | null>(null);

const clueForm = ref({
  id: undefined as number | undefined,
  clue_no: '',
  clue_title: '',
  clue_desc: '',
  target_user_id: '',
  source_type: 'manual',
  risk_level: 0,
  suspicious_reason: '',
  note_ids: [] as string[],
  comment_ids: [] as string[],
  status: 0 // Default status for new clues
});

// 数据请求
const fetchClues = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: page.value,
      page_size: pageSize.value,
      keyword: filters.value.keyword || undefined
    };
    if (filters.value.status !== 'all') params.status = filters.value.status;
    if (filters.value.risk_level !== 'all') params.risk_level = filters.value.risk_level;

    const res: any = await clueApi.list(params);
    clues.value = res.items;
    total.value = res.total;
  } catch (error) {
    console.error('获取线索失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleOpenCreate = () => {
  clueForm.value = {
    id: undefined, clue_no: '', clue_title: '', clue_desc: '', target_user_id: '',
    source_type: 'manual', risk_level: 0, suspicious_reason: '',
    note_ids: [], comment_ids: [], status: 0
  };
  isCreateModalVisible.value = true;
};

const handleOpenEdit = async (clue: Clue) => {
  detailLoading.value = true;
  isEditModalVisible.value = true;
  try {
    const detail: any = await clueApi.getDetail(clue.id);
    clueForm.value = {
      id: detail.id,
      clue_no: detail.clue_no,
      clue_title: detail.clue_title,
      clue_desc: detail.clue_desc,
      target_user_id: detail.target_user_id,
      source_type: detail.source_type,
      risk_level: detail.risk_level,
      suspicious_reason: detail.suspicious_reason,
      note_ids: detail.notes.map((n: any) => n.note_id),
      comment_ids: detail.comments.map((c: any) => c.comment_id),
      status: detail.status // Add status here
    };
  } catch (error) {
    console.error('获取编辑详情失败:', error);
  } finally {
    detailLoading.value = false;
  }
};

const handleSaveClue = async () => {
  if (!clueForm.value.clue_title) return alert('请填写线索标题');
  
  isSubmitLoading.value = true;
  try {
    if (clueForm.value.id) {
      await clueApi.update(clueForm.value.id, clueForm.value);
    } else {
      clueForm.value.clue_no = 'CLUE-' + Date.now().toString().slice(-6);
      await clueApi.create(clueForm.value);
    }
    isCreateModalVisible.value = false;
    isEditModalVisible.value = false;
    await fetchClues();
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

const handleUpdateStatus = async (id: number, status: number) => {
  try {
    await clueApi.update(id, { status });
    if (selectedClueForDetail.value && selectedClueForDetail.value.id === id) {
      selectedClueForDetail.value.status = status;
    }
    await fetchClues();
  } catch (error) {
    console.error('更新状态失败:', error);
  }
};

const handleDeleteClue = (id: number) => {
  clueToDelete.value = id;
  showDeleteConfirmModal.value = true;
};

const confirmDeleteClue = async () => {
  if (clueToDelete.value === null) return;
  try {
    await clueApi.delete(clueToDelete.value);
    await fetchClues();
    if (selectedClueForDetail.value?.id === clueToDelete.value) {
      isDetailModalVisible.value = false;
    }
    showDeleteConfirmModal.value = false;
    clueToDelete.value = null;
  } catch (error) {
    console.error('删除失败:', error);
  }
};

const getRiskConfig = (level: number) => {
  const configs: Record<number, { label: string, type: string }> = {
    0: { label: '低', type: 'low' },
    1: { label: '中', type: 'medium' },
    2: { label: '高', type: 'high' },
    3: { label: '严重', type: 'severe' }
  };
  return configs[level] || { label: '未知', type: 'unknown' };
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

const formatDate = (ts: number) => {
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
    <!-- 头部工具栏 -->
    <header class="clue-header-bar">
      <div class="title-section">
        <h2 class="main-title"><ShieldAlert class="icon-title" /> 线索管理</h2>
        <span class="sub-subtitle">智能化风险预警与线索跟踪系统</span>
      </div>

      <div class="action-section">
        <div class="filter-group">
          <div class="search-input">
            <Search class="icon-search" />
            <input v-model="filters.keyword" @keyup.enter="fetchClues" placeholder="搜索标题/用户ID..." class="el-style-input">
          </div>
          <div class="select-box"><CustomSelect v-model="filters.status" :options="statusOptions" @change="fetchClues" /></div>
          <div class="select-box"><CustomSelect v-model="filters.risk_level" :options="riskLevelOptions" @change="fetchClues" /></div>
          <button @click="fetchClues" class="el-btn el-btn-info"><Filter class="btn-i" /> 筛选</button>
        </div>
        <button @click="handleOpenCreate" class="el-btn el-btn-primary"><Plus class="btn-i" /> 手动录入</button>
      </div>
    </header>

    <!-- 表格区域 -->
    <div class="clue-data-card">
      <div class="table-scroll-area custom-scrollbar">
        <table class="el-table-mock">
          <thead>
            <tr>
              <th style="width: 200px">线索标题</th>
              <th style="width: 350px">描述摘要</th>
              <th style="width: 120px">风险等级</th>
              <th style="width: 120px">处理状态</th>
              <th style="width: 150px">目标用户</th>
              <th style="width: 180px">发现时间</th>
              <th style="width: 160px">管理操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" v-for="i in 5" :key="i" class="loading-row">
              <td colspan="7"><div class="el-skeleton-item"></div></td>
            </tr>
            <tr v-else-if="clues.length === 0">
              <td colspan="7" class="el-empty-cell">暂无相关数据</td>
            </tr>
            <tr v-for="clue in clues" :key="clue.id">
              <td class="bold-text">{{ clue.clue_title || '未命名' }}</td>
              <td class="muted-text ellipsis">{{ clue.clue_desc || '-' }}</td>
              <td>
                <span class="el-tag" :class="getRiskConfig(clue.risk_level).type">
                  {{ getRiskConfig(clue.risk_level).label }}
                </span>
              </td>
              <td>
                <span class="el-tag-status" :class="getStatusConfig(clue.status).type">
                  <component :is="getStatusConfig(clue.status).icon" class="status-i" />
                  {{ getStatusConfig(clue.status).label }}
                </span>
              </td>
              <td class="mono-text">{{ clue.target_user_id || '系统匹配' }}</td>
              <td class="time-text">{{ formatDate(clue.create_time) }}</td>
              <td class="text-center">
                <div class="el-button-group">
                  <button @click="handleViewDetail(clue.id)" class="icon-btn-el view" title="详情"><Eye /></button>
                  <button @click="handleOpenEdit(clue)" class="icon-btn-el edit" title="编辑"><PencilLine /></button>
                  <button @click="handleDeleteClue(clue.id)" class="icon-btn-el delete" title="删除"><Trash2 /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页栏 -->
      <footer class="el-pagination-mock">
        <span class="pagination-info">共 <b>{{ total }}</b> 条记录</span>
        <div class="pagination-btns">
          <button :disabled="page === 1" @click="page--; fetchClues()" class="page-btn"><ChevronLeft /></button>
          <span class="page-num">第 {{ page }} 页</span>
          <button :disabled="page * pageSize >= total" @click="page++; fetchClues()" class="page-btn"><ChevronRight /></button>
        </div>
      </footer>
    </div>

    <ClueCreateEditModal
      v-model:showCreateModal="isCreateModalVisible"
      v-model:showEditModal="isEditModalVisible"
      v-model:clueForm="clueForm"
      :submitLoading="isSubmitLoading"
      :riskLevelOptions="riskLevelOptions"
      :sourceOptions="sourceOptions"
      :getStatusConfig="getStatusConfig"
      @saveClue="handleSaveClue"
    />

    <ClueDetailModal
      v-model:showDetailModal="isDetailModalVisible"
      :selectedClue="selectedClueForDetail"
      :detailLoading="detailLoading"
      :getRiskConfig="getRiskConfig"
      :getStatusConfig="getStatusConfig"
    />

    <!-- 删除确认 弹窗 -->
    <ClueDeleteConfirmModal
      v-model:showDeleteConfirmModal="showDeleteConfirmModal"
      @confirmDelete="confirmDeleteClue"
    />

    </div>
</template>

<style scoped>
/* 核心容器 */
.clue-management {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px 24px;
  background-color: transparent;
  gap: 20px;
}

/* 顶部栏 */
.clue-header-bar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;
}

.title-section {
  display: flex;
  flex-direction: column;
}

.main-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
}

.icon-title { color: #fbbf24; }
.sub-subtitle { font-size: 13px; color: #64748b; font-style: italic; }

.action-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Element 风格输入框 */
.el-style-input {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 0 12px 0 32px;
  height: 32px;
  color: #fff;
  font-size: 13px;
  outline: none;
  transition: all 0.2s;
}
.el-style-input:focus { border-color: #409eff; }

.search-input { position: relative; width: 220px; }
.icon-search { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 14px; color: #64748b; }

.select-box { width: 130px; }

/* Element 风格按钮 */
.el-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: 0.2s;
}

.el-btn-primary { background: #409eff; color: #fff; border-color: #409eff; }
.el-btn-primary:hover { background: #66b1ff; border-color: #66b1ff; }

.el-btn-info { background: #334155; color: #fff; border-color: #475569; }
.el-btn-info:hover { background: #475569; }

.el-btn-text { background: transparent; color: #94a3b8; }
.el-btn-text:hover { color: #fff; }

.btn-i { width: 14px; height: 14px; }

/* Element 风格表格 */
.clue-data-card {
  flex: 1;
  background: var(--color-dark-glass);
  border: 1px solid var(--color-dark-border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-scroll-area { flex: 1; overflow: auto; }

.el-table-mock {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.el-table-mock th {
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.8);
  color: #909399;
  font-size: 13px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.el-table-mock td {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  font-size: 13px;
  vertical-align: middle;
}

.el-table-mock tr:hover { background: rgba(255, 255, 255, 0.02); }

/* 单元格风格 */
.bold-text { color: #fff; font-weight: 600; }
.muted-text { color: #64748b; }
.time-text { color: #94a3b8; font-size: 12px; }
.mono-text { font-family: monospace; color: #cbd5e1; }
.ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* 操作按钮组 (颜色优化，常驻显示) */
.el-button-group {
  display: flex;
  /* justify-content: center; */
  gap: 12px;
}

.icon-btn-el {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  transition: transform 0.2s;
}

.icon-btn-el svg { width: 18px; height: 18px; }

.icon-btn-el.view { color: #409eff; }
.icon-btn-el.edit { color: #67c23a; }
.icon-btn-el.delete { color: #f56c6c; }

.icon-btn-el:hover { transform: scale(1.2); }

/* 标签样式 */
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
.status-i { width: 14px; height: 14px; }

/* 分页栏 */
.el-pagination-mock {
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
}

.pagination-info { font-size: 13px; color: #606266; }
.pagination-info b { color: #fff; }

.pagination-btns { display: flex; align-items: center; gap: 8px; }
.page-btn {
  background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #fff;
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
  border-radius: 4px; cursor: pointer;
}
.page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.page-num { font-size: 13px; color: #fff; min-width: 60px; text-align: center; }



/* 通用 */
/* .text-center { text-align: center; } */
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

.el-skeleton-item { height: 20px; background: rgba(255,255,255,0.05); border-radius: 4px; animation: pulse 2s infinite; }
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
