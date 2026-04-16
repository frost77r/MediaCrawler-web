<script setup lang="ts">
import { ref, onMounted, onUnmounted, shallowRef, nextTick } from 'vue';
import * as echarts from 'echarts';
import { Hash, ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-vue-next';

const wordCloudRef = ref<HTMLElement | null>(null);
const trendChartRef = ref<HTMLElement | null>(null);
const platformChartRef = ref<HTMLElement | null>(null);
const interactionChartRef = ref<HTMLElement | null>(null);

const wordCloudChart = shallowRef<echarts.ECharts | null>(null);
const trendChart = shallowRef<echarts.ECharts | null>(null);
const platformChart = shallowRef<echarts.ECharts | null>(null);
const interactionChart = shallowRef<echarts.ECharts | null>(null);

const stats = [
  { title: '敏感词库词汇总数', value: '12,548', icon: Hash, color: '#3b82f6' },
  { title: '今日新增暗语', value: '+184', icon: ShieldAlert, color: '#ef4444' },
  { title: '涉黑灰产总量', value: '8.4M', icon: AlertTriangle, color: '#f59e0b' },
  { title: '拦截高危线索', value: '45,200', icon: ShieldCheck, color: '#10b981' },
];

// Mock data for sensitive keywords
const topKeywords = [
  { name: '狗', value: 10000 },
  { name: '气狗', value: 9500 },
  { name: '雷子', value: 8800 },
  { name: 'V我', value: 8200 },
  { name: '面交', value: 7500 },
  { name: '大狗', value: 7200 },
  { name: '小狗', value: 6800 },
  { name: '手狗', value: 6500 },
  { name: '狗粮', value: 6000 },
  { name: '粮食', value: 5800 },
  { name: '衣架', value: 5500 },
  { name: '管子', value: 5200 },
  { name: '内脏', value: 4800 },
  { name: '母鸡', value: 4500 },
  { name: '兔子', value: 4200 },
  { name: '秃子', value: 3900 },
  { name: '出狗', value: 3600 },
  { name: '雷', value: 3300 },
  { name: '药', value: 3000 },
  { name: 'h药', value: 2800 },
  { name: 'CS必备', value: 2500 },
  { name: '飞机头', value: 2200 },
  { name: '毛瓦', value: 2000 }
];

const initCharts = () => {
  // 1. 敏感词汇发现趋势 (Line)
  if (trendChartRef.value) {
    trendChart.value = echarts.init(trendChartRef.value);
    trendChart.value.setOption({
      title: { text: '近期高频"涉枪爆黑话"发现趋势', textStyle: { color: '#e5e7eb', fontSize: 16 }, left: '2%' },
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
        { name: '狗(枪)', type: 'line', smooth: true, data: [120, 132, 180, 234, 190, 330, 410, 450, 480, 520], itemStyle: { color: '#ef4444' } },
        { name: '雷子(雷管)', type: 'line', smooth: true, data: [220, 182, 191, 234, 290, 330, 310, 350, 380, 400], itemStyle: { color: '#f59e0b' } },
        { name: '狗粮(子弹)', type: 'line', smooth: true, data: [150, 232, 201, 154, 190, 330, 410, 390, 420, 460], itemStyle: { color: '#3b82f6' } },
        { name: '面交', type: 'line', smooth: true, data: [320, 332, 301, 334, 390, 330, 320, 300, 280, 290], itemStyle: { color: '#8b5cf6' } },
        { name: 'V我', type: 'line', smooth: true, data: [100, 120, 150, 180, 200, 220, 250, 280, 310, 340], itemStyle: { color: '#10b981' } },
      ]
    });
  }

  // 2. 词云图：使用 Scatter 散点图无插件模拟“涉枪爆黑话”词汇分布
  if (wordCloudRef.value) {
    wordCloudChart.value = echarts.init(wordCloudRef.value);
    
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899', '#14b8a6', '#6366f1', '#f43f5e', '#84cc16', '#eab308'];
    
    const scatterData = topKeywords.map((item, index) => {
      // 固定一些随机种子以保证位置相对稳定，也可以用纯随机
      const x = Math.random() * 80 + 10;
      const y = Math.random() * 80 + 10;
      return {
        name: item.name,
        value: [x, y, item.value],
        itemStyle: { color: 'transparent' },
        label: {
          show: true,
          formatter: '{b}',
          fontSize: Math.max(14, item.value / 250),
          color: colors[index % colors.length],
          fontWeight: 'bold'
        }
      };
    });

    wordCloudChart.value.setOption({
      title: { text: '高频"涉枪爆黑话"热词分布', textStyle: { color: '#e5e7eb', fontSize: 16 }, left: 'center' },
      tooltip: { 
        show: true, 
        formatter: function (params: any) {
          return `${params.name}: 出现 ${params.value[2]} 次`;
        }
      },
      grid: { left: '5%', right: '5%', bottom: '5%', top: '15%' },
      xAxis: { type: 'value', show: false, min: 0, max: 100 },
      yAxis: { type: 'value', show: false, min: 0, max: 100 },
      series: [{
        type: 'scatter',
        symbolSize: 0,
        data: scatterData,
        emphasis: {
          label: {
            textShadowBlur: 10,
            textShadowColor: '#fff',
            fontSize: 24
          }
        }
      }]
    });
  }

  // 3. 各平台暗语热度分布 (Bar)
  if (platformChartRef.value) {
    platformChart.value = echarts.init(platformChartRef.value);
    platformChart.value.setOption({
      title: { text: '主要黑话平台分布差异', textStyle: { color: '#e5e7eb', fontSize: 16 }, left: '2%' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['贴吧', 'QQ群', '微博', '二手平台'], textStyle: { color: '#e5e7eb' }, right: '2%' },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '20%', containLabel: true },
      xAxis: { 
        type: 'category', 
        data: ['狗', '气狗', '雷子', '面交', '大狗', '管子'],
        axisLabel: { color: '#9ca3af', interval: 0, rotate: 15 }
      },
      yAxis: { 
        type: 'value',
        axisLabel: { color: '#9ca3af' },
        splitLine: { lineStyle: { color: '#374151', type: 'dashed' } }
      },
      series: [
        { name: '贴吧', type: 'bar', stack: 'total', data: [1200, 800, 500, 1500, 1800, 300], itemStyle: { color: '#ef4444' } },
        { name: 'QQ群', type: 'bar', stack: 'total', data: [3200, 4500, 1800, 2100, 1200, 1500], itemStyle: { color: '#10b981' } },
        { name: '微博', type: 'bar', stack: 'total', data: [4500, 2100, 3500, 1800, 800, 2100], itemStyle: { color: '#f59e0b' } },
        { name: '二手平台', type: 'bar', stack: 'total', data: [1100, 1100, 2000, 1100, 1600, 900], itemStyle: { color: '#3b82f6' } }
      ]
    });
  }

  // 4. 交易倾向与风险等级散点分析
  if (interactionChartRef.value) {
    interactionChart.value = echarts.init(interactionChartRef.value);
    
    const scatterData = topKeywords.slice(0, 15).map(item => {
      // Generate some mock risk level (1 to 10) and transaction intent (0 to 100)
      const riskLevel = (Math.random() * 9 + 1).toFixed(1);
      const transactionIntent = Math.floor(Math.random() * 80 + 20);
      return [riskLevel, transactionIntent, item.name, item.value];
    });

    interactionChart.value.setOption({
      title: { text: '私下交易敏感信号关联分析', textStyle: { color: '#e5e7eb', fontSize: 16 }, left: '2%' },
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          return `${params.data[2]}<br/>风险等级(1-10): ${params.data[0]}<br/>私交倾向指数: ${params.data[1]}<br/>词频: ${params.data[3]}`;
        }
      },
      grid: { left: '3%', right: '8%', bottom: '3%', top: '20%', containLabel: true },
      xAxis: { 
        name: '风险预警等级 (低 <- -> 高)',
        nameLocation: 'middle',
        nameGap: 25,
        type: 'value', 
        min: 0, max: 10,
        axisLabel: { color: '#9ca3af' }, 
        splitLine: { lineStyle: { color: '#374151', type: 'dashed' } } 
      },
      yAxis: { 
        name: '私下交易倾向指数',
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
          name: '线索词',
          type: 'scatter',
          data: scatterData,
          itemStyle: {
            color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
              { offset: 0, color: '#f87171' },
              { offset: 1, color: '#b91c1c' }
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
            fontSize: 12
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
    <div class="header">
      <h1 class="title">动态敏感词库构建</h1>
      <p class="subtitle">通过爬取社媒文本内容分词生成“涉枪爆黑话”词云，并结合私交敏感信号持续更新敏感词库。</p>
    </div>

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