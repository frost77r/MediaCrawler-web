<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { Lock, User, LogIn, Activity } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('admin');
const password = ref('admin123');
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  setTimeout(() => {
    authStore.login(username.value);
    router.push('/');
    loading.value = false;
  }, 1000);
};
</script>

<template>
  <div class="login-container">
    <!-- Decorative background -->
    <div class="bg-decoration-top"></div>
    <div class="bg-decoration-bottom"></div>

    <div class="login-card">
      <div class="login-header">
        <div class="logo-wrapper">
          <Activity class="logo-icon" />
        </div>
        <h1 class="brand-title">慧眸系统</h1>
        <p class="brand-subtitle">舆情数据采集与预警分析指挥中心</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label class="input-label">系统账号</label>
          <div class="input-wrapper">
            <User class="input-icon" />
            <input v-model="username" type="text" placeholder="请输入管理员账号" class="base-input" />
          </div>
        </div>

        <div class="input-group">
          <label class="input-label">安全密码</label>
          <div class="input-wrapper">
            <Lock class="input-icon" />
            <input v-model="password" type="password" placeholder="请输入您的密码" class="base-input" />
          </div>
        </div>

        <button type="submit" :disabled="loading" class="btn-login">
          <span v-if="loading" class="loading-spinner"></span>
          <template v-else>
            <LogIn class="btn-icon" />
            进入指挥中心
          </template>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-dark);
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

.bg-decoration-top {
  position: absolute;
  top: -20rem;
  right: -10rem;
  width: 40rem;
  height: 40rem;
  background-image: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 60%);
  border-radius: 50%;
  pointer-events: none;
}

.bg-decoration-bottom {
  position: absolute;
  bottom: -20rem;
  left: -10rem;
  width: 40rem;
  height: 40rem;
  background-image: radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 60%);
  border-radius: 50%;
  pointer-events: none;
}

.login-card {
  width: 100%;
  max-width: 26rem;
  background-color: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
  border-radius: 1rem;
  padding: 3rem 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  z-index: 10;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2.5rem;
  text-align: center;
}

.logo-wrapper {
  width: 3.5rem;
  height: 3.5rem;
  background-color: rgba(59, 130, 246, 0.1);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.logo-icon {
  width: 1.75rem;
  height: 1.75rem;
  color: var(--accent);
}

.brand-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.05em;
}

.brand-subtitle {
  color: var(--text-muted);
  margin-top: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-left: 0.25rem;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #64748b;
  transition: color 0.2s;
}

.input-wrapper:focus-within .input-icon {
  color: var(--accent);
}

.base-input {
  width: 100%;
  background-color: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 0.875rem 1rem 0.875rem 3rem;
  color: #ffffff;
  outline: none;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.base-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.btn-login {
  width: 100%;
  background-color: var(--accent);
  color: #ffffff;
  font-weight: 600;
  padding: 0.875rem;
  border-radius: 0.75rem;
  border: none;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-login:hover {
  background-color: var(--accent-hover);
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
}

.btn-login:active {
  transform: scale(0.98);
}

.btn-login:disabled {
  background-color: #334155;
  color: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
}

.loading-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 9999px;
  animation: spin 1s linear infinite;
}

.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.2s;
}

.btn-login:hover .btn-icon {
  transform: translateX(0.25rem);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
