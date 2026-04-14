<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Activity, CheckCircle2, AlertCircle, Loader2, Zap, Cpu, Server, ServerCrash, Settings, MonitorPlay, History } from 'lucide-vue-next';
import CrawlerConfig from '../components/CrawlerConfig.vue';
import LogViewer from '../components/LogViewer.vue';
import { crawlerApi } from '../api';

const crawlerStatus = ref('idle');
const isRunning = ref(false);
const isStopping = ref(false);

const elapsedSeconds = ref(0);
let statusPollInterval: any = null;
let timerInterval: any = null;

const isFinished = ref(false);
const activeTab = ref('config');

const checkStatus = async () => {
  try {
    const data = await crawlerApi.getStatus() as any;
    const oldRunning = isRunning.value;
    crawlerStatus.value = data.status;
    isRunning.value = data.status === 'running';
    isStopping.value = data.status === 'stopping';
    
    if (oldRunning && crawlerStatus.value === 'idle') {
      isFinished.value = true;
    }

    if (isRunning.value && !timerInterval) {
      startTimer();
      isFinished.value = false;
    } else if (!isRunning.value && timerInterval) {
      stopTimer();
    }
  } catch (err) {
    console.error('Check status error:', err);
    crawlerStatus.value = 'error';
    isRunning.value = false;
    isStopping.value = false;
    stopTimer();
  }
};

const startPolling = () => {
  if (!statusPollInterval) {
    statusPollInterval = setInterval(checkStatus, 1000);
  }
};

const startTimer = () => {
  stopTimer();
  timerInterval = setInterval(() => {
    elapsedSeconds.value++;
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
};

const formattedTime = computed(() => {
  const h = Math.floor(elapsedSeconds.value / 3600).toString().padStart(2, '0');
  const m = Math.floor((elapsedSeconds.value % 3600) / 60).toString().padStart(2, '0');
  const s = (elapsedSeconds.value % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
});

onMounted(() => {
  checkStatus();
  startPolling();
});

onUnmounted(() => {
  if (statusPollInterval) clearInterval(statusPollInterval);
  stopTimer();
});

const handleStart = async (config: any) => {
  try {
    const res = await crawlerApi.start(config) as any;
    if (res.status === 'ok') {
      elapsedSeconds.value = 0;
      isRunning.value = true;
      crawlerStatus.value = 'running';
      isFinished.value = false;
      activeTab.value = 'monitor';
      startTimer();
    }
  } catch (err) {
    console.error('Start crawler error:', err);
    crawlerStatus.value = 'error';
  }
};

const handleStop = async () => {
  try {
    const res = await crawlerApi.stop() as any;
    if (res.status === 'ok') {
      isStopping.value = true;
      crawlerStatus.value = 'stopping';
    }
  } catch (err) {
    console.error('Stop crawler error:', err);
  }
};

const mockHistory = [
  { id: 'TSK-1024', platform: 'xhs', type: 'search', keyword: '大狗', time: '2024-05-14 10:20:00', status: '成功', duration: '00:05:21', count: 15 },
  { id: 'TSK-1023', platform: 'dy', type: 'detail', keyword: '-', time: '2024-05-13 15:40:12', status: '成功', duration: '00:02:10', count: 1 },
  { id: 'TSK-1022', platform: 'wb', type: 'search', keyword: '汽车', time: '2024-05-13 09:12:00', status: '失败', duration: '00:00:45', count: 0 },
];
</script>

<template>
  <div class="dispatch-container">
    <div class="dispatch-layout">
      <!-- Top Tabs -->
      <nav class="dispatch-tabs">
        <div class="tabs-group">
          <button 
            @click="activeTab = 'config'" 
            :class="['tab-btn', { active: activeTab === 'config' }]"
          >
            <Settings class="w-4 h-4" />
            <span>任务配置</span>
          </button>
          <button 
            @click="activeTab = 'monitor'" 
            :class="['tab-btn', { active: activeTab === 'monitor' }]"
          >
            <MonitorPlay class="w-4 h-4" />
            <span>运行监控</span>
          </button>
          <button 
            @click="activeTab = 'history'" 
            :class="['tab-btn', { active: activeTab === 'history' }]"
          >
            <History class="w-4 h-4" />
            <span>调度历史</span>
          </button>
        </div>

        <!-- Status Badge moved to the right of the tabs -->
        <div 
          :class="[
            'status-badge',
            crawlerStatus === 'running' ? 'status-running' :
            crawlerStatus === 'stopping' ? 'status-stopping' :
            crawlerStatus === 'error' ? 'status-error' : 'status-idle'
          ]"
        >
          <div v-if="crawlerStatus === 'running'" class="running-indicator">
            <span class="ping-dot"></span>
            <span class="solid-dot"></span>
          </div>
          <Loader2 v-else-if="crawlerStatus === 'stopping'" class="w-4 h-4 animate-spin" />
          <ServerCrash v-else-if="crawlerStatus === 'error'" class="w-4 h-4" />
          <Server v-else class="w-4 h-4 opacity-60" />
          
          <span class="status-text font-bold">
            {{ 
              crawlerStatus === 'running' ? '系统采集中' : 
              crawlerStatus === 'stopping' ? '正在中止任务' : 
              crawlerStatus === 'error' ? '实例出错离线' : 
              '系统待命空闲' 
            }}
          </span>
        </div>
      </nav>

      <!-- Main Content Area -->
      <main class="dispatch-main glass-card">
        
        <!-- Tab 1: Config -->
        <div v-show="activeTab === 'config'" class="tab-content config-tab">
          <CrawlerConfig 
            :is-running="isRunning" 
            :is-stopping="isStopping"
            @start="handleStart"
            @stop="handleStop"
          />
        </div>

        <!-- Tab 2: Monitor -->
        <div v-show="activeTab === 'monitor'" class="tab-content monitor-tab">
          <div class="status-panel-inner">
            <div class="progress-header">
              <h4 class="progress-title">
                <Zap class="w-5 h-5 text-blue-400" v-if="isRunning" />
                <Cpu class="w-5 h-5 text-slate-400" v-else />
                实时运行进度
              </h4>
              <div class="time-elapsed text-sm" v-if="isRunning || elapsedSeconds > 0">
                已运行: <span>{{ formattedTime }}</span>
              </div>
            </div>

            <div class="progress-visualizer">
              <div v-if="isRunning" class="active-progress-view">
                <div class="server-rack">
                  <div class="rack-unit active">
                    <div class="blinking-light"></div>
                    <span>Data Node 01</span>
                  </div>
                  <div class="rack-unit active delay-1">
                    <div class="blinking-light"></div>
                    <span>Processing Core</span>
                  </div>
                  <div class="rack-unit active delay-2">
                    <div class="blinking-light"></div>
                    <span>DB Sync</span>
                  </div>
                </div>
                
                <div class="progress-bar-container">
                  <div class="progress-bar-track">
                    <div class="progress-bar-fill fill-running"></div>
                  </div>
                  <div class="progress-info">
                    <span class="text-blue-400 text-sm font-semibold tracking-wider">采集数据中...</span>
                    <span class="text-slate-400 text-xs text-uppercase mt-1">处理队列正在更新</span>
                  </div>
                </div>
              </div>

              <div v-else class="idle-progress-view">
                <div class="idle-icon-wrapper">
                  <CheckCircle2 v-if="crawlerStatus === 'idle'" class="w-12 h-12 text-slate-400" />
                  <Loader2 v-else-if="crawlerStatus === 'stopping'" class="w-12 h-12 text-amber-500 animate-spin" />
                  <AlertCircle v-else class="w-12 h-12 text-rose-500" />
                </div>
                <h3 class="idle-title">
                  {{ isFinished ? '运行完成' : (crawlerStatus === 'idle' ? '任务就绪' : 
                     crawlerStatus === 'stopping' ? '停止中...' : '实例异常') }}
                </h3>
                <p class="idle-desc">
                  {{ isFinished ? '所有抓取任务已成功处理并存入数据库。' : (crawlerStatus === 'idle' ? '配置参数并点击开始运行以启动采集引擎。' : 
                     crawlerStatus === 'stopping' ? '正在安全关闭所有任务连接...' : '请检查后端服务是否正常运行。') }}
                </p>
                
                <div class="progress-bar-container mt-6" v-if="crawlerStatus === 'idle' || isFinished">
                  <div class="progress-bar-track">
                    <div :class="['progress-bar-fill', isFinished ? 'fill-success' : 'fill-idle']"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- System Logs -->
            <div class="log-section">
              <div class="log-header">
                <span class="log-title"><Activity class="w-4 h-4"/> 终端日志</span>
              </div>
              <div class="log-wrapper">
                <LogViewer :is-running="isRunning" />
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 3: History -->
        <div v-show="activeTab === 'history'" class="tab-content history-tab">
          <div class="history-header">
            <h3 class="text-lg font-bold text-white">历史调度记录</h3>
            <p class="text-sm text-slate-400 mt-1">查看过往任务的运行结果与统计</p>
          </div>
          
          <div class="history-table-wrapper">
            <table class="history-table">
              <thead>
                <tr>
                  <th>任务ID</th>
                  <th>平台</th>
                  <th>类型</th>
                  <th>关键词/ID</th>
                  <th>开始时间</th>
                  <th>耗时</th>
                  <th>采集数量</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in mockHistory" :key="item.id">
                  <td class="mono-text">{{ item.id }}</td>
                  <td>{{ item.platform.toUpperCase() }}</td>
                  <td>{{ item.type === 'search' ? '关键词搜索' : '指定记录' }}</td>
                  <td>{{ item.keyword }}</td>
                  <td class="time-text">{{ item.time }}</td>
                  <td class="mono-text">{{ item.duration }}</td>
                  <td class="mono-text">{{ item.count }}</td>
                  <td>
                    <span :class="['status-pill', item.status === '成功' ? 'success' : 'error']">
                      {{ item.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<style scoped>
.dispatch-container {
  padding: 1.5rem 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
}

.status-running {
  background-color: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.1);
}

.status-stopping {
  background-color: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.status-error {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.status-idle {
  background-color: rgba(100, 116, 139, 0.1);
  border-color: rgba(100, 116, 139, 0.2);
  color: #94a3b8;
}

.running-indicator {
  position: relative;
  display: flex;
  height: 0.75rem;
  width: 0.75rem;
}

.ping-dot {
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
  position: absolute;
  height: 100%;
  width: 100%;
  border-radius: 9999px;
  background-color: #60a5fa;
  opacity: 0.75;
}

.solid-dot {
  position: relative;
  border-radius: 9999px;
  height: 0.75rem;
  width: 0.75rem;
  background-color: #3b82f6;
}

.dispatch-layout {
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 0;
}

.dispatch-tabs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  background: var(--glass-bg);
  padding: 0.5rem 1rem;
  border: 1px solid var(--glass-border);
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.tabs-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.tab-btn.active {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.status-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border-width: 1px;
  border-style: solid;
  font-size: 0.8125rem;
  transition: all 0.3s;
  margin-bottom: 0;
}

.dispatch-main {
  flex: 1 1 0%;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.glass-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
}

.tab-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.config-tab {
  padding: 1.5rem;
  overflow-y: auto;
}

.monitor-tab {
  padding: 1.5rem;
  overflow: hidden;
}

.status-panel-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1.5rem;
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--glass-border);
  flex-shrink: 0;
}

.progress-title {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.time-elapsed {
  color: var(--text-muted);
  font-family: monospace;
  font-size: 0.875rem;
}

.time-elapsed span {
  color: #e2e8f0;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.progress-visualizer {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.active-progress-view, .idle-progress-view {
  width: 100%;
  max-width: 32rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Server Rack Animation */
.server-rack {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-bottom: 2.5rem;
  width: 100%;
  justify-content: center;
}

.rack-unit {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(51, 65, 85, 0.8);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-muted);
  font-family: monospace;
  font-size: 0.75rem;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}

.blinking-light {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #334155;
}

.rack-unit.active .blinking-light {
  background: #3b82f6;
  box-shadow: 0 0 8px #3b82f6;
  animation: blink 1s infinite alternate;
}

.rack-unit.delay-1 .blinking-light { animation-delay: 0.33s; }
.rack-unit.delay-2 .blinking-light { animation-delay: 0.66s; }

@keyframes blink {
  0% { opacity: 0.3; }
  100% { opacity: 1; }
}

.idle-icon-wrapper {
  background: rgba(0,0,0,0.2);
  padding: 1.25rem;
  border-radius: 50%;
  margin-bottom: 1rem;
  border: 1px solid var(--glass-border);
}

.idle-title {
  color: #f8fafc;
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.idle-desc {
  color: var(--text-muted);
  text-align: center;
  max-width: 24rem;
  line-height: 1.5;
  font-size: 0.8125rem;
}

.progress-bar-container { width: 100%; }
.progress-bar-track {
  width: 100%; height: 0.375rem; background: rgba(0,0,0,0.4);
  border-radius: 999px; overflow: hidden;
}
.progress-bar-fill { height: 100%; border-radius: 999px; transition: all 0.8s; }
.fill-idle { width: 100%; background-color: #334155; opacity: 0.3; }
.fill-running {
  width: 100%; background: linear-gradient(90deg, #1d4ed8, #3b82f6, #1d4ed8);
  background-size: 200% 100%; animation: gradientMove 2s linear infinite;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}
.fill-success { width: 100%; background: #10b981; }

.progress-info {
  display: flex; flex-direction: column; align-items: center; margin-top: 0.75rem;
}
.text-uppercase { text-transform: uppercase; }

@keyframes ping {
  75%, 100% { transform: scale(2); opacity: 0; }
}
@keyframes gradientMove {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

.log-section {
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid var(--glass-border);
  border-radius: 0.75rem;
  overflow: hidden;
}

.log-header {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--glass-border);
}

.log-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-muted);
}

.log-wrapper {
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  /* LogViewer handles its own background and padding */
}

/* History Tab */
.history-tab {
  padding: 1.5rem;
}

.history-header {
  margin-bottom: 1.5rem;
}

.history-table-wrapper {
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--glass-border);
  border-radius: 0.75rem;
  overflow-y: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.history-table th {
  position: sticky;
  top: 0;
  background: rgba(15, 23, 42, 0.95);
  padding: 0.875rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  border-bottom: 1px solid var(--glass-border);
}

.history-table td {
  padding: 0.875rem 1rem;
  font-size: 0.875rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.mono-text { font-family: monospace; color: var(--text-muted); }
.time-text { font-size: 0.8125rem; color: var(--text-muted); }

.status-pill {
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}
.status-pill.success { background: rgba(16, 185, 129, 0.1); color: #34d399; }
.status-pill.error { background: rgba(244, 63, 94, 0.1); color: #fb7185; }

.history-table-wrapper::-webkit-scrollbar { width: 6px; }
.history-table-wrapper::-webkit-scrollbar-track { background: transparent; }
.history-table-wrapper::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
</style>
