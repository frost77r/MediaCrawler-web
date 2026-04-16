<script setup lang="ts">
import { ref, onMounted, onUnmounted, shallowRef } from 'vue';
import * as echarts from 'echarts';
import axios from 'axios';
import { MapPin, Users, Globe2, Activity } from 'lucide-vue-next';

const mapContainerRef = ref<HTMLElement | null>(null);
const mapChart = shallowRef<echarts.ECharts | null>(null);
const isLoading = ref(true);

const stats = [
  { title: '覆盖地域', value: '34 省/直辖市', icon: Globe2, color: '#3b82f6' },
  { title: '活跃IP节点', value: '1,245,920', icon: Activity, color: '#10b981' },
  { title: '帖子与评论总量', value: '9,480,432', icon: Users, color: '#8b5cf6' },
  { title: '实时监控', value: '正常', icon: MapPin, color: '#ef4444' },
];

const initMap = async () => {
  if (!mapContainerRef.value) return;

  try {
    // 尝试获取中国地图 GeoJSON (Aliyun DataV)
    const { data: geoJson } = await axios.get('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json');
    echarts.registerMap('china', geoJson);

    mapChart.value = echarts.init(mapContainerRef.value);

    // 模拟基于帖子的各省市 IP 活跃数据
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
      { name: '新疆', value: 200 },
      { name: '台湾', value: 80 }
    ];

    const option = {
      title: {
        text: '全网抓取内容 IP 归属地热力分布',
        left: 'center',
        textStyle: { color: '#e5e7eb', fontSize: 20, fontWeight: 600 },
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
        left: '5%',
        bottom: '5%',
        text: ['高', '低'],
        calculable: true,
        inRange: {
          color: ['#1e3a8a', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899', '#ef4444']
        },
        textStyle: { color: '#9ca3af' },
        itemHeight: 120
      },
      geo: {
        map: 'china',
        roam: true,
        scaleLimit: { min: 1, max: 4 },
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
            return Math.max(val[2] / 300, 10);
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

const resizeMap = () => {
  mapChart.value?.resize();
};

onMounted(() => {
  initMap();
  window.addEventListener('resize', resizeMap);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeMap);
  mapChart.value?.dispose();
});
</script>

<template>
  <div class="map-container">
    <div class="header">
      <h1 class="title">IP 地图追踪</h1>
      <p class="subtitle">直观展示海量抓取帖子、视频与评论的 IP 归属地热力分布，监控高热度区域。</p>
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

    <!-- Map Chart -->
    <div class="map-card glass-panel">
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner"></div>
        <span class="loading-text">加载地图数据中...</span>
      </div>
      <div ref="mapContainerRef" class="map-wrapper" :class="{ 'opacity-0': isLoading }"></div>
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

.header {
  margin-bottom: 0.5rem;
  flex-shrink: 0;
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

.map-card {
  flex: 1;
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
</style>
