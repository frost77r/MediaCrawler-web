<script setup lang="ts">
import { ref, onMounted, onUnmounted, shallowRef } from 'vue';
import * as echarts from 'echarts';
import { Users, FileText, Share2, Eye } from 'lucide-vue-next';

const chart1Ref = ref<HTMLElement | null>(null);
const chart2Ref = ref<HTMLElement | null>(null);
const chart1 = shallowRef<echarts.ECharts | null>(null);
const chart2 = shallowRef<echarts.ECharts | null>(null);

const stats = [
  { title: '总抓取数据量', value: '124,592', icon: FileText, color: '#60a5fa' },
  { title: '活跃用户数', value: '8,234', icon: Users, color: '#34d399' },
  { title: '总分享次数', value: '45,211', icon: Share2, color: '#a78bfa' },
  { title: '总浏览量', value: '1.2M', icon: Eye, color: '#fbbf24' },
];

const initCharts = () => {
  if (chart1Ref.value) {
    chart1.value = echarts.init(chart1Ref.value);
    chart1.value.setOption({
      title: { text: '近七日抓取趋势', textStyle: { color: '#e5e7eb' } },
      tooltip: { trigger: 'axis' },
      xAxis: { 
        type: 'category', 
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisLabel: { color: '#9ca3af' }
      },
      yAxis: { 
        type: 'value',
        axisLabel: { color: '#9ca3af' },
        splitLine: { lineStyle: { color: '#374151' } }
      },
      series: [
        {
          name: '小红书',
          data: [120, 132, 101, 134, 90, 230, 210],
          type: 'line',
          smooth: true,
          itemStyle: { color: '#ef4444' }
        },
        {
          name: '抖音',
          data: [220, 182, 191, 234, 290, 330, 310],
          type: 'line',
          smooth: true,
          itemStyle: { color: '#10b981' }
        }
      ],
      legend: { data: ['小红书', '抖音'], textStyle: { color: '#e5e7eb' } }
    });
  }

  if (chart2Ref.value) {
    chart2.value = echarts.init(chart2Ref.value);
    chart2.value.setOption({
      title: { text: '平台数据占比', textStyle: { color: '#e5e7eb' } },
      tooltip: { trigger: 'item' },
      legend: { top: '15%', left: 'center', textStyle: { color: '#e5e7eb' } },
      series: [
        {
          name: '数据来源',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '60%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#1f2937',
            borderWidth: 2
          },
          label: { show: false, position: 'center' },
          emphasis: {
            label: { show: true, fontSize: '20', fontWeight: 'bold' }
          },
          labelLine: { show: false },
          data: [
            { value: 1048, name: '小红书', itemStyle: { color: '#ef4444' } },
            { value: 735, name: '抖音', itemStyle: { color: '#10b981' } },
            { value: 580, name: '快手', itemStyle: { color: '#f59e0b' } },
            { value: 484, name: 'B站', itemStyle: { color: '#3b82f6' } },
            { value: 300, name: '微博', itemStyle: { color: '#ec4899' } }
          ]
        }
      ]
    });
  }
};

const resizeCharts = () => {
  chart1.value?.resize();
  chart2.value?.resize();
};

onMounted(() => {
  initCharts();
  window.addEventListener('resize', resizeCharts);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts);
  chart1.value?.dispose();
  chart2.value?.dispose();
});
</script>

<template>
  <div class="analysis-container">
    <div class="header">
      <h1 class="title">数据分析与洞察</h1>
      <p class="subtitle">实时监控全网各平台数据抓取与分析情况</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.title" class="stat-card glass-panel">
        <div class="stat-icon-wrapper">
          <component :is="stat.icon" class="stat-icon" :style="{ color: stat.color }" />
        </div>
        <div class="stat-content">
          <div class="stat-title">{{ stat.title }}</div>
          <div class="stat-value">{{ stat.value }}</div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="charts-grid">
      <div class="chart-card glass-panel">
        <div ref="chart1Ref" class="chart-container"></div>
      </div>
      <div class="chart-card glass-panel chart-pie">
        <div ref="chart2Ref" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analysis-container {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  color: var(--text-main);
}

.header {
  margin-bottom: 0.5rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.glass-panel {
  background-color: var(--glass-bg, rgba(255, 255, 255, 0.05));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
}
@media (min-width: 640px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(4, 1fr); }
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.stat-icon-wrapper {
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: rgba(255, 255, 255, 0.05);
}

.stat-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.stat-title {
  font-size: 0.875rem;
  color: var(--text-muted, #9ca3af);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}
@media (min-width: 1024px) {
  .charts-grid { grid-template-columns: 2fr 1fr; }
}

.chart-card {
  padding: 1.25rem;
  height: 400px;
}

.chart-container {
  width: 100%;
  height: 100%;
}
</style>