<script setup lang="ts">
import { ref, computed } from 'vue';
import { Database, Search, User, Heart, MessageSquare, Calendar, Plus } from 'lucide-vue-next';
import { dataApi } from '../api';
import type { Note, Comment } from '../types';
import CustomSelect from './CustomSelect.vue';
import AddToClueModal from './AddToClueModal.vue';

const platform = ref('xhs');
const platformOptions = [
  { value: 'xhs', label: '小红书' },
  { value: 'dy', label: '抖音' },
  { value: 'bili', label: 'Bilibili' },
  { value: 'wb', label: '微博' },
];
const notes = ref<Note[]>([]);
const comments = ref<Comment[]>([]);
const activeNoteId = ref<string | null>(null);
const activeNoteTitle = ref('');
const searchQuery = ref('');
const loadingNotes = ref(false);
const loadingComments = ref(false);

const showAddToClue = ref(false);
const addToClueItemType = ref<'note' | 'comment'>('note');
const addToClueItemId = ref('');
const addToClueNoteId = ref('');
const addToClueInitialData = ref<any>({});

const openAddToClue = (type: 'note' | 'comment', item: any) => {
  addToClueItemType.value = type;
  if (type === 'note') {
    addToClueItemId.value = String(item.note_id || item.id || item.aweme_id || item.aid);
    addToClueNoteId.value = '';
    addToClueInitialData.value = {
      nickname: item.nickname || item.user?.nickname || item.author,
      user_id: item.user_id,
      source_keyword: item.source_keyword,
      content: item.title || item.desc || item.note_title
    };
  } else {
    addToClueItemId.value = String(item.comment_id || item.id || '');
    addToClueNoteId.value = activeNoteId.value || '';
    addToClueInitialData.value = {
      nickname: item.nickname || item.user_nickname || item.commenter,
      user_id: item.user_id,
      source_keyword: '',
      content: item.content || item.text || item.comment_content
    };
  }
  showAddToClue.value = true;
};

const filteredNotes = computed(() => {
  if (!searchQuery.value) return notes.value;
  const q = searchQuery.value.toLowerCase();
  return notes.value.filter(n => {
    const title = (n.title || n.desc || n.note_title || '').toLowerCase();
    const desc = (n.desc || n.note_desc || n.content || '').toLowerCase();
    return title.includes(q) || desc.includes(q);
  });
});

const loadNotes = async () => {
  loadingNotes.value = true;
  try {
    const res = await dataApi.getNotes(platform.value);
    const { data, error } = res.data;
    if (error) {
      alert(`读取数据库失败: ${error}`);
    } else {
      notes.value = data || [];
      comments.value = [];
      activeNoteId.value = null;
    }
  } catch (err: any) {} finally {
    loadingNotes.value = false;
  }
};

const selectNote = async (note: Note) => {
  const id = note.note_id || note.id || note.aweme_id || note.aid || '';
  const title = note.title || note.desc || note.note_title || '(无标题)';
  
  activeNoteId.value = String(id);
  activeNoteTitle.value = title;
  loadingComments.value = true;
  
  try {
    const res = await dataApi.getComments(platform.value, String(id));
    comments.value = res.data.data || [];
  } catch (err: any) {
    console.error('Fetch comments error:', err);
  } finally {
    loadingComments.value = false;
  }
};

const formatTime = (time: any) => {
  if (!time) return '';
  const date = new Date(typeof time === 'number' && time < 9999999999 ? time * 1000 : time);
  return date.toLocaleDateString();
};

const formatDateTime = (time: any) => {
  if (!time) return '';
  const date = new Date(typeof time === 'number' && time < 9999999999 ? time * 1000 : time);
  return date.toLocaleString();
};

const openNoteDetail = (note: Note) => {
  // 优先使用数据库中的 note_url 字段
  if (note.note_url) {
    window.open(note.note_url, '_blank');
    return;
  }

  let url = '';
  const id = note.note_id || note.aweme_id || note.id || note.aid;
  if (!id) return;

  switch (platform.value) {
    case 'xhs':
      url = `https://www.xiaohongshu.com/explore/${id}`;
      break;
    case 'dy':
      url = `https://www.douyin.com/video/${id}`;
      break;
    case 'bili':
      url = `https://www.bilibili.com/video/${id}`;
      break;
    case 'wb':
      url = `https://weibo.com/detail/${id}`;
      break;
  }

  if (url) {
    window.open(url, '_blank');
  }
};
</script>

<template>
  <div class="viewer-container">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="platform-select-wrapper">
        <CustomSelect v-model="platform" :options="platformOptions" />
      </div>
      <button 
        @click="loadNotes"
        :disabled="loadingNotes"
        class="btn-load"
      >
        <Database class="w-4 h-4" />
        从数据库加载
      </button>
      <div class="search-wrapper">
        <Search class="search-icon" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="搜索标题/内容..." 
          class="search-input" 
        />
      </div>
    </div>

    <!-- Viewer Body -->
    <div class="viewer-body">
      <!-- Note List -->
      <div class="note-list">
        <div v-if="notes.length === 0" class="empty-hint">
          {{ loadingNotes ? '⏳ 正在加载中...' : '请选择平台并点击"从数据库加载"' }}
        </div>
        <template v-else>
          <div class="count-label">共 {{ filteredNotes.length }} 条帖子</div>
          <div 
            v-for="note in filteredNotes" 
            :key="note.note_id || note.id"
            @click="selectNote(note)"
            :class="[
              'note-card',
              activeNoteId === String(note.note_id || note.id || note.aweme_id || note.aid) ? 'active' : ''
            ]"
          >
            <div 
              class="note-title" 
              :title="note.title || note.desc"
              @click.stop="openNoteDetail(note)"
            >
              {{ note.title || note.desc || note.note_title || '(无标题)' }}
            </div>
            <div class="note-meta">
              <span class="meta-item"><User class="w-3 h-3" /> {{ note.nickname || note.user?.nickname || note.author || '未知' }}</span>
              <span class="meta-item likes"><Heart class="w-3 h-3" /> {{ note.liked_count || note.like_count || note.digg_count || 0 }}</span>
              <span class="meta-item comments"><MessageSquare class="w-3 h-3" /> {{ note.comment_count || note.comments_count || 0 }}</span>
              <span v-if="note.time || note.create_time" class="meta-item"><Calendar class="w-3 h-3" /> {{ formatTime(note.time || note.create_time) }}</span>
              <button class="add-to-lead-btn" @click.stop="openAddToClue('note', note)" title="添加至线索">
                <Plus class="w-3 h-3" /> 线索
              </button>
            </div>
            <div v-if="(note.desc || note.content) && (note.desc || note.content) !== note.title" class="note-desc">
              {{ (note.desc || note.content || '').replace(/<[^>]*>/g, '') }}
            </div>
          </div>
        </template>
      </div>

      <!-- Comment Panel -->
      <div class="comment-panel">
        <div v-if="!activeNoteId" class="empty-hint">
          👈 点击左侧帖子查看评论
        </div>
        <div v-else class="comment-wrapper">
          <div class="comment-header" :title="activeNoteTitle">
            💬 "{{ activeNoteTitle }}" 的评论
          </div>
          
          <div class="comment-list">
            <div v-if="loadingComments" class="loading-status">
              ⏳ 正在加载评论...
            </div>
            <div v-else-if="comments.length === 0" class="empty-hint">
              该帖子暂无评论数据
            </div>
            <div 
              v-for="(comment, idx) in comments" 
              :key="idx"
              class="comment-item"
            >
              <div class="comment-author">
                <User class="w-3 h-3" /> {{ comment.nickname || comment.user_nickname || comment.commenter || '匿名用户' }}
              </div>
              <div class="comment-content">
                {{ (comment.content || comment.text || comment.comment_content || '').replace(/<[^>]*>/g, '') }}
              </div>
              <div class="comment-footer">
                <span class="footer-item likes"><Heart class="w-2.5 h-2.5" /> {{ comment.like_count || comment.digg_count || comment.liked_count || 0 }}</span>
                <span v-if="comment.create_time || comment.time" class="footer-item"><Calendar class="w-2.5 h-2.5" /> {{ formatDateTime(comment.create_time || comment.time) }}</span>
                <button class="add-to-lead-btn mini" @click.stop="openAddToClue('comment', comment)" title="添加至线索">
                  <Plus class="w-2.5 h-2.5" /> 线索
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add to Clue Modal -->
    <AddToClueModal 
      v-model:show="showAddToClue" 
      :item-type="addToClueItemType"
      :item-id="addToClueItemId"
      :note-id="addToClueNoteId"
      :initial-data="addToClueInitialData"
    />
  </div>
</template>

<style scoped>
.viewer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.platform-select-wrapper {
  width: 8rem;
}

.btn-load {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--accent);
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-load:hover {
  background-color: var(--accent-hover);
}

.btn-load:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-wrapper {
  position: relative;
  flex: 1 1 0%;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #94a3b8;
}

.search-input {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  font-size: 0.875rem;
  color: #ffffff;
  outline: none;
  transition: all 0.2s;
}

.search-input:focus {
  border-color: var(--accent);
}

.viewer-body {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex: 1 1 0%;
  min-height: 0;
  overflow: hidden;
}

.note-list {
  width: 50%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 0.75rem;
  overflow-y: auto;
}

.empty-hint {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 0.875rem;
  font-style: italic;
}

.count-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.5rem;
  padding: 0 0.25rem;
}

.note-card {
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s;
}

.note-card:hover {
  border-color: rgba(109, 40, 217, 0.5);
  background-color: rgba(255, 255, 255, 0.1);
}

.note-card.active {
  background-color: rgba(109, 40, 217, 0.2);
  border-color: var(--accent);
  box-shadow: 0 10px 15px -3px rgba(109, 40, 217, 0.1);
}

.note-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: color 0.2s;
}

.note-title:hover {
  color: var(--accent);
  text-decoration: underline;
}

.note-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 11px;
  color: #94a3b8;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.meta-item.likes {
  color: #fb7185;
}

.meta-item.comments {
  color: #38bdf8;
}

.note-desc {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #94a3b8;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.625;
}

.comment-panel {
  width: 50%;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 0.75rem;
  overflow: hidden;
}

.comment-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.comment-header {
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.comment-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-right: 0.5rem;
}

.loading-status {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 0.875rem;
}

.comment-item {
  background-color: rgba(255, 255, 255, 0.05);
  border-left: 4px solid var(--accent);
  border-top-right-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.comment-author {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent-hover);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.comment-content {
  font-size: 0.875rem;
  color: #e2e8f0;
  line-height: 1.625;
}

.comment-footer {
  display: flex;
  gap: 1rem;
  font-size: 10px;
  color: #64748b;
  padding-top: 0.25rem;
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.footer-item.likes {
  color: rgba(244, 63, 94, 0.8);
}

.add-to-lead-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background-color: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #60a5fa;
  padding: 0.125rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-to-lead-btn:hover {
  background-color: #3b82f6;
  color: #ffffff;
  border-color: #3b82f6;
}

.add-to-lead-btn.mini {
  padding: 0.1rem 0.375rem;
  font-size: 9px;
}
</style>
