<script setup lang="ts">
import { ref, onMounted, onUnmounted, shallowRef, nextTick } from 'vue';
import * as echarts from 'echarts';
import { Hash, TrendingUp, MessageCircle, BarChart3 } from 'lucide-vue-next';

const wordCloudRef = ref<HTMLElement | null>(null);
const trendChartRef = ref<HTMLElement | null>(null);
const platformChartRef = ref<HTMLElement | null>(null);
const interactionChartRef = ref<HTMLElement | null>(null);

const wordCloudChart = shallowRef<echarts.ECharts | null>(null);
const trendChart = shallowRef<echarts.ECharts | null>(null);
const platformChart = shallowRef<echarts.ECharts | null>(null);
const interactionChart = shallowRef<echarts.ECharts | null>(null);

const stats = [
  { title: '监控关键词总数', value: '1,284', icon: Hash, color: '#8b5cf6' },
  { title: '今日新增词条', value: '+156', icon: TrendingUp, color: '#10b981' },
  { title: '关联讨论总量', value: '4.2M', icon: MessageCircle, color: '#3b82f6' },
  { title: '平均热度指数', value: '86.4', icon: BarChart3, color: '#f59e0b' },
];

// Mock data for keywords
const topKeywords = [
  { name: '人工智能', value: 10000 },
  { name: '新能源汽车', value: 8500 },
  { name: '大模型', value: 7800 },
  { name: '降本增效', value: 6500 },
  { name: '跨境电商', value: 5400 },
  { name: '芯片', value: 4800 },
  { name: 'AIGC', value: 4500 },
  { name: '消费降级', value: 3800 },
  { name: '自动驾驶', value: 3200 },
  { name: '半导体', value: 2900 },
  { name: '旅游', value: 2500 },
  { name: '游戏', value: 2200 },
  { name: '短剧', value: 1900 },
  { name: '直播带货', value: 1800 },
  { name: '苹果', value: 1600 },
  { name: '华为', value: 1500 },
  { name: '小米', value: 1400 },
  { name: '特斯拉', value: 1300 },
  { name: '英伟达', value: 1200 },
  { name: '比亚迪', value: 1100 }
];

const initCharts = () => {
  // 1. 关键词热度趋势 (Line)
  if (trendChartRef.value) {
    trendChart.value = echarts.init(trendChartRef.value);
    trendChart.value.setOption({
      title: { text: 'Top5 关键词近30天讨论趋势', textStyle: { color: '#e5e7eb', fontSize: 16 }, left: '2%' },
      tooltip: { trigger: 'axis' },
      legend: { top: '8%', right: '2%', textStyle: { color: '#e5e7eb' } },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '20%', containLabel: true },
      xAxis: { 
        type: 'category', 
        boundaryGap: false,
        data: Array.from({length: 10}, (_, i) => `10-${i+1}`),
        axisLabel: { color: '#9ca3af' }
      },
      yAxis: { 
        type: 'value',
        axisLabel: { color: '#9ca3af' },
        splitLine: { lineStyle: { color: '#374151', type: 'dashed' } }
      },
      series: [
        { name: '人工智能', type: 'line', smooth: true, data: [120, 132, 180, 234, 190, 330, 410, 450, 480, 520], itemStyle: { color: '#8b5cf6' } },
        { name: '新能源汽车', type: 'line', smooth: true, data: [220, 182, 191, 234, 290, 330, 310, 350, 380, 400], itemStyle: { color: '#10b981' } },
        { name: '大模型', type: 'line', smooth: true, data: [150, 232, 201, 154, 190, 330, 410, 390, 420, 460], itemStyle: { color: '#3b82f6' } },
        { name: '降本增效', type: 'line', smooth: true, data: [320, 332, 301, 334, 390, 330, 320, 300, 280, 290], itemStyle: { color: '#ef4444' } },
        { name: '跨境电商', type: 'line', smooth: true, data: [100, 120, 150, 180, 200, 220, 250, 280, 310, 340], itemStyle: { color: '#f59e0b' } },
      ]
    });
  }

  // 2. 关键词云 (Scatter as fallback or actual wordcloud if package is available)
  if (wordCloudRef.value) {
    wordCloudChart.value = echarts.init(wordCloudRef.value);
    
    // We will use a custom scatter plot to simulate a word cloud visually without needing the external plugin
    // Or we can try to use standard ECharts elements to show keyword distribution
    wordCloudChart.value.setOption({
      title: { text: '核心热词分布 (词频)', textStyle: { color: '#e5e7eb', fontSize: 16 }, left: 'center' },
      tooltip: { show: true, formatter: '{b}: {c} 次讨论' },
      series: [{
        type: 'treemap',
        width: '90%',
        height: '80%',
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        label: { show: true, formatter: '{b}\n\n{c}', fontSize: 14 },
        itemStyle: {
          borderColor: '#1f2937',
          borderWidth: 2,
          gapWidth: 2
        },
        data: topKeywords.slice(0, 12).map((item, index) => {
          const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899', '#14b8a6', '#6366f1', '#f43f5e', '#84cc16', '#eab308'];
          return {
            name: item.name,
            value: item.value,
            itemStyle: { color: colors[index % colors.length] }
          };
        })
      }]
    });
  }

  // 3. 各平台关键词热度分布 (Bar)
  if (platformChartRef.value) {
    platformChart.value = echarts.init(platformChartRef.value);
    platformChart.value.setOption({
      title: { text: 'Top热词平台分布差异', textStyle: { color: '#e5e7eb', fontSize: 16 }, left: '2%' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['小红书', '抖音', '微博', 'B站'], textStyle: { color: '#e5e7eb' }, right: '2%' },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '20%', containLabel: true },
      xAxis: { 
        type: 'category', 
        data: topKeywords.slice(0, 6).map(k => k.name),
        axisLabel: { color: '#9ca3af', interval: 0, rotate: 15 }
      },
      yAxis: { 
        type: 'value',
        axisLabel: { color: '#9ca3af' },
        splitLine: { lineStyle: { color: '#374151', type: 'dashed' } }
      },
      series: [
        { name: '小红书', type: 'bar', stack: 'total', data: [1200, 800, 500, 1500, 1800, 300], itemStyle: { color: '#ef4444' } },
        { name: '抖音', type: 'bar', stack: 'total', data: [3200, 4500, 1800, 2100, 1200, 1500], itemStyle: { color: '#10b981' } },
        { name: '微博', type: 'bar', stack: 'total', data: [4500, 2100, 3500, 1800, 800, 2100], itemStyle: { color: '#f59e0b' } },
        { name: 'B站', type: 'bar', stack: 'total', data: [1100, 1100, 2000, 1100, 1600, 900], itemStyle: { color: '#3b82f6' } }
      ]
    });
  }

  // 4. 关键词情感与互动倾向 (Scatter/Bubble)
  if (interactionChartRef.value) {
    interactionChart.value = echarts.init(interactionChartRef.value);
    
    const scatterData = topKeywords.slice(0, 15).map(item => {
      // Generate some mock sentiment (-1 to 1) and interaction rate
      const sentiment = (Math.random() * 2 - 1).toFixed(2);
      const interaction = Math.floor(Math.random() * 5000 + 1000);
      return [sentiment, interaction, item.name, item.value];
    });

    interactionChart.value.setOption({
      title: { text: '关键词情感与互动关联分析', textStyle: { color: '#e5e7eb', fontSize: 16 }, left: '2%' },
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          return `${params.data[2]}<br/>情感倾向: ${params.data[0]}<br/>互动量: ${params.data[1]}<br/>总词频: ${params.data[3]}`;
        }
      },
      grid: { left: '3%', right: '8%', bottom: '3%', top: '20%', containLabel: true },
      xAxis: { 
        name: '情感倾向 (负向 <- -> 正向)',
        nameLocation: 'middle',
        nameGap: 25,
        type: 'value', 
        min: -1, max: 1,
        axisLabel: { color: '#9ca3af' }, 
        splitLine: { lineStyle: { color: '#374151', type: 'dashed' } } 
      },
      yAxis: { 
        name: '互动转化量',
        type: 'value',
        axisLabel: { color: '#9ca3af' },
        splitLine: { lineStyle: { color: '#374151', type: 'dashed' } }
      },
      visualMap: {
        show: false,
        min: 1000,
        max: 10000,
        inRange: {
          symbolSize: [10, 40]
        }
      },
      series: [
        {
          name: '关键词',
          type: 'scatter',
          data: scatterData,
          itemStyle: {
            color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
              { offset: 0, color: '#38bdf8' },
              { offset: 1, color: '#0369a1' }
            ]),
            opacity: 0.8,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          },
          label: {
            show: true,
            formatter: '{@[2]}',
            position: 'top',
            color: '#e5e7eb',
            fontSize: 11
          }
        }
      ]
    });
  }
};

const resizeCharts = () => {
  wordCloudChart.value?.resize();
  trendChart.value?.resize();
  platformChart.value?.resize();
  interactionChart.value?.resize();
};

onMounted(() => {
  nextTick(() => {
    initCharts();
  });
  window.addEventListener('resize', resizeCharts);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts);
  wordCloudChart.value?.dispose();
  trendChart.value?.dispose();
  platformChart.value?.dispose();
  interactionChart.value?.dispose();
});
</script>

<template>
  <div class="keyword-container">
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.title" class="stat-card glass-panel">
        <div class="stat-icon-wrapper" :style="{ backgroundColor: `${stat.color}1a` }">
          <component :is="stat.icon" class="stat-icon" :style="{ color: stat.color }" />
        </div>
        <div class="stat-content">
          <div class="stat-title">{{ stat.title }}</div>
          <div class="stat-value">{{ stat.value }}</div>
        </div>
      </div>
    </div>

    <!-- Charts First Row -->
    <div class="charts-row">
      <div class="chart-card glass-panel" style="flex: 1.5;">
        <div ref="trendChartRef" class="chart-container"></div>
      </div>
      <div class="chart-card glass-panel" style="flex: 1;">
        <div ref="wordCloudRef" class="chart-container"></div>
      </div>
    </div>
    
    <!-- Charts Second Row -->
    <div class="charts-row">
      <div class="chart-card glass-panel" style="flex: 1;">
        <div ref="platformChartRef" class="chart-container"></div>
      </div>
      <div class="chart-card glass-panel" style="flex: 1;">
        <div ref="interactionChartRef" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.keyword-container {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  color: var(--text-main);
  max-width: 100%;
  overflow-x: hidden;
}

.glass-panel {
  background-color: var(--glass-bg, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
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
  background-color: var(--glass-bg, rgba(255, 255, 255, 0.05));
}

.stat-icon-wrapper {
  padding: 0.75rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.stat-title {
  font-size: 0.875rem;
  color: var(--text-muted, #9ca3af);
  margin-bottom: 0.25rem;
  white-space: nowrap;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.025em;
}

.charts-row {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
@media (min-width: 1024px) {
  .charts-row { flex-direction: row; }
}

.chart-card {
  padding: 1.25rem;
  height: 340px;
  display: flex;
  flex-direction: column;
}

.chart-container {
  width: 100%;
  flex: 1;
  min-height: 0;
}
</style>