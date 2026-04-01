<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { Lock, User, LogIn } from 'lucide-vue-next';

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
          <Lock class="logo-icon" />
        </div>
        <h1 class="brand-title">MediaCrawler Pro</h1>
        <p class="brand-subtitle">数据采集与分析一体化平台</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label class="input-label">用户名</label>
          <div class="input-wrapper">
            <User class="input-icon" />
            <input v-model="username" type="text" placeholder="请输入用户名" class="base-input" />
          </div>
        </div>

        <div class="input-group">
          <label class="input-label">密码</label>
          <div class="input-wrapper">
            <Lock class="input-icon" />
            <input v-model="password" type="password" placeholder="请输入密码" class="base-input" />
          </div>
        </div>

        <button type="submit" :disabled="loading" class="btn-login">
          <span v-if="loading" class="loading-spinner"></span>
          <template v-else>
            <LogIn class="btn-icon" />
            立即登录
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
  background-color: var(--color-dark);
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

.bg-decoration-top {
  position: absolute;
  top: -10rem;
  right: -10rem;
  width: 24rem;
  height: 24rem;
  background-color: rgba(109, 40, 217, 0.2);
  border-radius: 9999px;
  filter: blur(100px);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.bg-decoration-bottom {
  position: absolute;
  bottom: -10rem;
  left: -10rem;
  width: 24rem;
  height: 24rem;
  background-color: rgba(16, 185, 129, 0.1);
  border-radius: 9999px;
  filter: blur(100px);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.login-card {
  width: 100%;
  max-width: 28rem;
  background-color: var(--color-dark-glass);
  border: 1px solid var(--color-dark-border);
  backdrop-filter: blur(40px);
  border-radius: 2rem;
  padding: 2.5rem;
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
  width: 4rem;
  height: 4rem;
  background-color: rgba(109, 40, 217, 0.2);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: inset 0 0 0 1px rgba(109, 40, 217, 0.3);
}

.logo-icon {
  width: 2rem;
  height: 2rem;
  color: var(--color-accent-hover);
}

.brand-title {
  font-size: 1.875rem;
  font-weight: 700;
  background-image: linear-gradient(to right, #a78bfa, #34d399);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.brand-subtitle {
  color: #94a3b8;
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
  color: #94a3b8;
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
  color: var(--color-accent-hover);
}

.base-input {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 0.875rem 1rem 0.875rem 3rem;
  color: #ffffff;
  outline: none;
  transition: all 0.2s;
}

.base-input:focus {
  border-color: rgba(109, 40, 217, 0.5);
  box-shadow: 0 0 0 4px rgba(109, 40, 217, 0.1);
}

.btn-login {
  width: 100%;
  background-color: var(--color-accent);
  color: #ffffff;
  font-weight: 700;
  padding: 1rem;
  border-radius: 1rem;
  border: none;
  box-shadow: 0 10px 15px -3px rgba(109, 40, 217, 0.2);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-login:hover {
  background-color: var(--color-accent-hover);
}

.btn-login:active {
  transform: scale(0.98);
}

.btn-login:disabled {
  opacity: 0.5;
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

.login-footer {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
}

.github-link {
  color: #64748b;
  transition: color 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  text-decoration: none;
}

.github-link:hover {
  color: #ffffff;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
