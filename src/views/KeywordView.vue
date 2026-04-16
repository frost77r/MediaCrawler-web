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
      legend: { data: ['贴吧', 'QQ群', '微博', '二手平台'], textStyle: { color: '#e5e7eb' }, top: '1%', right: '1%' },
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

    // 固定数据，每个点可单独指定 label position 避免遮挡
    interface RawPoint {
      name: string; risk: number; intent: number; freq: number;
      labelPos?: 'top' | 'bottom' | 'left' | 'right';
    }
    const rawData: RawPoint[] = [
      { name: '狗',    risk: 9.2, intent: 55, freq: 10000, labelPos: 'bottom' },
      { name: '气狗',  risk: 9.5, intent: 48, freq: 9500,  labelPos: 'right'  },
      { name: '雷子',  risk: 8.8, intent: 88, freq: 8800,  labelPos: 'left'   },
      { name: '管子',  risk: 9.0, intent: 84, freq: 8800,  labelPos: 'right'  },
      { name: 'V我',   risk: 6.5, intent: 92, freq: 8200,  labelPos: 'top'    },
      { name: '面交',  risk: 7.2, intent: 45, freq: 7500,  labelPos: 'bottom' },
      { name: '大狗',  risk: 9.1, intent: 52, freq: 7200,  labelPos: 'left'   },
      { name: '小狗',  risk: 9.0, intent: 78, freq: 6800,  labelPos: 'top'    },
      { name: '手狗',  risk: 2.8, intent: 72, freq: 6500,  labelPos: 'top'    },
      { name: '狗粮',  risk: 2.5, intent: 35, freq: 6000,  labelPos: 'top'    },
      { name: '粮食',  risk: 6.0, intent: 78, freq: 5800,  labelPos: 'top'    },
      { name: '衣架',  risk: 7.8, intent: 92, freq: 5500,  labelPos: 'right'  },
      { name: '母鸡',  risk: 6.2, intent: 62, freq: 4800,  labelPos: 'bottom' },
      { name: '兔子',  risk: 4.3, intent: 28, freq: 4500,  labelPos: 'top'    },
      { name: '内脏',  risk: 7.5, intent: 94, freq: 4200,  labelPos: 'left'   },
    ];

    const toSeries = (group: RawPoint[], color1: string, color2: string, shadow: string) =>
      group.map(d => ({
        value: [d.risk, d.intent, d.freq],
        name: d.name,
        label: { position: d.labelPos ?? 'top' },
        itemStyle: {
          color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
            { offset: 0, color: color1 },
            { offset: 1, color: color2 },
          ]),
          opacity: 0.88,
          shadowBlur: 14,
          shadowColor: shadow,
        },
      }));

    const lowRisk  = rawData.filter(d => d.risk < 4);
    const midRisk  = rawData.filter(d => d.risk >= 4 && d.risk < 7);
    const highRisk = rawData.filter(d => d.risk >= 7);

    // 公共 label formatter（取 name 字段）
    const labelBase = {
      show: true,
      formatter: (p: any) => p.data.name,
      fontSize: 11,
      fontWeight: 700,
    };

    interactionChart.value.setOption({
      backgroundColor: 'transparent',
      title: {
        text: '私下交易敏感信号关联分析',
        subtext: '● 气泡大小 = 词频热度    ● X轴 = 风险等级 (0~10)    ● Y轴 = 私交倾向指数',
        textStyle: { color: '#e5e7eb', fontSize: 15, fontWeight: 600 },
        subtextStyle: { color: '#4b5563', fontSize: 10.5 },
        left: '2%',
        top: '1%',
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15,23,42,0.95)',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: [10, 14],
        textStyle: { color: '#e5e7eb', fontSize: 13 },
        formatter: (p: any) => {
          const [risk, intent, freq] = p.data.value as number[];
          const name = p.data.name as string;
          const riskStr = risk >= 7 ? '<span style="color:#fca5a5">🔴 高危</span>'
            : risk >= 4 ? '<span style="color:#fde68a">🟡 中危</span>'
            : '<span style="color:#6ee7b7">🟢 低危</span>';
          return `<b style="font-size:14px">${name}</b><br/>
风险等级：<b>${risk}</b> ${riskStr}<br/>
私交倾向：<b>${intent}</b><br/>
词频热度：<b>${(freq as number).toLocaleString()}</b> 次`;
        }
      },
      legend: {
        data: ['低风险词', '中风险词', '高风险词'],
        top: '1%',
        right: '2%',
        icon: 'circle',
        textStyle: { color: '#9ca3af', fontSize: 11 },
        itemWidth: 10, itemHeight: 10, itemGap: 14,
      },
      // 给 visualMap 留出右侧空间
      grid: { left: '6%', right: '12%', bottom: '8%', top: '20%' },
      xAxis: {
        type: 'value', min: 0, max: 11,
        name: '风险预警等级 →',
        nameLocation: 'end',
        nameGap: 6,
        nameTextStyle: { color: '#4b5563', fontSize: 10 },
        axisLabel: { color: '#4b5563', fontSize: 10 },
        splitLine: { lineStyle: { color: '#1e293b', width: 1 } },
        axisLine: { lineStyle: { color: '#334155' } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value', min: 0, max: 110,
        axisLabel: { color: '#4b5563', fontSize: 10 },
        splitLine: { lineStyle: { color: '#1e293b', width: 1 } },
        axisLine: { lineStyle: { color: '#334155' } },
        axisTick: { show: false },
      },
      // visualMap 竖向放右侧，不遮挡底部轴
      visualMap: {
        show: true,
        min: 4000, max: 10000,
        dimension: 2,
        orient: 'vertical',
        right: '1%',
        top: 'middle',
        itemHeight: 80,
        itemWidth: 12,
        text: ['高', '低'],
        textStyle: { color: '#4b5563', fontSize: 10 },
        inRange: { symbolSize: [12, 52] },
        calculable: true,
        handleStyle: { color: '#6366f1' },
        indicatorStyle: { color: '#6366f1' },
      },
      series: [
        {
          name: '高风险词',
          type: 'scatter',
          data: toSeries(highRisk, '#fca5a5', '#dc2626', 'rgba(220,38,38,0.35)'),
          label: { ...labelBase, color: '#fca5a5' },
          emphasis: { scale: 1.2 },
          // 象限分割线（隐藏标签数字）
          markLine: {
            silent: true,
            symbol: 'none',
            label: { show: false },
            lineStyle: { color: 'rgba(100,116,139,0.25)', type: [6, 4], width: 1 },
            data: [{ xAxis: 7 }, { yAxis: 70 }],
          },
          // 高危高意图区块
          markArea: {
            silent: true,
            itemStyle: { color: 'rgba(220,38,38,0.05)', borderColor: 'rgba(220,38,38,0.12)', borderWidth: 1, borderType: 'dashed' },
            data: [[{ xAxis: 7, yAxis: 70 }, { xAxis: 11, yAxis: 110 }]],
            label: { show: true, position: 'insideBottomRight', color: 'rgba(252,165,165,0.35)', fontSize: 10, fontWeight: 500, formatter: '⚠ 高危·高意图' },
          },
        },
        {
          name: '中风险词',
          type: 'scatter',
          data: toSeries(midRisk, '#fde68a', '#d97706', 'rgba(217,119,6,0.35)'),
          label: { ...labelBase, color: '#fbbf24' },
          emphasis: { scale: 1.2 },
        },
        {
          name: '低风险词',
          type: 'scatter',
          data: toSeries(lowRisk, '#6ee7b7', '#059669', 'rgba(5,150,105,0.3)'),
          label: { ...labelBase, color: '#34d399' },
          emphasis: { scale: 1.2 },
        },
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
  height: 358px;
  display: flex;
  flex-direction: column;
}

.chart-container {
  width: 100%;
  flex: 1;
  min-height: 0;
}
</style>