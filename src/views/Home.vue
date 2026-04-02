<script setup lang="ts">
import { useRouter } from 'vue-router';
import { 
  ChevronRight,
  Database,
  Activity,
  Lightbulb
} from 'lucide-vue-next';

const router = useRouter();

const menuItems = [
  {
    id: 'dispatch',
    title: '调度中心',
    desc: '配置爬虫参数，实时监控运行状态和控制台日志',
    icon: Activity,
    color: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
    borderColor: 'hover:border-violet-500/40',
    shadowColor: 'hover:shadow-violet-500/10',
    path: '/dispatch'
  },
  {
    id: 'data',
    title: '数据展示',
    desc: '浏览已采集的帖子、视频及评论数据，支持多平台查询',
    icon: Database,
    color: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    borderColor: 'hover:border-emerald-500/40',
    shadowColor: 'hover:shadow-emerald-500/10',
    path: '/data'
  },
  {
    id: 'clue',
    title: '线索展示',
    desc: '智能分析潜在商机与线索，挖掘高价值数据内容',
    icon: Lightbulb,
    color: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    borderColor: 'hover:border-amber-500/40',
    shadowColor: 'hover:shadow-amber-500/10',
    path: '/clue'
  }
];

const navigateTo = (path: string) => {
  router.push(path);
};
</script>

<template>
  <div class="home-container">
    <!-- Welcome Header -->
    <div class="welcome-header">
      <h2 class="welcome-title">
        欢迎回来，<span class="gradient-text">系统管理员</span>
      </h2>
      <p class="welcome-desc">
        慧眸 调度指挥中心。请从下方选择您需要进入的业务模块。
      </p>
    </div>

    <!-- Menu Grid -->
    <div class="menu-grid">
      <div 
        v-for="item in menuItems" 
        :key="item.id"
        @click="navigateTo(item.path)"
        class="menu-card group"
        :class="[item.borderColor, item.shadowColor]"
      >
        <!-- Background Decoration -->
        <div class="card-bg-decoration"></div>

        <!-- Icon Container -->
        <div class="icon-container" :class="item.color">
          <component :is="item.icon" class="icon" :class="item.iconColor" />
        </div>

        <!-- Content -->
        <div class="card-content">
          <h3 class="card-title">
            {{ item.title }}
          </h3>
          <p class="card-desc">
            {{ item.desc }}
          </p>
        </div>

        <!-- Footer Action -->
        <div class="card-footer">
          <span>进入模块</span>
          <ChevronRight class="footer-icon" />
        </div>
      </div>
    </div>

    <!-- Quick Stats Placeholder -->
    <div class="stats-grid">
      <div v-for="i in 4" :key="i" class="stats-card">
        <div class="stats-label">系统指标 {{ i }}</div>
        <div class="stats-value">--</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 80rem;
  margin-left: auto;
  margin-right: auto;
  padding: 3rem 1.5rem;
}

.welcome-header {
  margin-bottom: 4rem;
}

.welcome-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.025em;
  margin-bottom: 1rem;
}

.gradient-text {
  background-image: linear-gradient(to right, #a78bfa, #34d399);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.welcome-desc {
  color: #94a3b8;
  font-size: 1.125rem;
  max-width: 42rem;
  font-weight: 500;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 2rem;
}

@media (min-width: 768px) {
  .menu-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.menu-card {
  position: relative;
  padding: 2.5rem;
  background-color: var(--color-dark-glass);
  border: 1px solid var(--color-dark-border);
  border-radius: 2.5rem;
  backdrop-filter: blur(24px);
  transition: all 0.5s;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.menu-card:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  transform: translateY(-0.5rem);
}

.card-bg-decoration {
  position: absolute;
  right: -2.5rem;
  bottom: -2.5rem;
  width: 10rem;
  height: 10rem;
  background-color: rgba(109, 40, 217, 0.05);
  border-radius: 9999px;
  filter: blur(40px);
  transition: background-color 0.5s;
}

.menu-card:hover .card-bg-decoration {
  background-color: rgba(109, 40, 217, 0.1);
}

.icon-container {
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
  transition: all 0.5s;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-card:hover .icon-container {
  transform: scale(1.1) rotate(3deg);
}

.icon {
  width: 2rem;
  height: 2rem;
}

.card-content {
  flex: 1 1 0%;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1rem;
  transition: color 0.5s;
}

.menu-card:hover .card-title {
  color: var(--color-accent-hover);
}

.card-desc {
  color: #94a3b8;
  line-height: 1.625;
  font-weight: 500;
}

.card-footer {
  margin-top: 2.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #64748b;
  transition: color 0.5s;
}

.menu-card:hover .card-footer {
  color: #ffffff;
}

.footer-icon {
  width: 1rem;
  height: 1rem;
  transition: transform 0.5s;
}

.menu-card:hover .footer-icon {
  transform: translateX(0.25rem);
}

.stats-grid {
  margin-top: 4rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.stats-card {
  padding: 1.5rem;
  background-color: var(--color-dark-glass);
  border: 1px solid var(--color-dark-border);
  border-radius: 1.5rem;
  backdrop-filter: blur(4px);
}

.stats-label {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}

.stats-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
}
</style>
