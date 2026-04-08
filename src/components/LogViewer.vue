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
        >> 初始化完成，请配置参数后点击"开始爬取"...
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
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 1rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
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
  color: #64748b;
}

.log-entry {
  word-break: break-all;
  line-height: 1.625;
}

.log-timestamp {
  color: #64748b;
  margin-right: 0.5rem;
}

.log-info {
  color: #38bdf8;
}

.log-error {
  color: #fb7185;
}

.log-warning {
  color: #fbbf24;
}

.log-success {
  color: #34d399;
}
</style>
