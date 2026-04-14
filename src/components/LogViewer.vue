<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { crawlerApi } from '../api';
import type { Log } from '../types';

const props = defineProps<{
  isRunning: boolean;
}>();

const logs = ref<Log[]>([]);
const logsContainer = ref<HTMLDivElement | null>(null);
let lastLogId = 0;
let logPollInterval: any = null;

const userHasScrolledUp = ref(false);

const handleScroll = (e: Event) => {
  const target = e.target as HTMLDivElement;
  const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
  userHasScrolledUp.value = !isAtBottom;
};

const scrollToBottom = () => {
  if (logsContainer.value && !userHasScrolledUp.value) {
    logsContainer.value.scrollTo({
      top: logsContainer.value.scrollHeight,
      behavior: 'smooth'
    });
  }
};

const fetchLogs = async () => {
  try {
    const res = await crawlerApi.getLogs(50);
    const newLogs = res.data.logs.filter((l: Log) => l.id > lastLogId);
    if (newLogs.length > 0) {
      logs.value.push(...newLogs);
      lastLogId = newLogs[newLogs.length - 1].id;
      await nextTick();
      scrollToBottom();
    }
  } catch (err) {
    console.error('Fetch logs error:', err);
  }
};

const startPolling = () => {
  if (!logPollInterval) {
    logPollInterval = setInterval(fetchLogs, 1000);
  }
};

const stopPolling = () => {
  if (logPollInterval) {
    clearInterval(logPollInterval);
    logPollInterval = null;
  }
};

watch(() => props.isRunning, (newVal) => {
  if (newVal) {
    startPolling();
  } else {
    setTimeout(stopPolling, 3000);
  }
}, { immediate: true });

onMounted(() => {
  if (props.isRunning) startPolling();
});

onUnmounted(() => {
  stopPolling();
});

const getLogClass = (level: string) => {
  switch (level) {
    case 'error': return 'log-error';
    case 'warning': return 'log-warning';
    case 'success': return 'log-success';
    default: return 'log-info';
  }
};
</script>

<template>
  <div class="log-viewer">
    <div ref="logsContainer" class="log-scroll-area" @scroll="handleScroll">
      <div v-if="logs.length === 0" class="log-empty">
        >> 系统初始化完成. 核心模块已就绪.<br>
        >> 等待用户配置参数并启动任务...
      </div>
      <div v-for="log in logs" :key="log.id" class="log-entry">
        <span class="log-timestamp">[{{ log.timestamp }}]</span>
        <span :class="getLogClass(log.level)">{{ log.message }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.log-viewer {
  flex: 1 1 0%;
  background-color: #020617; /* Very dark slate, almost black */
  border: 1px solid var(--glass-border);
  border-radius: 0.5rem;
  padding: 1rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.8125rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
}

.log-scroll-area {
  flex: 1 1 0%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-right: 0.5rem;
}

.log-empty {
  color: #475569;
  line-height: 1.5;
}

.log-entry {
  word-break: break-all;
  line-height: 1.5;
}

.log-timestamp {
  color: #64748b;
  margin-right: 0.5rem;
}

.log-info { color: #38bdf8; }
.log-error { color: #f43f5e; }
.log-warning { color: #eab308; }
.log-success { color: #10b981; }

.log-scroll-area::-webkit-scrollbar {
  width: 6px;
}
.log-scroll-area::-webkit-scrollbar-track {
  background: transparent;
}
.log-scroll-area::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 99px;
}
.log-scroll-area::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
