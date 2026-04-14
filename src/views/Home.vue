<script setup lang="ts">
import { useRouter } from 'vue-router';
import { 
  ChevronRight,
  Database,
  Activity,
  Lightbulb,
  TrendingUp,
  Users,
  AlertTriangle,
  BarChart3,
  LayoutDashboard
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
  { title: '线索管理', path: '/clue', icon: Lightbulb }
];
</script>

<template>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-info">
        <div class="title-wrapper">
          <LayoutDashboard class="title-icon" />
          <h2 class="header-title">系统概览</h2>
        </div>
        <p class="header-desc">慧眸数据采集与舆情分析指挥中心</p>
      </div>
      <div class="time-display">
        {{ new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }) }}
      </div>
    </header>

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

    <!-- Charts Row -->
    <div class="charts-row">
      <!-- Main Trend Chart (Mock) -->
      <div class="chart-card main-chart">
        <div class="card-header">
          <h3 class="card-title"><TrendingUp class="w-4 h-4" /> 7日舆情趋势走势</h3>
          <select class="simple-select">
            <option>近7天</option>
            <option>近30天</option>
          </select>
        </div>
        <div class="mock-chart-area">
          <!-- CSS Grid Bars to simulate a bar chart -->
          <div class="bar-container">
            <div class="bar" style="height: 40%"></div>
            <div class="bar" style="height: 60%"></div>
            <div class="bar" style="height: 30%"></div>
            <div class="bar" style="height: 80%"></div>
            <div class="bar" style="height: 50%"></div>
            <div class="bar" style="height: 90%"></div>
            <div class="bar" style="height: 75%"></div>
          </div>
          <div class="x-axis">
            <span>周一</span><span>周二</span><span>周三</span><span>周四</span><span>周五</span><span>周六</span><span>周日</span>
          </div>
        </div>
      </div>

      <!-- Secondary Chart / Quick Links -->
      <div class="side-panel">
        <div class="chart-card">
          <div class="card-header">
            <h3 class="card-title"><BarChart3 class="w-4 h-4" /> 平台分布</h3>
          </div>
          <div class="platform-bars">
            <div class="p-bar-row">
              <div class="p-label">小红书</div>
              <div class="p-track"><div class="p-fill bg-rose-500" style="width: 45%"></div></div>
              <div class="p-val">45%</div>
            </div>
            <div class="p-bar-row">
              <div class="p-label">抖音</div>
              <div class="p-track"><div class="p-fill bg-slate-900 border border-slate-500" style="width: 30%"></div></div>
              <div class="p-val">30%</div>
            </div>
            <div class="p-bar-row">
              <div class="p-label">微博</div>
              <div class="p-track"><div class="p-fill bg-amber-500" style="width: 15%"></div></div>
              <div class="p-val">15%</div>
            </div>
            <div class="p-bar-row">
              <div class="p-label">B站</div>
              <div class="p-track"><div class="p-fill bg-blue-400" style="width: 10%"></div></div>
              <div class="p-val">10%</div>
            </div>
          </div>
        </div>

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
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: var(--text-main);
  height: 100%;
  overflow-y: auto;
}

.dashboard-header {
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

.time-display {
  font-size: 0.8125rem;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.03);
  padding: 0.375rem 1rem;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
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
  flex: 1;
  min-height: 400px;
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
  margin-bottom: 1.5rem;
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

/* Mock Chart Styles */
.mock-chart-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-top: 2rem;
}

.bar-container {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--glass-border);
}

.bar {
  width: 40px;
  background: linear-gradient(to top, rgba(59, 130, 246, 0.8), rgba(59, 130, 246, 0.2));
  border-radius: 4px 4px 0 0;
  transition: height 1s ease-out;
}
.bar:hover { background: rgba(59, 130, 246, 1); }

.x-axis {
  display: flex;
  justify-content: space-around;
  padding-top: 0.5rem;
  color: var(--text-muted);
  font-size: 0.75rem;
}

/* Side Panel */
.side-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.platform-bars {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.p-bar-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.p-label { width: 3rem; font-size: 0.75rem; color: var(--text-muted); }
.p-track {
  flex: 1;
  height: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 999px;
  overflow: hidden;
}
.p-fill { height: 100%; border-radius: 999px; }
.p-val { width: 2.5rem; text-align: right; font-size: 0.75rem; font-family: monospace; color: #fff; }

.links-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
