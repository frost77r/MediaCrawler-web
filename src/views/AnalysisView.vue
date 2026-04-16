<script setup lang="ts">
import { ref, onMounted, onUnmounted, shallowRef, nextTick } from 'vue';
import * as echarts from 'echarts';
import { Users, FileText, Share2, Eye, MessageSquare, Heart } from 'lucide-vue-next';

const chart1Ref = ref<HTMLElement | null>(null);
const chart2Ref = ref<HTMLElement | null>(null);
const chart3Ref = ref<HTMLElement | null>(null);
const chart4Ref = ref<HTMLElement | null>(null);
const chart5Ref = ref<HTMLElement | null>(null);

const chart1 = shallowRef<echarts.ECharts | null>(null);
const chart2 = shallowRef<echarts.ECharts | null>(null);
const chart3 = shallowRef<echarts.ECharts | null>(null);
const chart4 = shallowRef<echarts.ECharts | null>(null);
const chart5 = shallowRef<echarts.ECharts | null>(null);

const stats = [
  { title: '总采集帖子/视频', value: '1,245,920', icon: FileText, color: '#3b82f6' },
  { title: '总采集评论数', value: '8,234,512', icon: MessageSquare, color: '#10b981' },
  { title: '总采集创作者', value: '45,211', icon: Users, color: '#8b5cf6' },
  { title: '累计获赞量', value: '124.5M', icon: Heart, color: '#ef4444' },
  { title: '累计分享量', value: '12.8M', icon: Share2, color: '#f59e0b' },
  { title: '累计播放/浏览量', value: '1.2B', icon: Eye, color: '#06b6d4' },
];

const initCharts = () => {
  // Chart 1: 近七日抓取趋势 (Line)
  if (chart1Ref.value) {
    chart1.value = echarts.init(chart1Ref.value);
    chart1.value.setOption({
      title: { text: '近七日平台抓取数据量趋势', textStyle: { color: '#e5e7eb', fontSize: 16 }, left: '2%' },
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { 
        type: 'category', 
        boundaryGap: false,
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisLabel: { color: '#9ca3af' }
      },
      yAxis: { 
        type: 'value',
        axisLabel: { color: '#9ca3af' },
        splitLine: { lineStyle: { color: '#374151', type: 'dashed' } }
      },
      series: [
        { name: '小红书', type: 'line', smooth: true, data: [1200, 1320, 1010, 1340, 900, 2300, 2100], itemStyle: { color: '#ef4444' } },
        { name: '抖音', type: 'line', smooth: true, data: [2200, 1820, 1910, 2340, 2900, 3300, 3100], itemStyle: { color: '#10b981' } },
        { name: 'B站', type: 'line', smooth: true, data: [1500, 2320, 2010, 1540, 1900, 3300, 4100], itemStyle: { color: '#3b82f6' } },
        { name: '微博', type: 'line', smooth: true, data: [3200, 3320, 3010, 3340, 3900, 3300, 3200], itemStyle: { color: '#f59e0b' } },
      ],
      legend: { data: ['小红书', '抖音', 'B站', '微博'], textStyle: { color: '#e5e7eb' }, top: 'top', right: '4%' }
    });
  }

  // Chart 2: 各平台数据类型分布 (Pie)
  if (chart2Ref.value) {
    chart2.value = echarts.init(chart2Ref.value);
    chart2.value.setOption({
      title: { text: '全网各平台总数据量占比', textStyle: { color: '#e5e7eb', fontSize: 16 }, left: 'center' },
      tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
      legend: { bottom: '0', textStyle: { color: '#e5e7eb' }, itemWidth: 10, itemHeight: 10, padding: 0 },
      series: [
        {
          name: '数据来源',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: '#1f2937', borderWidth: 2 },
          label: { show: false, position: 'center' },
          emphasis: { label: { show: true, fontSize: '20', fontWeight: 'bold', color: '#fff' } },
          labelLine: { show: false },
          data: [
            { value: 33048, name: '小红书', itemStyle: { color: '#ef4444' } },
            { value: 45735, name: '抖音', itemStyle: { color: '#10b981' } },
            { value: 12580, name: '快手', itemStyle: { color: '#f97316' } },
            { value: 21484, name: 'B站', itemStyle: { color: '#3b82f6' } },
            { value: 34300, name: '微博', itemStyle: { color: '#f59e0b' } },
            { value: 8300, name: '贴吧', itemStyle: { color: '#8b5cf6' } },
            { value: 12300, name: '知乎', itemStyle: { color: '#0ea5e9' } }
          ]
        }
      ]
    });
  }

  // Chart 3: 各平台互动量对比 (Bar)
  if (chart3Ref.value) {
    chart3.value = echarts.init(chart3Ref.value);
    chart3.value.setOption({
      title: { text: '平台互动数据对比 (平均)', textStyle: { color: '#e5e7eb', fontSize: 16 }, left: '2%' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['点赞', '评论', '收藏/转发'], textStyle: { color: '#e5e7eb' }, right: '2%' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { 
        type: 'category', 
        data: ['小红书', '抖音', '快手', 'B站', '微博', '知乎'],
        axisLabel: { color: '#9ca3af' }
      },
      yAxis: { 
        type: 'value',
        axisLabel: { color: '#9ca3af' },
        splitLine: { lineStyle: { color: '#374151', type: 'dashed' } }
      },
      series: [
        { name: '点赞', type: 'bar', data: [3200, 8200, 4100, 6400, 2900, 1500], itemStyle: { color: '#ef4444', borderRadius: [2, 2, 0, 0] } },
        { name: '评论', type: 'bar', data: [800, 1500, 900, 1200, 3100, 600], itemStyle: { color: '#3b82f6', borderRadius: [2, 2, 0, 0] } },
        { name: '收藏/转发', type: 'bar', data: [1500, 3200, 1100, 2400, 4900, 900], itemStyle: { color: '#f59e0b', borderRadius: [2, 2, 0, 0] } }
      ]
    });
  }

  // Chart 4: 用户/创作者地域分布 IP Location (Horizontal Bar)
  if (chart4Ref.value) {
    chart4.value = echarts.init(chart4Ref.value);
    chart4.value.setOption({
      title: { text: '创作者IP归属地分布 Top 10', textStyle: { color: '#e5e7eb', fontSize: 16 }, left: '2%' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '6%', bottom: '3%', containLabel: true },
      xAxis: { 
        type: 'value',
        axisLabel: { color: '#9ca3af' },
        splitLine: { lineStyle: { color: '#374151', type: 'dashed' } }
      },
      yAxis: { 
        type: 'category', 
        data: ['湖南', '福建', '山东', '四川', '河南', '湖北', '上海', '北京', '浙江', '广东'],
        axisLabel: { color: '#9ca3af' }
      },
      series: [
        {
          name: '创作者数量',
          type: 'bar',
          data: [2100, 2300, 2600, 3100, 3400, 3800, 4500, 5200, 6100, 8500],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              { offset: 0, color: '#8b5cf6' },
              { offset: 1, color: '#3b82f6' }
            ]),
            borderRadius: [0, 4, 4, 0]
          }
        }
      ]
    });
  }

  // Chart 5: 各平台数据特征雷达图 (Radar)
  if (chart5Ref.value) {
    chart5.value = echarts.init(chart5Ref.value);
    chart5.value.setOption({
      title: { text: '平台综合特征分析', textStyle: { color: '#e5e7eb', fontSize: 16 }, left: 'center' },
      tooltip: { trigger: 'item' },
      legend: { bottom: '0', textStyle: { color: '#e5e7eb' }, data: ['小红书', '抖音', 'B站'] },
      radar: {
        indicator: [
          { name: '图文比例', max: 100 },
          { name: '视频比例', max: 100 },
          { name: '长评倾向', max: 100 },
          { name: '点赞转化率', max: 100 },
          { name: '分享裂变率', max: 100 },
          { name: '涨粉效率', max: 100 }
        ],
        center: ['50%', '45%'],
        radius: '60%',
        splitArea: { areaStyle: { color: ['rgba(250,250,250,0.02)', 'rgba(200,200,200,0.02)'] } },
        axisName: { color: '#9ca3af' },
        splitLine: { lineStyle: { color: '#374151' } },
        axisLine: { lineStyle: { color: '#374151' } }
      },
      series: [
        {
          name: '平台特征对比',
          type: 'radar',
          data: [
            {
              value: [90, 20, 40, 70, 60, 50],
              name: '小红书',
              itemStyle: { color: '#ef4444' },
              areaStyle: { color: 'rgba(239, 68, 68, 0.2)' }
            },
            {
              value: [10, 95, 20, 85, 90, 80],
              name: '抖音',
              itemStyle: { color: '#10b981' },
              areaStyle: { color: 'rgba(16, 185, 129, 0.2)' }
            },
            {
              value: [15, 85, 90, 60, 75, 60],
              name: 'B站',
              itemStyle: { color: '#3b82f6' },
              areaStyle: { color: 'rgba(59, 130, 246, 0.2)' }
            }
          ]
        }
      ]
    });
  }
};

const resizeCharts = () => {
  chart1.value?.resize();
  chart2.value?.resize();
  chart3.value?.resize();
  chart4.value?.resize();
  chart5.value?.resize();
};

onMounted(() => {
  nextTick(() => {
    initCharts();
  });
  window.addEventListener('resize', resizeCharts);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts);
  chart1.value?.dispose();
  chart2.value?.dispose();
  chart3.value?.dispose();
  chart4.value?.dispose();
  chart5.value?.dispose();
});
</script>

<template>
  <div class="analysis-container">
    

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

    <!-- Charts -->
    <div class="charts-row">
      <div class="chart-card glass-panel" style="flex: 2;">
        <div ref="chart1Ref" class="chart-container"></div>
      </div>
      <div class="chart-card glass-panel" style="flex: 1;">
        <div ref="chart2Ref" class="chart-container"></div>
      </div>
    </div>
    
    <div class="charts-row">
      <div class="chart-card glass-panel" style="flex: 1;">
        <div ref="chart3Ref" class="chart-container"></div>
      </div>
      <div class="chart-card glass-panel" style="flex: 1;">
        <div ref="chart4Ref" class="chart-container"></div>
      </div>
      <div class="chart-card glass-panel" style="flex: 1;">
        <div ref="chart5Ref" class="chart-container"></div>
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
  .stats-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (min-width: 1440px) {
  .stats-grid { grid-template-columns: repeat(6, 1fr); }
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
  height: 380px;
  display: flex;
  flex-direction: column;
}

.chart-container {
  width: 100%;
  flex: 1;
  min-height: 0;
}
</style>
