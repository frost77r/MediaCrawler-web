<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  LayoutDashboard, 
  Activity, 
  Database, 
  Lightbulb, 
  LogOut,
  Menu,
  X,
  PieChart,
  Map as MapIcon
} from 'lucide-vue-next';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const isSidebarOpen = ref(true);

const navItems = [
  { name: '仪表盘', path: '/', icon: LayoutDashboard },
  { name: '调度中心', path: '/dispatch', icon: Activity },
  { name: '数据展示', path: '/data', icon: Database },
  { name: '线索展示', path: '/clue', icon: Lightbulb },
  { name: '数据分析', path: '/analysis', icon: PieChart },
  { name: 'IP分布地图', path: '/map', icon: MapIcon },
];

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>

<template>
  <div class="layout-container">
    <!-- Sidebar -->
    <aside :class="['sidebar', isSidebarOpen ? 'sidebar-open' : 'sidebar-closed']">
      <!-- Sidebar Header -->
      <div class="sidebar-header">
        <div class="logo-box">
          <Activity class="logo-icon" />
        </div>
        <span v-if="isSidebarOpen" class="brand-name">
          慧眸
        </span>
      </div>

      <!-- Navigation -->
      <nav class="nav-container">
        <router-link 
          v-for="item in navItems" 
          :key="item.path"
          :to="item.path"
          class="nav-link group"
          :class="[route.path === item.path ? 'nav-link-active' : 'nav-link-inactive']"
        >
          <div v-if="route.path === item.path" class="active-indicator"></div>
          <component :is="item.icon" :class="['nav-icon', route.path === item.path ? 'icon-active' : 'icon-inactive']" />
          <span v-if="isSidebarOpen" class="nav-text">{{ item.name }}</span>
          
          <!-- Tooltip for closed sidebar -->
          <div v-if="!isSidebarOpen" class="sidebar-tooltip">
            {{ item.name }}
          </div>
        </router-link>
      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn group">
          <LogOut class="logout-icon" />
          <span v-if="isSidebarOpen" class="logout-text">退出登录</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="main-wrapper">
      <!-- Top Header -->
      <header class="top-header">
        <div class="header-left">
          <button @click="toggleSidebar" class="toggle-btn">
            <Menu v-if="!isSidebarOpen" class="toggle-icon" />
            <X v-else class="toggle-icon" />
          </button>
          <div class="header-divider"></div>
          <h2 class="page-title">
            {{ navItems.find(i => i.path === route.path)?.name || '系统中心' }}
          </h2>
        </div>

        <div class="header-right">
          <div class="time-display">
            {{ new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }) }}
          </div>
          <div class="user-badge">
            <div class="user-avatar">
              A
            </div>
            <div class="user-info">
              <span class="user-name">Admin</span>
              <span class="user-status">在线</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="page-content">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  background-color: var(--bg-dark);
  color: var(--text-main);
  overflow: hidden;
}

.sidebar {
  background-color: var(--glass-bg);
  border-right: 1px solid var(--glass-border);
  transition: width 0.3s;
  z-index: 30;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-open { width: 16rem; }
.sidebar-closed { width: 5rem; }

.sidebar-header {
  height: 4rem;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  border-bottom: 1px solid var(--glass-border);
  flex-shrink: 0;
  overflow: hidden;
}

.logo-box {
  width: 2rem;
  height: 2rem;
  background-color: rgba(59, 130, 246, 0.15);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.logo-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-accent);
}

.brand-name {
  margin-left: 0.75rem;
  font-weight: 700;
  font-size: 1.125rem;
  white-space: nowrap;
  color: #fff;
  letter-spacing: 0.05em;
}

.nav-container {
  flex: 1 1 0%;
  padding: 1.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  position: relative;
  text-decoration: none;
}

.active-indicator {
  position: absolute;
  left: 0;
  top: 15%;
  bottom: 15%;
  width: 4px;
  background-color: var(--color-accent);
  border-radius: 0 4px 4px 0;
}

.nav-link-active {
  background-color: rgba(59, 130, 246, 0.1);
  color: #ffffff;
}

.nav-link-inactive {
  color: var(--text-muted);
}

.nav-link-inactive:hover {
  background-color: rgba(255, 255, 255, 0.03);
  color: #ffffff;
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  transition: color 0.2s;
}

.icon-active { color: var(--color-accent); }
.icon-inactive { color: var(--text-muted); }
.nav-link:hover .icon-inactive { color: #fff; }

.nav-text {
  margin-left: 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  letter-spacing: 0.025em;
}

.sidebar-tooltip {
  position: absolute;
  left: 100%;
  margin-left: 1rem;
  padding: 0.5rem 0.75rem;
  background-color: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  white-space: nowrap;
  z-index: 50;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
}

.nav-link:hover .sidebar-tooltip { opacity: 1; }

.sidebar-footer {
  padding: 0.75rem;
  border-top: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--text-muted);
  background-color: transparent;
  border: none;
  border-radius: 0.5rem;
  transition: all 0.2s;
  cursor: pointer;
}

.logout-btn:hover {
  color: var(--danger);
  background-color: rgba(239, 68, 68, 0.1);
}

.logout-icon { width: 1.25rem; height: 1.25rem; flex-shrink: 0; }
.logout-text { margin-left: 1rem; font-weight: 600; font-size: 0.875rem; }

.main-wrapper {
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  background-color: transparent;
}

.top-header {
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  background-color: var(--glass-bg);
  border-bottom: 1px solid var(--glass-border);
  z-index: 20;
  flex-shrink: 0;
}

.header-left { display: flex; align-items: center; gap: 1rem; }

.toggle-btn {
  padding: 0.5rem;
  background-color: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn:hover { background-color: rgba(255, 255, 255, 0.05); }
.toggle-icon { width: 1.25rem; height: 1.25rem; color: var(--text-muted); }

.header-divider {
  height: 1.25rem; width: 1px; background-color: var(--glass-border); margin: 0 0.5rem;
}

.page-title {
  font-size: 1rem; font-weight: 600; color: #ffffff; letter-spacing: 0.025em;
}

.header-right { display: flex; align-items: center; gap: 1.5rem; }

.time-display {
  font-size: 0.8125rem;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.03);
  padding: 0.375rem 1rem;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  display: none;
}
@media (min-width: 768px) {
  .time-display { display: block; }
}

.user-badge {
  display: flex; align-items: center; gap: 0.75rem;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0.25rem 0.75rem 0.25rem 0.25rem;
  border-radius: 9999px;
}

.user-avatar {
  width: 2rem; height: 2rem;
  background-color: var(--color-accent);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #ffffff; font-weight: 700; font-size: 0.875rem;
}

.user-info { display: flex; flex-direction: column; }
.user-name { font-size: 0.75rem; font-weight: 600; color: #ffffff; line-height: 1; margin-bottom: 0.125rem; }
.user-status { font-size: 10px; color: var(--success); font-weight: 500; }

.page-content {
  flex: 1 1 0%;
  overflow-y: auto;
  position: relative;
  padding: 0;
}

/* Transitions */
.page-enter-active, .page-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.page-enter-from, .page-leave-to { opacity: 0; transform: translateY(10px); }
</style>
