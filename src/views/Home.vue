<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';
import { 
  ChevronRight,
  Database,
  Activity,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Server,
  Cpu,
  HardDrive
} from 'lucide-vue-next';

const router = useRouter();

const navigateTo = (path: string) => {
  router.push(path);
};

const metrics = [
  { title: '今日采集总量', value: '124,592', change: '+12.5%', icon: Database, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { title: '运行中任务', value: '8', change: '正常', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { title: '新增线索', value: '34', change: '+5.2%', icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { title: '高危预警', value: '3', change: '-1', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10' }
];

const quickLinks = [
  { title: '调度中心', path: '/dispatch', icon: Activity },
  { title: '数据展示', path: '/data', icon: Database },
  { title: '线索管理', path: '/clue', icon: Lightbulb },
  { title: '关键词管理', path: '/keyword', icon: Server }
];

const recentLogs = [
  { time: '10:24:32', level: 'info', message: '小红书关键词 [旅游] 抓取完成，新增 102 条。' },
  { time: '10:22:15', level: 'warning', message: '微博节点代理响应延迟，已自动切换。' },
  { time: '10:20:00', level: 'info', message: '定时任务 [每日早报] 开始执行。' },
  { time: '10:15:45', level: 'error', message: 'B站视频解析失败，请检查Cookie状态。' },
  { time: '10:10:12', level: 'info', message: '抖音账号状态检查完成，均正常。' },
];

const trendChartRef = ref<HTMLElement | null>(null);
const platformChartRef = ref<HTMLElement | null>(null);

let trendChart: echarts.ECharts | null = null;
let platformChart: echarts.ECharts | null = null;

const initCharts = () => {
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value);
    trendChart.setOption({
      tooltip: { 
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(51, 65, 85, 0.5)',
        textStyle: { color: '#f8fafc' }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisLabel: { color: '#94a3b8' },
        axisLine: { lineStyle: { color: '#334155' } }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLabel: { color: '#94a3b8' }
      },
      series: [
        {
          name: '采集量',
          type: 'line',
          smooth: true,
          symbolSize: 6,
          itemStyle: { color: '#3b82f6' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59,130,246,0.5)' },
              { offset: 1, color: 'rgba(59,130,246,0)' }
            ])
          },
          data: [12000, 13200, 10100, 13400, 9000, 23000, 21000]
        }
      ]
    });
  }

  if (platformChartRef.value) {
    platformChart = echarts.init(platformChartRef.value);
    platformChart.setOption({
      tooltip: { 
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(51, 65, 85, 0.5)',
        textStyle: { color: '#f8fafc' }
      },
      legend: { bottom: '0%', left: 'center', textStyle: { color: '#94a3b8' }, itemWidth: 12, itemHeight: 12 },
      series: [
        {
          name: '平台分布',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#0f172a',
            borderWidth: 2
          },
          label: { show: false, position: 'center' },
          emphasis: {
            label: { show: true, fontSize: 16, fontWeight: 'bold', color: '#fff' }
          },
          labelLine: { show: false },
          data: [
            { value: 1048, name: '小红书', itemStyle: { color: '#f43f5e' } },
            { value: 735, name: '抖音', itemStyle: { color: '#1e293b' } },
            { value: 580, name: '微博', itemStyle: { color: '#f59e0b' } },
            { value: 484, name: 'B站', itemStyle: { color: '#3b82f6' } }
          ]
        }
      ]
    });
  }
};

const handleResize = () => {
  trendChart?.resize();
  platformChart?.resize();
};

onMounted(() => {
  // Use setTimeout to ensure the DOM elements are fully rendered before initializing ECharts
  setTimeout(initCharts, 0);
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  trendChart?.dispose();
  platformChart?.dispose();
});
</script>

<template>
  <div class="dashboard-container">
    <!-- Metrics Row -->
    <div class="metrics-grid">
      <div v-for="(metric, idx) in metrics" :key="idx" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">{{ metric.title }}</span>
          <div class="metric-icon-wrapper" :class="metric.bg">
            <component :is="metric.icon" class="w-4 h-4" :class="metric.color" />
          </div>
        </div>
        <div class="metric-body">
          <span class="metric-value">{{ metric.value }}</span>
          <span class="metric-change" :class="metric.change.startsWith('-') || metric.change === '正常' ? 'text-emerald-400' : 'text-rose-400'">
            {{ metric.change }}
          </span>
        </div>
      </div>
    </div>

    <!-- Middle Row: Charts -->
    <div class="charts-row">
      <div class="chart-card main-chart">
        <div class="card-header">
          <h3 class="card-title"><TrendingUp class="w-4 h-4" /> 7日舆情趋势走势</h3>
          <select class="simple-select">
            <option>近7天</option>
            <option>近30天</option>
          </select>
        </div>
        <div ref="trendChartRef" class="chart-container"></div>
      </div>

      <div class="side-panel">
        <div class="chart-card flex-1">
          <div class="card-header">
            <h3 class="card-title"><BarChart3 class="w-4 h-4" /> 平台分布</h3>
          </div>
          <div ref="platformChartRef" class="chart-container"></div>
        </div>
      </div>
    </div>

    <!-- Bottom Row: System Status & Logs -->
    <div class="bottom-row">
      <!-- System Status -->
      <div class="chart-card system-status">
        <div class="card-header">
          <h3 class="card-title"><Activity class="w-4 h-4" /> 系统资源状态</h3>
        </div>
        <div class="status-grid">
          <div class="status-item">
            <Cpu class="w-8 h-8 text-blue-400 mb-2" />
            <div class="text-sm text-slate-400">CPU使用率</div>
            <div class="text-xl font-bold text-white mt-1">34%</div>
            <div class="w-full bg-slate-700 h-1.5 rounded-full mt-2">
              <div class="bg-blue-400 h-1.5 rounded-full" style="width: 34%"></div>
            </div>
          </div>
          <div class="status-item">
            <Server class="w-8 h-8 text-emerald-400 mb-2" />
            <div class="text-sm text-slate-400">内存使用率</div>
            <div class="text-xl font-bold text-white mt-1">62%</div>
            <div class="w-full bg-slate-700 h-1.5 rounded-full mt-2">
              <div class="bg-emerald-400 h-1.5 rounded-full" style="width: 62%"></div>
            </div>
          </div>
          <div class="status-item">
            <HardDrive class="w-8 h-8 text-amber-400 mb-2" />
            <div class="text-sm text-slate-400">磁盘空间</div>
            <div class="text-xl font-bold text-white mt-1">45%</div>
            <div class="w-full bg-slate-700 h-1.5 rounded-full mt-2">
              <div class="bg-amber-400 h-1.5 rounded-full" style="width: 45%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Logs -->
      <div class="chart-card recent-logs">
        <div class="card-header">
          <h3 class="card-title"><Database class="w-4 h-4" /> 最新系统日志</h3>
        </div>
        <div class="logs-list">
          <div v-for="(log, idx) in recentLogs" :key="idx" class="log-item">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-badge" :class="[
              log.level === 'info' ? 'bg-blue-500/20 text-blue-400' : 
              log.level === 'warning' ? 'bg-amber-500/20 text-amber-400' : 
              'bg-rose-500/20 text-rose-400'
            ]">
              {{ log.level.toUpperCase() }}
            </span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
      
      <!-- Quick Links -->
      <div class="chart-card quick-links">
        <div class="card-header">
          <h3 class="card-title">快捷操作</h3>
        </div>
        <div class="links-list">
          <button 
            v-for="(link, idx) in quickLinks" 
            :key="idx"
            @click="navigateTo(link.path)"
            class="quick-link-btn"
          >
            <div class="btn-left">
              <component :is="link.icon" class="w-4 h-4 text-blue-400" />
              <span>{{ link.title }}</span>
            </div>
            <ChevronRight class="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  color: var(--text-main);
  height: 100%;
  overflow-y: auto;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.metric-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.metric-card:hover {
  transform: translateY(-2px);
  border-color: rgba(59, 130, 246, 0.3);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-title {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 600;
}

.metric-icon-wrapper {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-body {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.metric-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.metric-change {
  font-size: 0.75rem;
  font-weight: 600;
}

.charts-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.25rem;
  min-height: 350px;
}

.bottom-row {
  display: grid;
  grid-template-columns: 1.2fr 2fr 1fr;
  gap: 1.25rem;
}

.chart-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #fff;
}

.simple-select {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--glass-border);
  color: var(--text-muted);
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  outline: none;
}

.chart-container {
  flex: 1;
  width: 100%;
  min-height: 250px;
}

/* Side Panel */
.side-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: 100%;
}

.flex-1 {
  flex: 1;
}

/* Status Grid */
.status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  flex: 1;
  align-items: center;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Logs List */
.logs-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  flex: 1;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.01);
  border-radius: 0.5rem;
}

.log-time {
  color: var(--text-muted);
  font-family: monospace;
  font-size: 0.75rem;
}

.log-badge {
  font-size: 0.65rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-weight: 600;
}

.log-message {
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

/* Quick Links */
.links-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
}

.quick-link-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-link-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.btn-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
}
</style>