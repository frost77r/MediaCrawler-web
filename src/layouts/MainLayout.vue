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
  X
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
          MediaCrawler
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
      <!-- Background Decoration -->
      <div class="bg-decoration"></div>

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
  background-color: var(--color-dark);
  color: #e2e8f0;
  overflow: hidden;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
}

.sidebar {
  background-color: var(--color-dark-glass);
  border-right: 1px solid var(--color-dark-border);
  backdrop-filter: blur(24px);
  transition: width 0.3s;
  z-index: 30;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-open {
  width: 16rem;
}

.sidebar-closed {
  width: 5rem;
}

.sidebar-header {
  height: 5rem;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  border-bottom: 1px solid var(--color-dark-border);
  flex-shrink: 0;
  overflow: hidden;
}

.logo-box {
  width: 2.5rem;
  height: 2.5rem;
  background-color: rgba(109, 40, 217, 0.2);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--color-accent-hover);
}

.brand-name {
  margin-left: 0.75rem;
  font-weight: 700;
  font-size: 1.25rem;
  white-space: nowrap;
  background-image: linear-gradient(to right, #a78bfa, #34d399);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
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
  padding: 0.875rem 1rem;
  border-radius: 1rem;
  transition: all 0.2s;
  position: relative;
  text-decoration: none;
}

.nav-link-active {
  background-color: var(--color-accent);
  color: #ffffff;
  box-shadow: 0 10px 15px -3px rgba(109, 40, 217, 0.2);
}

.nav-link-inactive {
  color: #94a3b8;
}

.nav-link-inactive:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.nav-link:hover .nav-icon {
  transform: scale(1.1);
}

.nav-text {
  margin-left: 1rem;
  font-weight: 700;
  font-size: 0.875rem;
  letter-spacing: 0.025em;
}

.sidebar-tooltip {
  position: absolute;
  left: 100%;
  margin-left: 1rem;
  padding: 0.5rem 0.75rem;
  background-color: var(--color-dark-glass);
  border: 1px solid var(--color-dark-border);
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  white-space: nowrap;
  z-index: 50;
}

.nav-link:hover .sidebar-tooltip {
  opacity: 1;
}

.sidebar-footer {
  padding: 0.75rem;
  border-top: 1px solid var(--color-dark-border);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0.875rem 1rem;
  color: #94a3b8;
  background-color: transparent;
  border: none;
  border-radius: 1rem;
  transition: all 0.2s;
  position: relative;
  cursor: pointer;
}

.logout-btn:hover {
  color: #fb7185;
  background-color: rgba(244, 63, 94, 0.05);
}

.logout-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.logout-btn:hover .logout-icon {
  transform: translateX(-0.25rem);
}

.logout-text {
  margin-left: 1rem;
  font-weight: 700;
  font-size: 0.875rem;
  letter-spacing: 0.025em;
}

.main-wrapper {
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.bg-decoration {
  position: absolute;
  top: -10rem;
  right: -10rem;
  width: 37.5rem;
  height: 37.5rem;
  background-color: rgba(109, 40, 217, 0.05);
  border-radius: 9999px;
  filter: blur(120px);
  pointer-events: none;
}

.top-header {
  height: 5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  background-color: rgba(25, 28, 41, 0.5);
  border-bottom: 1px solid var(--color-dark-border);
  backdrop-filter: blur(12px);
  z-index: 20;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.toggle-btn {
  padding: 0.5rem;
  background-color: transparent;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toggle-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.toggle-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #94a3b8;
}

.header-divider {
  height: 1.5rem;
  width: 1px;
  background-color: var(--color-dark-border);
  margin: 0 0.5rem;
}

.page-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.025em;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0.375rem 1rem 0.375rem 0.5rem;
  border-radius: 9999px;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  background-image: linear-gradient(to top right, var(--color-accent), #10b981);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.875rem;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.75rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
}

.user-status {
  font-size: 10px;
  color: #34d399;
  font-weight: 500;
  margin-top: 0.25rem;
}

.page-content {
  flex: 1 1 0%;
  overflow-y: auto;
  position: relative;
  padding: 0;
}

/* Transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}
</style>
