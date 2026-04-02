<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  Search, Filter, AlertTriangle, CheckCircle2, 
  Clock, ExternalLink, Trash2, Plus,
  ChevronLeft, ChevronRight, Eye, User, ShieldAlert,
  Construction, X
} from 'lucide-vue-next';
import { clueApi } from '../api/clue';
import type { Clue, ClueDetail } from '../types';
import CustomSelect from '../components/CustomSelect.vue';

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

// 详情/新增模态框
const selectedClue = ref<ClueDetail | null>(null);
const showDetailModal = ref(false);
const showCreateModal = ref(false);
const detailLoading = ref(false);
const createLoading = ref(false);

const createForm = ref({
  clue_no: '',
  clue_title: '',
  clue_desc: '',
  target_user_id: '',
  source_type: 'manual',
  risk_level: 0,
  suspicious_reason: '',
  note_ids: [] as string[],
  comment_ids: [] as string[]
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

const handleCreateClue = async () => {
  if (!createForm.value.clue_title) return alert('请填写线索标题');
  
  // 生成随机编号方便测试，实际由后端分配更好
  createForm.value.clue_no = 'CLUE-' + Date.now().toString().slice(-6);
  
  createLoading.value = true;
  try {
    await clueApi.create(createForm.value);
    showCreateModal.value = false;
    // 重置表单
    createForm.value = {
      clue_no: '', clue_title: '', clue_desc: '', target_user_id: '',
      source_type: 'manual', risk_level: 0, suspicious_reason: '',
      note_ids: [], comment_ids: []
    };
    await fetchClues();
  } catch (error) {
    console.error('创建失败:', error);
  } finally {
    createLoading.value = false;
  }
};

const handleViewDetail = async (id: number) => {
  detailLoading.value = true;
  showDetailModal.value = true;
  try {
    const res: any = await clueApi.getDetail(id);
    selectedClue.value = res;
  } catch (error) {
    console.error('获取详情失败:', error);
  } finally {
    detailLoading.value = false;
  }
};

const handleUpdateStatus = async (id: number, status: number) => {
  try {
    await clueApi.update(id, { status });
    if (selectedClue.value && selectedClue.value.id === id) {
      selectedClue.value.status = status;
    }
    await fetchClues();
  } catch (error) {
    console.error('更新状态失败:', error);
  }
};

const handleDeleteClue = async (id: number) => {
  if (!confirm('确定要永久删除该线索吗？')) return;
  try {
    await clueApi.delete(id);
    await fetchClues();
    if (selectedClue.value?.id === id) {
      showDetailModal.value = false;
    }
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
  <div class="clue-view-container">
    <!-- Header Section -->
    <header class="view-header">
      <div class="header-content">
        <h2 class="view-title">
          <ShieldAlert class="title-icon" /> 线索管理
        </h2>
        <p class="view-subtitle">智能化识别小红书潜在风险线索与业务机会</p>
      </div>

      <div class="header-actions">
        <div class="filter-toolbar">
          <div class="search-input-wrapper">
            <Search class="search-icon" />
            <input 
              v-model="filters.keyword"
              @keyup.enter="fetchClues"
              type="text" 
              placeholder="搜索线索/用户ID..."
              class="standard-input"
            >
          </div>
          <div class="select-wrapper">
            <CustomSelect v-model="filters.status" :options="statusOptions" @change="fetchClues" />
          </div>
          <div class="select-wrapper">
            <CustomSelect v-model="filters.risk_level" :options="riskLevelOptions" @change="fetchClues" />
          </div>
          <button @click="fetchClues" class="btn-filter">
            <Filter class="btn-icon-small" /> 筛选
          </button>
        </div>

        <button @click="showCreateModal = true" class="btn-create">
          <Plus class="btn-icon-small" /> 手动录入
        </button>
      </div>
    </header>

    <!-- Main Table Card -->
    <div class="data-card">
      <div class="table-container custom-scrollbar">
        <table class="clue-table">
          <thead>
            <tr>
              <th class="col-no">编号</th>
              <th>线索内容</th>
              <th class="col-center">风险</th>
              <th class="col-center">状态</th>
              <th>目标用户</th>
              <th class="col-time">发现时间</th>
              <th class="col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" v-for="i in 5" :key="i" class="row-loading">
              <td colspan="7"><div class="skeleton-bar"></div></td>
            </tr>
            <tr v-else-if="clues.length === 0">
              <td colspan="7" class="empty-state">暂无相关线索数据</td>
            </tr>
            <tr v-for="clue in clues" :key="clue.id" class="table-row group">
              <td>
                <span class="clue-no-badge">{{ clue.clue_no }}</span>
              </td>
              <td class="content-cell">
                <div class="cell-title">{{ clue.clue_title || '无标题' }}</div>
                <div class="cell-desc">{{ clue.clue_desc || '-' }}</div>
              </td>
              <td class="col-center">
                <span class="badge risk-badge" :class="getRiskConfig(clue.risk_level).type">
                  {{ getRiskConfig(clue.risk_level).label }}
                </span>
              </td>
              <td class="col-center">
                <span class="badge status-badge" :class="getStatusConfig(clue.status).type">
                  <component :is="getStatusConfig(clue.status).icon" class="badge-icon" />
                  {{ getStatusConfig(clue.status).label }}
                </span>
              </td>
              <td>
                <div class="user-info">
                  <User class="user-icon" /> {{ clue.target_user_id || '未知' }}
                </div>
              </td>
              <td class="time-cell">{{ formatDate(clue.create_time) }}</td>
              <td class="col-actions text-right">
                <div class="action-buttons">
                  <button @click="handleViewDetail(clue.id)" class="btn-icon-action" title="详情">
                    <Eye class="icon-btn" />
                  </button>
                  <button @click="handleDeleteClue(clue.id)" class="btn-icon-danger" title="删除">
                    <Trash2 class="icon-btn" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <footer class="table-footer">
        <div class="total-info">共 <span>{{ total }}</span> 条线索记录</div>
        <div class="pagination-controls">
          <button :disabled="page === 1" @click="page--; fetchClues()" class="btn-page">
            <ChevronLeft class="icon-btn" />
          </button>
          <span class="page-indicator">第 {{ page }} 页</span>
          <button :disabled="page * pageSize >= total" @click="page++; fetchClues()" class="btn-page">
            <ChevronRight class="icon-btn" />
          </button>
        </div>
      </footer>
    </div>

    <!-- Create Clue Modal -->
    <transition name="fade">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
        <div class="modal-window create-modal">
          <header class="modal-header">
            <h3 class="modal-title flex-align">
              <Plus class="text-amber-500 mr-2" /> 新增线索录入
            </h3>
            <button @click="showCreateModal = false" class="btn-close-icon"><X /></button>
          </header>
          
          <main class="modal-body custom-scrollbar">
            <div class="form-grid">
              <div class="form-item span-2">
                <label class="clue-label">线索标题</label>
                <input v-model="createForm.clue_title" type="text" placeholder="简要描述线索内容" class="form-input">
              </div>
              <div class="form-item">
                <label class="clue-label">目标用户 ID</label>
                <input v-model="createForm.target_user_id" type="text" placeholder="小红书用户 ID" class="form-input">
              </div>
              <div class="form-item">
                <label class="clue-label">风险等级</label>
                <CustomSelect v-model="createForm.risk_level" :options="riskLevelOptions.slice(1)" />
              </div>
              <div class="form-item">
                <label class="clue-label">来源渠道</label>
                <CustomSelect v-model="createForm.source_type" :options="sourceOptions" />
              </div>
              <div class="form-item span-2">
                <label class="clue-label">线索详细描述</label>
                <textarea v-model="createForm.clue_desc" rows="3" placeholder="详细线索背景..." class="form-input"></textarea>
              </div>
              <div class="form-item span-2">
                <label class="clue-label">可疑逻辑原因</label>
                <textarea v-model="createForm.suspicious_reason" rows="2" placeholder="为什么认为该内容可疑？" class="form-input"></textarea>
              </div>
            </div>
          </main>
          
          <footer class="modal-footer">
            <button @click="showCreateModal = false" class="btn-cancel">取消</button>
            <button @click="handleCreateClue" class="btn-submit" :disabled="createLoading">
              {{ createLoading ? '提交中...' : '确认录入' }}
            </button>
          </footer>
        </div>
      </div>
    </transition>

    <!-- Detail Modal -->
    <transition name="fade">
      <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
        <div class="modal-window detail-modal">
          <!-- Modal Header -->
          <header class="modal-header">
            <div class="header-left">
              <div class="modal-icon-box" :class="getRiskConfig(selectedClue?.risk_level || 0).type">
                <AlertTriangle />
              </div>
              <div class="modal-titles">
                <h3>{{ selectedClue?.clue_title || '线索详情' }}</h3>
                <span class="clue-no">{{ selectedClue?.clue_no }}</span>
              </div>
            </div>
            <button @click="showDetailModal = false" class="btn-close-icon"><X /></button>
          </header>

          <!-- Modal Body -->
          <main class="modal-body custom-scrollbar">
            <div v-if="detailLoading" class="modal-loading">
              <div class="spinner"></div>
              <p>加载证据链中...</p>
            </div>
            
            <div v-else-if="selectedClue" class="detail-grid">
              <div class="detail-main">
                <section class="detail-section">
                  <h4 class="section-label"><Eye class="icon-inline" /> 风险描述与证据摘要</h4>
                  <div class="text-content-box">
                    <div class="text-item">
                      <label>可疑原因:</label>
                      <p>{{ selectedClue.suspicious_reason || '未定义可疑逻辑' }}</p>
                    </div>
                    <div class="text-item border-top">
                      <label>描述:</label>
                      <p>{{ selectedClue.clue_desc || '暂无详细描述' }}</p>
                    </div>
                  </div>
                </section>

                <section class="detail-section">
                  <h4 class="section-label"><ExternalLink class="icon-inline" /> 关联证据 ({{ selectedClue.notes.length + selectedClue.comments.length }})</h4>
                  <div class="evidence-list">
                    <div v-for="note in selectedClue.notes" :key="note.note_id" class="evidence-item">
                      <div class="evidence-info">
                        <span class="type-tag tag-note">笔记</span>
                        <div class="id-info">
                          <span class="id-text">ID: {{ note.note_id }}</span>
                          <span class="rel-text">{{ note.relation_type }}</span>
                        </div>
                      </div>
                      <a :href="`https://www.xiaohongshu.com/explore/${note.note_id}`" target="_blank" class="btn-link">
                        <ExternalLink class="icon-btn" />
                      </a>
                    </div>

                    <div v-for="comment in selectedClue.comments" :key="comment.comment_id" class="evidence-item">
                      <div class="evidence-info">
                        <span class="type-tag tag-comment">评论</span>
                        <div class="id-info">
                          <span class="id-text">ID: {{ comment.comment_id }}</span>
                          <span class="rel-text">{{ comment.relation_type }}</span>
                        </div>
                      </div>
                      <span class="parent-note">笔记: {{ comment.note_id }}</span>
                    </div>
                  </div>
                </section>
              </div>

              <div class="detail-sidebar">
                <section class="sidebar-section">
                  <h4 class="section-label">属性</h4>
                  <div class="attribute-box">
                    <div class="attr-item">
                      <label>风险等级</label>
                      <span class="badge" :class="getRiskConfig(selectedClue.risk_level).type">
                        {{ getRiskConfig(selectedClue.risk_level).label }}
                      </span>
                    </div>
                    <div class="attr-item">
                      <label>来源渠道</label>
                      <span class="val">{{ selectedClue.source_type }}</span>
                    </div>
                  </div>
                </section>

                <section class="sidebar-section">
                  <h4 class="section-label">处置</h4>
                  <div class="status-action-box">
                    <div class="status-buttons">
                      <button 
                        v-for="s in [0, 1, 2, 3]" 
                        :key="s"
                        @click="handleUpdateStatus(selectedClue.id, s)"
                        class="btn-status"
                        :class="[selectedClue.status === s ? getStatusConfig(s).type : 'inactive']"
                      >
                        {{ getStatusConfig(s).label }}
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Container & Common */
.clue-view-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.5rem 2rem;
  overflow: hidden;
  gap: 1.5rem;
}

.flex-align { display: flex; align-items: center; }
.mr-2 { margin-right: 0.5rem; }

/* Header & Actions */
.view-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-shrink: 0;
}

.view-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.75rem;
  font-weight: 800;
  color: #ffffff;
}

.title-icon { color: #fbbf24; }
.view-subtitle { color: #64748b; font-size: 0.875rem; font-style: italic; }

.header-actions { display: flex; align-items: center; gap: 1rem; }
.filter-toolbar { display: flex; align-items: center; gap: 0.75rem; }

.search-input-wrapper { position: relative; width: 14rem; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); width: 1rem; height: 1rem; color: #64748b; }

.standard-input {
  width: 100%;
  background-color: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 0.5rem 1rem 0.5rem 2.25rem;
  font-size: 0.875rem;
  color: #ffffff;
  outline: none;
}

.select-wrapper { width: 8rem; }

.btn-filter, .btn-create {
  height: 2.375rem;
  border-radius: 0.75rem;
  padding: 0 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-filter { background: #334155; color: #f8fafc; }
.btn-filter:hover { background: #475569; }

.btn-create { background: #d97706; color: #fff; }
.btn-create:hover { background: #f59e0b; box-shadow: 0 0 15px rgba(245, 158, 11, 0.3); }

/* Table Section */
.data-card {
  flex: 1;
  background-color: var(--color-dark-glass);
  border: 1px solid var(--color-dark-border);
  border-radius: 1.5rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(12px);
}

.table-container { flex: 1; overflow: auto; }
.clue-table { width: 100%; border-collapse: collapse; text-align: left; }
.clue-table thead { position: sticky; top: 0; background: #0f172a; z-index: 10; }
.clue-table th { padding: 1rem 1.5rem; font-size: 0.75rem; color: #64748b; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); }
.clue-table td { padding: 1rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.02); vertical-align: middle; }

.clue-no-badge { font-family: monospace; font-size: 0.75rem; color: #fbbf24; background: rgba(251,191,36,0.1); padding: 0.2rem 0.5rem; border-radius: 0.4rem; }
.cell-title { font-size: 0.875rem; font-weight: 600; color: #fff; margin-bottom: 0.2rem; }
.cell-desc { font-size: 0.75rem; color: #64748b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 15rem; }

/* Badges */
.badge { padding: 0.1rem 0.6rem; border-radius: 1rem; font-size: 0.7rem; font-weight: 700; display: inline-flex; align-items: center; gap: 0.3rem; }
.badge-icon { width: 0.75rem; height: 0.75rem; }

.low { background: rgba(16,185,129,0.1); color: #10b981; }
.medium { background: rgba(245,158,11,0.1); color: #f59e0b; }
.high { background: rgba(249,115,22,0.1); color: #f97316; }
.severe { background: rgba(244,63,94,0.1); color: #f43f5e; }

.pending { background: rgba(59,130,246,0.1); color: #3b82f6; }
.processing { background: rgba(168,85,247,0.1); color: #a855f7; }
.handled { background: rgba(16,185,129,0.1); color: #10b981; }
.ignored { background: rgba(148,163,184,0.1); color: #94a3b8; }
.inactive { background: transparent; color: #475569; border: 1px solid rgba(255,255,255,0.05); }

/* Table Footer */
.table-footer { padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.2); }
.total-info { font-size: 0.75rem; color: #475569; }
.total-info span { color: #cbd5e1; font-weight: 700; }
.pagination-controls { display: flex; align-items: center; gap: 1rem; }
.btn-page { padding: 0.4rem; border-radius: 0.5rem; background: rgba(255,255,255,0.03); color: #64748b; border: none; cursor: pointer; }
.btn-page:hover:not(:disabled) { color: #fff; background: rgba(255,255,255,0.08); }
.page-indicator { font-size: 0.75rem; color: #cbd5e1; }

/* Modal Styles */
.modal-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
.modal-window { background: #0f111a; border: 1px solid rgba(255,255,255,0.1); border-radius: 2rem; width: 100%; display: flex; flex-direction: column; box-shadow: 0 40px 80px rgba(0,0,0,0.8); }
.create-modal { max-width: 40rem; }
.detail-modal { max-width: 60rem; max-height: 90vh; }

.modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between; }
.modal-title { font-size: 1.25rem; font-weight: 700; color: #fff; }
.btn-close-icon { background: none; border: none; color: #475569; cursor: pointer; }
.btn-close-icon:hover { color: #fff; }

.modal-body { padding: 2rem; overflow: auto; flex: 1; }

/* Form Grid */
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
.span-2 { grid-column: span 2; }
.form-item { display: flex; flex-direction: column; gap: 0.5rem; }
.clue-label { font-size: 0.75rem; font-weight: 700; color: #475569; text-transform: uppercase; }
.form-input { background: rgba(30,41,59,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.75rem; padding: 0.6rem 1rem; color: #fff; outline: none; }
.form-input:focus { border-color: #d97706; }

.modal-footer { padding: 1.5rem 2rem; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: flex-end; gap: 1rem; }
.btn-cancel { background: transparent; border: none; color: #64748b; font-weight: 600; cursor: pointer; }
.btn-submit { background: #d97706; border: none; color: #fff; padding: 0.6rem 2rem; border-radius: 0.75rem; font-weight: 700; cursor: pointer; }

/* Detail Specifics */
.detail-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
.section-label { font-size: 0.7rem; font-weight: 800; color: #475569; text-transform: uppercase; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
.icon-inline { width: 0.8rem; height: 0.8rem; }

.text-content-box { background: rgba(30,41,59,0.3); border-radius: 1.25rem; padding: 1.25rem; border: 1px solid rgba(255,255,255,0.05); }
.text-item label { font-size: 0.65rem; color: #475569; margin-bottom: 0.3rem; display: block; }
.text-item p { font-size: 0.85rem; color: #cbd5e1; line-height: 1.6; }
.border-top { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.05); }

.evidence-list { display: flex; flex-direction: column; gap: 0.75rem; }
.evidence-item { background: rgba(255,255,255,0.02); border-radius: 1rem; padding: 1rem; display: flex; align-items: center; justify-content: space-between; border: 1px solid rgba(255,255,255,0.03); }
.type-tag { font-size: 0.6rem; font-weight: 900; padding: 0.1rem 0.4rem; border-radius: 0.2rem; }
.id-text { font-size: 0.9rem; font-weight: 700; color: #fff; display: block; }
.rel-text { font-size: 0.65rem; color: #475569; }

.attribute-box, .status-action-box { background: rgba(30,41,59,0.3); border-radius: 1.25rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 1.25rem; }
.status-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.btn-status { padding: 0.5rem; border-radius: 0.6rem; font-size: 0.7rem; font-weight: 800; border: none; cursor: pointer; transition: all 0.2s; }

/* Utilities */
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

@keyframes spin { to { transform: rotate(360deg); } }
.spinner { width: 2rem; height: 2rem; border: 3px solid rgba(251,191,36,0.1); border-top-color: #fbbf24; border-radius: 50%; animation: spin 1s linear infinite; }
.modal-loading { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem 0; color: #64748b; font-style: italic; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
