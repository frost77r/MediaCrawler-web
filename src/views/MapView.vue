<script setup lang="ts">
import { ref, onMounted, onUnmounted, shallowRef, nextTick } from 'vue';
import * as echarts from 'echarts';
import axios from 'axios';
import { MapPin, Users, Globe2, Activity, Bell } from 'lucide-vue-next';

const mapContainerRef = ref<HTMLElement | null>(null);
const pieChartRef = ref<HTMLElement | null>(null);

const mapChart = shallowRef<echarts.ECharts | null>(null);
const pieChart = shallowRef<echarts.ECharts | null>(null);

const isLoading = ref(true);

const stats = [
  { title: '覆盖地域', value: '34 省/直辖市', icon: Globe2, color: '#3b82f6' },
  { title: '活跃IP节点', value: '1,245,920', icon: Activity, color: '#10b981' },
  { title: '帖子与评论总量', value: '9,480,432', icon: Users, color: '#8b5cf6' },
  { title: '实时监控', value: '正常', icon: MapPin, color: '#ef4444' },
];

const recentActivities = [
  { id: 1, location: '广东', platform: '小红书', time: '刚刚', type: '新增抓取', amount: '+124 条' },
  { id: 2, location: '北京', platform: '抖音', time: '2分钟前', type: '评论采集', amount: '+892 条' },
  { id: 3, location: '浙江', platform: 'B站', time: '5分钟前', type: 'UP主分析', amount: '+45 个' },
  { id: 4, location: '上海', platform: '微博', time: '12分钟前', type: '热搜监控', amount: '+20 条' },
  { id: 5, location: '四川', platform: '快手', time: '15分钟前', type: '视频抓取', amount: '+56 条' },
  { id: 6, location: '山东', platform: '知乎', time: '20分钟前', type: '问答采集', amount: '+34 条' },
  { id: 7, location: '江苏', platform: '贴吧', time: '25分钟前', type: '帖子抓取', amount: '+108 条' },
  { id: 8, location: '湖北', platform: '抖音', time: '30分钟前', type: '评论采集', amount: '+512 条' },
  { id: 9, location: '湖南', platform: '小红书', time: '35分钟前', type: '新增抓取', amount: '+88 条' },
  { id: 10, location: '福建', platform: '微博', time: '40分钟前', type: '热搜监控', amount: '+15 条' },
];

const initMap = async () => {
  if (!mapContainerRef.value) return;

  try {
    const { data: geoJson } = await axios.get('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json');
    echarts.registerMap('china', geoJson);

    mapChart.value = echarts.init(mapContainerRef.value);

    const data = [
      { name: '广东', value: 8500 },
      { name: '浙江', value: 6100 },
      { name: '北京', value: 5200 },
      { name: '上海', value: 4500 },
      { name: '江苏', value: 4200 },
      { name: '四川', value: 3100 },
      { name: '山东', value: 2600 },
      { name: '福建', value: 2300 },
      { name: '湖南', value: 2100 },
      { name: '湖北', value: 3800 },
      { name: '河南', value: 3400 },
      { name: '辽宁', value: 1800 },
      { name: '陕西', value: 1500 },
      { name: '重庆', value: 1200 },
      { name: '江西', value: 1100 },
      { name: '广西', value: 1000 },
      { name: '安徽', value: 950 },
      { name: '河北', value: 1900 },
      { name: '天津', value: 1300 },
      { name: '黑龙江', value: 800 },
      { name: '吉林', value: 600 },
      { name: '云南', value: 750 },
      { name: '山西', value: 850 },
      { name: '内蒙古', value: 500 },
      { name: '贵州', value: 600 },
      { name: '新疆', value: 400 },
      { name: '甘肃', value: 450 },
      { name: '海南', value: 300 },
      { name: '宁夏', value: 200 },
      { name: '青海', value: 150 },
      { name: '西藏', value: 50 },
      { name: '台湾', value: 80 }
    ];

    const option = {
      title: {
        text: '全国数据抓取热力图',
        left: 'center',
        textStyle: { color: '#e5e7eb', fontSize: 16, fontWeight: 600 },
        top: '2%'
      },
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          const name = params.name || '未知区域';
          const value = params.value ? params.value.toLocaleString() : 0;
          return `${name}<br/>相关内容数: ${value}`;
        },
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: '#374151',
        textStyle: { color: '#e5e7eb' }
      },
      visualMap: {
        min: 0,
        max: 9000,
        left: '3%',
        bottom: '3%',
        text: ['高', '低'],
        calculable: true,
        inRange: {
          color: ['#1e3a8a', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899', '#ef4444']
        },
        textStyle: { color: '#9ca3af' },
        itemHeight: 100,
        itemWidth: 15
      },
      geo: {
        map: 'china',
        roam: false,
        zoom: 1.2,
        label: {
          normal: { show: false, color: 'rgba(255, 255, 255, 0.5)' },
          emphasis: { show: true, color: '#ffffff' }
        },
        itemStyle: {
          normal: {
            areaColor: '#1e293b',
            borderColor: '#334155',
            borderWidth: 1
          },
          emphasis: {
            areaColor: '#38bdf8',
            borderColor: '#bae6fd',
            borderWidth: 2,
            shadowColor: 'rgba(56, 189, 248, 0.5)',
            shadowBlur: 10
          }
        }
      },
      series: [
        {
          name: 'IP 归属地内容量',
          type: 'map',
          geoIndex: 0,
          data: data
        },
        {
          name: '高活跃核心节点',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          data: [
            { name: '广东', value: [113.2644, 23.1291, 8500] },
            { name: '北京', value: [116.4074, 39.9042, 5200] },
            { name: '上海', value: [121.4737, 31.2304, 4500] },
            { name: '浙江', value: [120.1551, 30.2741, 6100] },
            { name: '四川', value: [104.0665, 30.5723, 3100] }
          ],
          symbolSize: function (val: number[]) {
            return Math.max(val[2] / 400, 8);
          },
          showEffectOn: 'render',
          rippleEffect: { brushType: 'stroke', scale: 3 },
          itemStyle: { color: '#fbbf24', shadowBlur: 10, shadowColor: '#fbbf24' },
          zlevel: 1
        }
      ]
    };

    mapChart.value.setOption(option);
  } catch (error) {
    console.error('Failed to load map data:', error);
  } finally {
    isLoading.value = false;
  }
};

const initRightCharts = () => {
  if (pieChartRef.value) {
    pieChart.value = echarts.init(pieChartRef.value);
    pieChart.value.setOption({
      title: { 
        text: '各平台地域分布均衡度', 
        textStyle: { color: '#e5e7eb', fontSize: 14 },
        left: 'center',
        top: '2%'
      },
      tooltip: { trigger: 'item' },
      legend: { bottom: '0', textStyle: { color: '#e5e7eb', fontSize: 10 }, itemWidth: 8, itemHeight: 8 },
      series: [
        {
          name: '平台分布',
          type: 'pie',
          radius: ['40%', '65%'],
          center: ['50%', '55%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 5, borderColor: '#1f2937', borderWidth: 2 },
          label: { show: false, position: 'center' },
          emphasis: { label: { show: true, fontSize: '14', fontWeight: 'bold', color: '#fff' } },
          labelLine: { show: false },
          data: [
            { value: 40, name: '小红书', itemStyle: { color: '#ef4444' } },
            { value: 30, name: '抖音', itemStyle: { color: '#10b981' } },
            { value: 20, name: '微博', itemStyle: { color: '#f59e0b' } },
            { value: 10, name: 'B站', itemStyle: { color: '#3b82f6' } },
          ]
        }
      ]
    });
  }
};

const resizeAll = () => {
  mapChart.value?.resize();
  pieChart.value?.resize();
};

onMounted(() => {
  initMap();
  nextTick(() => {
    initRightCharts();
  });
  window.addEventListener('resize', resizeAll);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeAll);
  mapChart.value?.dispose();
  pieChart.value?.dispose();
});
</script>

<template>
  <div class="map-container">
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

    <!-- Main Content: Left Map, Right Info -->
    <div class="content-layout">
      <!-- Left: Map Chart -->
      <div class="map-card glass-panel">
        <div v-if="isLoading" class="loading-overlay">
          <div class="spinner"></div>
          <span class="loading-text">加载地图数据中...</span>
        </div>
        <div ref="mapContainerRef" class="map-wrapper" :class="{ 'opacity-0': isLoading }"></div>
      </div>

      <!-- Right: Info Panel -->
      <div class="right-panel">
        <!-- Middle Chart -->
        <div class="chart-card glass-panel">
          <div ref="pieChartRef" class="chart-container"></div>
        </div>

        <!-- Bottom List: Activity Feed -->
        <div class="activity-card glass-panel">
          <div class="activity-header">
            <Bell class="activity-icon" />
            <h3 class="activity-title">实时区域动态</h3>
          </div>
          <div class="activity-list">
            <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
              <div class="activity-info">
                <div class="activity-primary">
                  <span class="activity-location">{{ activity.location }}</span>
                  <span class="activity-divider">·</span>
                  <span class="activity-platform">{{ activity.platform }}</span>
                  <span class="activity-divider">·</span>
                  <span class="activity-type">{{ activity.type }}</span>
                </div>
                <div class="activity-time">{{ activity.time }}</div>
              </div>
              <div class="activity-amount">{{ activity.amount }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-container {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  color: var(--text-main);
  height: 100%;
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
  flex-shrink: 0;
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

.content-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
  min-height: 0;
}
@media (min-width: 1024px) {
  .content-layout {
    flex-direction: row;
  }
}

.map-card {
  flex: 5;
  min-height: 500px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.map-wrapper {
  width: 100%;
  height: 100%;
  flex: 1;
  transition: opacity 0.5s ease;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(15, 23, 42, 0.5);
  z-index: 10;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

.loading-text {
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 500;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.opacity-0 {
  opacity: 0;
}

.right-panel {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 320px;
  max-width: 100%;
}
@media (min-width: 1024px) {
  .right-panel {
    max-width: 400px;
  }
}

.chart-card {
  padding: 1rem;
  height: 240px;
  display: flex;
  flex-direction: column;
}

.chart-container {
  width: 100%;
  flex: 1;
  min-height: 0;
}

.activity-card {
  flex: 1;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  overflow: hidden;
}

.activity-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.activity-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #3b82f6;
}

.activity-title {
  font-size: 1rem;
  font-weight: 600;
  color: #e5e7eb;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  padding-right: 0.5rem;
  flex: 1;
}

.activity-list::-webkit-scrollbar {
  width: 4px;
}
.activity-list::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: rgba(255, 255, 255, 0.02);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: background-color 0.2s;
  flex-shrink: 0;
}
.activity-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.activity-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.activity-primary {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
}

.activity-location {
  color: #e5e7eb;
  font-weight: 500;
}

.activity-divider {
  color: #4b5563;
}

.activity-platform {
  color: #9ca3af;
}

.activity-type {
  color: #3b82f6;
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  background-color: rgba(59, 130, 246, 0.1);
  border-radius: 0.25rem;
}

.activity-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.activity-amount {
  font-size: 0.875rem;
  font-weight: 600;
  color: #10b981;
}
</style>