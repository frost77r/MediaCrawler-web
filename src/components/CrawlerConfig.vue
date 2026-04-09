<script setup lang="ts">
import { ref } from 'vue';
import { Play, Square, Settings2, Sliders, Globe, Database, Settings } from 'lucide-vue-next';
import type { CrawlerStartRequest } from '../types';
import CustomSelect from './CustomSelect.vue';

const props = defineProps<{
  isRunning: boolean;
  isStopping: boolean;
}>();

const emit = defineEmits(['start', 'stop']);

// Options for selects
const platformOptions = [
  { value: 'xhs', label: '小红书' },
  { value: 'dy', label: '抖音' },
  { value: 'ks', label: '快手' },
  { value: 'bili', label: 'Bilibili' },
  { value: 'wb', label: '微博' },
  { value: 'tieba', label: '百度贴吧' },
  { value: 'zhihu', label: '知乎' },
];

const crawlerTypeOptions = [
  { value: 'search', label: '关键词搜索' },
  { value: 'detail', label: '指定帖子/视频' },
  { value: 'creator', label: '创作者主页' },
];

const sortTypeOptions = [
  { value: 'general', label: '综合排序' },
  { value: 'time_descending', label: '最新发布' },
  { value: 'popularity_descending', label: '最多点赞(最热)' },
];

const loginTypeOptions = [
  { value: 'qrcode', label: '扫码登录' },
  { value: 'phone', label: '手机号登录' },
  { value: 'cookie', label: 'Cookie登录' },
];

const saveOptionOptions = [
  { value: 'jsonl', label: 'JSONL' },
  { value: 'json', label: 'JSON' },
  { value: 'csv', label: 'CSV' },
  { value: 'excel', label: 'Excel' },
  { value: 'db', label: 'MySQL' },
  { value: 'sqlite', label: 'SQLite' },
];

const form = ref<CrawlerStartRequest>({
  platform: 'xhs',
  crawler_type: 'search',
  keywords: '大狗',
  sort_type: 'general',
  specified_ids: '',
  creator_ids: '',
  login_type: 'qrcode',
  save_option: 'db',
  
  // New toggles and configurations
  cdp: true,
  cdp_headless: false,
  headless: false,
  start_page: 1,
  max_notes: 15,
  concurrency: 1,
  enable_media: false,
  enable_comments: true,
  enable_sub_comments: false,
  max_comments: 100,
  wordcloud: false
});

const startCrawler = () => {
  emit('start', form.value);
};

const stopCrawler = () => {
  emit('stop');
};
</script>

<template>
  <div class="config-container">
    <div class="config-header">
      <Settings2 class="header-icon" />
      <h2 class="config-title">爬虫配置参数</h2>
    </div>

    <div class="form-wrapper">
      
      <!-- 基础设置 -->
      <section class="config-section">
        <div class="section-title">
          <Globe class="section-icon" /> 基础设置
        </div>
        <div class="section-grid">
          <div class="form-group">
            <label class="form-label">平台</label>
            <CustomSelect v-model="form.platform" :options="platformOptions" />
          </div>
          
          <div class="form-group">
            <label class="form-label">抓取模式</label>
            <CustomSelect v-model="form.crawler_type" :options="crawlerTypeOptions" />
          </div>
        </div>

        <div v-if="form.crawler_type === 'search'" class="form-group mb-2">
          <label class="form-label">搜索关键词</label>
          <input v-model="form.keywords" type="text" placeholder="例如: 手机,汽车" class="form-input" />
        </div>
        
        <div v-if="form.crawler_type === 'search'" class="form-group mb-2">
          <label class="form-label">排序方式</label>
          <CustomSelect v-model="form.sort_type" :options="sortTypeOptions" />
        </div>

        <div v-if="form.crawler_type === 'detail'" class="form-group mb-2">
          <label class="form-label">指定记录ID (逗号分隔)</label>
          <input v-model="form.specified_ids" type="text" placeholder="帖子链接或ID" class="form-input" />
        </div>

        <div v-if="form.crawler_type === 'creator'" class="form-group mb-2">
          <label class="form-label">创作者ID (逗号分隔)</label>
          <input v-model="form.creator_ids" type="text" placeholder="创作者主页链接或ID" class="form-input" />
        </div>
      </section>

      <!-- 抓取控制 -->
      <section class="config-section">
        <div class="section-title">
          <Sliders class="section-icon" /> 抓取控制
        </div>
        <div class="section-grid">
          <div class="form-group">
            <label class="form-label">起始页数</label>
            <input v-model="form.start_page" type="number" min="1" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">抓取数量</label>
            <input v-model="form.max_notes" type="number" min="1" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">并发数量</label>
            <input v-model="form.concurrency" type="number" min="1" max="10" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">最大评论数</label>
            <input v-model="form.max_comments" type="number" class="form-input" />
          </div>
        </div>
      </section>

      <!-- 存储与登录 -->
      <section class="config-section">
        <div class="section-title">
          <Database class="section-icon" /> 存储与登录
        </div>
        <div class="section-grid">
          <div class="form-group">
            <label class="form-label">登录方式</label>
            <CustomSelect v-model="form.login_type" :options="loginTypeOptions" />
          </div>
          <div class="form-group">
            <label class="form-label">存储方式</label>
            <CustomSelect v-model="form.save_option" :options="saveOptionOptions" />
          </div>
        </div>
      </section>

      <!-- 功能开关 -->
      <section class="config-section">
        <div class="section-title">
          <Settings class="section-icon" /> 功能开关
        </div>
        <div class="toggle-grid">
          <label class="toggle-control">
            <input type="checkbox" v-model="form.cdp" class="toggle-input">
            <span class="toggle-text">开启 CDP 模式</span>
          </label>
          <label class="toggle-control" v-if="form.cdp">
            <input type="checkbox" v-model="form.cdp_headless" class="toggle-input">
            <span class="toggle-text">CDP 无头模式</span>
          </label>
          <label class="toggle-control" v-else>
            <input type="checkbox" v-model="form.headless" class="toggle-input">
            <span class="toggle-text">基础无头模式</span>
          </label>
          <label class="toggle-control">
            <input type="checkbox" v-model="form.enable_media" class="toggle-input">
            <span class="toggle-text">抓取媒体文件</span>
          </label>
          <label class="toggle-control">
            <input type="checkbox" v-model="form.enable_comments" class="toggle-input">
            <span class="toggle-text">抓取评论</span>
          </label>
          <label class="toggle-control" v-if="form.enable_comments">
            <input type="checkbox" v-model="form.enable_sub_comments" class="toggle-input">
            <span class="toggle-text">抓取子评论</span>
          </label>
          <label class="toggle-control">
            <input type="checkbox" v-model="form.wordcloud" class="toggle-input">
            <span class="toggle-text">生成词云</span>
          </label>
        </div>
      </section>
      
    </div>

    <!-- 底部操作按钮 -->
    <div class="action-footer">
      <button 
        @click="startCrawler"
        :disabled="isRunning || isStopping"
        class="btn-primary"
      >
        <Play class="w-4 h-4 btn-icon" />
        开始运行
      </button>
      <button 
        @click="stopCrawler"
        :disabled="!isRunning || isStopping"
        class="btn-danger"
      >
        <Square class="w-4 h-4 btn-icon" />
        终止重置
      </button>
    </div>
  </div>
</template>

<style scoped>
.config-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #fff;
}

.config-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 1rem;
}

.header-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--accent);
}

.config-title {
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: 0.025em;
}

.form-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  padding-right: 0.75rem;
  flex: 1 1 0%;
}

.form-wrapper::-webkit-scrollbar {
  width: 6px;
}
.form-wrapper::-webkit-scrollbar-track {
  background: transparent;
}
.form-wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 99px;
}
.form-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background-color: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1.25rem;
  border-radius: 1rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #cbd5e1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.section-icon {
  width: 1rem;
  height: 1rem;
  color: #94a3b8;
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #94a3b8;
}

.form-input {
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.375rem;
  padding: 0.5rem 0.625rem;
  font-size: 0.875rem;
  color: #ffffff;
  outline: none;
  transition: all 0.2s ease;
  width: 100%;
}

.form-input:focus {
  border-color: #8b5cf6;
  background-color: rgba(139, 92, 246, 0.05);
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.15);
}

.toggle-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.625rem;
}

.toggle-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.03);
  padding: 0.5rem 0.625rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255,255,255,0.05);
  transition: all 0.2s;
}

.toggle-control:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.toggle-input {
  appearance: none;
  width: 1.125rem;
  height: 1.125rem;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 0.25rem;
  background-color: rgba(0,0,0,0.3);
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.toggle-input:checked {
  background-color: #8b5cf6;
  border-color: #8b5cf6;
}

.toggle-input:checked::after {
  content: '';
  position: absolute;
  left: 30%;
  top: 15%;
  width: 0.25rem;
  height: 0.5rem;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.toggle-text {
  font-size: 0.8125rem;
  color: #e2e8f0;
}

.action-footer {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.btn-primary, .btn-danger {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}

.btn-icon {
  transition: transform 0.2s;
}

.btn-primary {
  background-image: linear-gradient(to right, #8b5cf6, #6d28d9);
  color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.2);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.3);
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-primary:disabled {
  background-image: none;
  background-color: #334155;
  color: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
}

.btn-primary:hover:not(:disabled) .btn-icon {
  transform: translateX(2px);
}

.btn-danger {
  background-color: transparent;
  color: #f43f5e;
  border: 1px solid rgba(244, 63, 94, 0.3);
}

.btn-danger:hover:not(:disabled) {
  background-color: rgba(244, 63, 94, 0.1);
  border-color: #f43f5e;
}

.btn-danger:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-danger:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .section-grid {
    grid-template-columns: 1fr;
  }
}
</style>
