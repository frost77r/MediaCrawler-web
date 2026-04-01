<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Activity, CheckCircle2, AlertCircle, Loader2, PlayCircle, Zap, Cpu, Server, ServerCrash } from 'lucide-vue-next';
import CrawlerConfig from '../components/CrawlerConfig.vue';
import { crawlerApi } from '../api';

const crawlerStatus = ref('idle');
const isRunning = ref(false);
const isStopping = ref(false);

const elapsedSeconds = ref(0);
let statusPollInterval: any = null;
let timerInterval: any = null;

const isFinished = ref(false);

const checkStatus = async () => {
  try {
    const data = await crawlerApi.getStatus() as any;
    const oldRunning = isRunning.value;
    crawlerStatus.value = data.status;
    isRunning.value = data.status === 'running';
    isStopping.value = data.status === 'stopping';
    
    // If it was running and now it's idle, mark as finished
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

// Return formatted time "HH:MM:SS"
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

const handleStart = () => {
  elapsedSeconds.value = 0;
  isRunning.value = true;
  crawlerStatus.value = 'running';
  isFinished.value = false;
  startTimer();
};

const handleStop = () => {
  isStopping.value = true;
  crawlerStatus.value = 'stopping';
};
</script>

<template>
  <div class="dispatch-container">
    <!-- Header with Status -->
    <header class="dispatch-header">
      <div class="header-info">
        <div class="title-wrapper">
          <Activity class="title-icon" />
          <h3 class="header-title">调度中心</h3>
        </div>
        <p class="header-desc">控制并监控媒体爬虫实例的运行生命周期</p>
      </div>

      <!-- Status Badge -->
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
        <Loader2 v-else-if="crawlerStatus === 'stopping'" class="w-5 h-5 animate-spin" />
        <ServerCrash v-else-if="crawlerStatus === 'error'" class="w-5 h-5" />
        <Server v-else class="w-5 h-5 opacity-60" />
        
        <span class="status-text font-bold">
          {{ 
            crawlerStatus === 'running' ? '系统采集中' : 
            crawlerStatus === 'stopping' ? '正在中止任务' : 
            crawlerStatus === 'error' ? '实例出错离线' : 
            '待命空闲' 
          }}
        </span>
      </div>
    </header>

    <!-- Dashboard Content -->
    <div class="dispatch-content">
      <!-- Left Panel: Configuration -->
      <aside class="config-panel glass-card">
        <CrawlerConfig 
          :is-running="isRunning" 
          :is-stopping="isStopping"
          @start="handleStart"
          @stop="handleStop"
        />
      </aside>

      <!-- Right Panel: Status Progress Visualization -->
      <main class="status-panel glass-card">
        <div class="status-panel-inner">
          <div class="progress-header">
            <h4 class="progress-title">
              <Zap class="w-5 h-5 text-yellow-400" v-if="isRunning" />
              <Cpu class="w-5 h-5 text-gray-400" v-else />
              实时运行进度
            </h4>
            <div class="time-elapsed text-sm" v-if="isRunning || elapsedSeconds > 0">
              已运行: <span>{{ formattedTime }}</span>
            </div>
          </div>

          <div class="progress-visualizer">
            <!-- Simulated Animation When Running -->
            <div v-if="isRunning" class="active-progress-view">
              <div class="hero-circle">
                <div class="circle-pulse"></div>
                <div class="circle-pulse delay-1"></div>
                <div class="circle-core">
                  <PlayCircle class="w-12 h-12 text-white" />
                </div>
              </div>
              
              <div class="progress-bar-container">
                <div class="progress-bar-track">
                  <div class="progress-bar-fill fill-running"></div>
                </div>
                <div class="progress-info">
                  <span class="text-violet-400 text-sm font-semibold tracking-wider">采集数据中...</span>
                  <span class="text-gray-400 text-xs text-uppercase mt-1">处理队列正在更新</span>
                </div>
              </div>
            </div>

            <!-- Idle/Stopping/Error View -->
            <div v-else class="idle-progress-view">
              <div class="idle-icon-wrapper">
                <CheckCircle2 v-if="crawlerStatus === 'idle'" class="w-16 h-16 text-slate-500" />
                <Loader2 v-else-if="crawlerStatus === 'stopping'" class="w-16 h-16 text-amber-500 animate-spin" />
                <AlertCircle v-else class="w-16 h-16 text-rose-500" />
              </div>
              <h3 class="idle-title">
                {{ isFinished ? '运行完成' : (crawlerStatus === 'idle' ? '任务就绪' : 
                   crawlerStatus === 'stopping' ? '停止中...' : '实例异常') }}
              </h3>
              <p class="idle-desc">
                {{ isFinished ? '所有抓取任务已成功处理并存入数据库。' : (crawlerStatus === 'idle' ? '配置参数并点击开始运行以启动采集引擎。' : 
                   crawlerStatus === 'stopping' ? '正在安全关闭所有任务连接...' : '请检查后端服务是否正常运行。') }}
              </p>
              
              <div class="progress-bar-container mt-8" v-if="crawlerStatus === 'idle' || isFinished">
                <div class="progress-bar-track">
                  <div :class="['progress-bar-fill', isFinished ? 'fill-success' : 'fill-idle']"></div>
                </div>
              </div>
            </div>
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
  gap: 1.5rem;
  overflow: hidden;
  background-image: radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.05) 0%, transparent 40%),
                    radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.05) 0%, transparent 40%);
}

.dispatch-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  background: rgba(15, 23, 42, 0.6);
  padding: 1.25rem 2rem;
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(16px);
}

.header-info {
  display: flex;
  flex-direction: column;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.title-icon {
  width: 1.75rem;
  height: 1.75rem;
  color: #8b5cf6;
}

.header-title {
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  letter-spacing: -0.025em;
}

.header-desc {
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  border-width: 1px;
  border-style: solid;
  font-size: 0.875rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.status-running {
  background-color: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.1), inset 0 0 20px rgba(16, 185, 129, 0.05);
}

.status-stopping {
  background-color: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.1);
}

.status-error {
  background-color: rgba(244, 63, 94, 0.1);
  border-color: rgba(244, 63, 94, 0.2);
  color: #f43f5e;
  box-shadow: 0 0 20px rgba(244, 63, 94, 0.1);
}

.status-idle {
  background-color: rgba(100, 116, 139, 0.1);
  border-color: rgba(100, 116, 139, 0.2);
  color: #94a3b8;
}

.running-indicator {
  position: relative;
  display: flex;
  height: 0.875rem;
  width: 0.875rem;
}

.ping-dot {
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
  position: absolute;
  height: 100%;
  width: 100%;
  border-radius: 9999px;
  background-color: #34d399;
  opacity: 0.75;
}

.solid-dot {
  position: relative;
  border-radius: 9999px;
  height: 0.875rem;
  width: 0.875rem;
  background-color: #10b981;
}

.dispatch-content {
  flex: 1 1 0%;
  display: flex;
  gap: 1.5rem;
  min-height: 0;
}

.glass-card {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 1.5rem;
  padding: 1.5rem;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
}

.config-panel {
  width: 420px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.status-panel {
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.status-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(180deg, rgba(139, 92, 246, 0.03) 0%, transparent 100%);
  z-index: 0;
  pointer-events: none;
}

.status-panel-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  background: rgba(15, 23, 42, 0.4);
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.progress-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.time-elapsed {
  color: #94a3b8;
  font-family: monospace;
  font-size: 1rem;
}

.time-elapsed span {
  color: #e2e8f0;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.progress-visualizer {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.active-progress-view, .idle-progress-view {
  width: 100%;
  max-width: 32rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-circle {
  position: relative;
  width: 8rem;
  height: 8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4rem;
}

.circle-core {
  width: 5rem;
  height: 5rem;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.4);
}

.circle-pulse {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 50%;
  border: 2px solid #10b981;
  animation: ripple 2s linear infinite;
}

.delay-1 {
  animation-delay: 1s;
}

.idle-icon-wrapper {
  background: rgba(0,0,0,0.2);
  padding: 2rem;
  border-radius: 50%;
  margin-bottom: 1.5rem;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
}

.idle-title {
  color: #f8fafc;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.idle-desc {
  color: #94a3b8;
  text-align: center;
  max-width: 24rem;
  line-height: 1.6;
}

.progress-bar-container {
  width: 100%;
}

.progress-bar-track {
  width: 100%;
  height: 1.25rem;
  background: rgba(0,0,0,0.4);
  border-radius: 999px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.05);
}

.progress-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.fill-idle {
  width: 100%;
  background-color: #475569; /* Slate 600 - Grey */
  opacity: 0.3;
}

.fill-running {
  width: 100%;
  background: linear-gradient(90deg, #8b5cf6, #a78bfa, #8b5cf6);
  background-size: 200% 100%;
  animation: gradientMove 2s linear infinite;
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
}

.fill-success {
  width: 100%;
  background: linear-gradient(90deg, #10b981, #34d399, #10b981);
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
}

.progress-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
}

.text-uppercase {
  text-transform: uppercase;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes ripple {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(2); opacity: 0; }
}

@keyframes gradientMove {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}
</style>
