import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: localStorage.getItem('isAuth') === 'true',
    user: null as { username: string } | null,
  }),
  actions: {
    login(username: string) {
      this.isAuthenticated = true;
      this.user = { username };
      localStorage.setItem('isAuth', 'true');
    },
    logout() {
      this.isAuthenticated = false;
      this.user = null;
      localStorage.removeItem('isAuth');
    }
  }
});
