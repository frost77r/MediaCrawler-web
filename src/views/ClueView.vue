<script setup lang="ts">
import { Lightbulb, Construction } from 'lucide-vue-next';
</script>

<template>
  <div class="clueview-container">
    <!-- Header -->
    <div class="clueview-header">
      <div class="header-info">
        <h3 class="header-title">线索展示</h3>
        <p class="header-desc">智能分析潜在商机与线索，挖掘高价值数据内容</p>
      </div>

      <div class="module-status">
        <Lightbulb class="status-icon" />
        <span>模块开发中</span>
      </div>
    </div>

    <!-- Placeholder Content -->
    <main class="clueview-content group">
      <!-- Background Effect -->
      <div class="bg-gradient-effect"></div>

      <div class="placeholder-wrapper">
        <div class="icon-box">
          <Construction class="placeholder-icon" />
        </div>
        <h4 class="placeholder-title">模块建设中...</h4>
        <p class="placeholder-desc">
          我们正在开发更强大的线索提取与商机洞察算法。该模块将帮助您从海量数据中自动识别高质量线索。
        </p>
        
        <div class="loading-dots">
          <div v-for="i in 3" :key="i" class="dot" :style="{ animationDelay: `${i * 0.2}s` }"></div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.clueview-container {
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  overflow: hidden;
}

.clueview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #fbbf24;
  letter-spacing: -0.025em;
  margin-bottom: 0.5rem;
}

.header-desc {
  color: #94a3b8;
  font-weight: 500;
  font-style: italic;
}

.module-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #fbbf24;
  padding: 0.625rem 1.5rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 700;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.status-icon {
  width: 1rem;
  height: 1rem;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.clueview-content {
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--color-dark-glass);
  border: 1px solid var(--color-dark-border);
  border-radius: 2.5rem;
  padding: 2rem;
  backdrop-filter: blur(12px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  position: relative;
}

.bg-gradient-effect {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(to top right, rgba(245, 158, 11, 0.05), transparent);
  opacity: 0;
  transition: opacity 1s;
}

.clueview-content:hover .bg-gradient-effect {
  opacity: 1;
}

.placeholder-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 28rem;
  z-index: 10;
  transform: scale(1);
  transition: transform 0.7s;
}

.clueview-content:hover .placeholder-wrapper {
  transform: scale(1.05);
}

.icon-box {
  width: 6rem;
  height: 6rem;
  background-color: rgba(245, 158, 11, 0.1);
  border-radius: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  border: 1px solid rgba(245, 158, 11, 0.3);
  box-shadow: 0 25px 50px -12px rgba(245, 158, 11, 0.2);
}

.placeholder-icon {
  width: 3rem;
  height: 3rem;
  color: #fbbf24;
  animation: bounce 1s infinite;
}

.placeholder-title {
  font-size: 1.875rem;
  font-weight: 900;
  color: #ffffff;
  margin-bottom: 1.5rem;
}

.placeholder-desc {
  color: #94a3b8;
  font-weight: 500;
  font-size: 1.125rem;
  line-height: 1.625;
}

.loading-dots {
  margin-top: 3rem;
  display: flex;
  gap: 1rem;
}

.dot {
  width: 0.375rem;
  height: 0.375rem;
  background-color: rgba(245, 158, 11, 0.4);
  border-radius: 9999px;
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>
