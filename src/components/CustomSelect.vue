<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ChevronDown } from 'lucide-vue-next';

interface Option {
  value: string | number | boolean | undefined;
  label: string;
}

const props = defineProps<{
  modelValue: string | number | boolean | undefined;
  options: Option[];
  placeholder?: string;
  label?: string;
}>();

const emit = defineEmits(['update:modelValue', 'change']);

const isOpen = ref(false);
const selectRef = ref<HTMLElement | null>(null);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (option: Option) => {
  emit('update:modelValue', option.value);
  emit('change', option.value);
  isOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const currentLabel = () => {
  const option = props.options.find(opt => opt.value === props.modelValue);
  return option ? option.label : props.placeholder || '请选择';
};
</script>

<template>
  <div class="custom-select-container" ref="selectRef">
    <div 
      class="select-trigger" 
      :class="{ 'is-open': isOpen }" 
      @click="toggleDropdown"
    >
      <span class="selected-label">{{ currentLabel() }}</span>
      <ChevronDown class="chevron-icon" :class="{ 'rotate-180': isOpen }" />
    </div>

    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown-menu">
        <div 
          v-for="option in options" 
          :key="String(option.value)" 
          class="dropdown-item"
          :class="{ 'is-active': option.value === modelValue }"
          @click="selectOption(option)"
        >
          {{ option.label }}
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.custom-select-container {
  position: relative;
  width: 100%;
  user-select: none;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.375rem;
  padding: 0.375rem 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 2rem;
}

.select-trigger:hover {
  border-color: rgba(59, 130, 246, 0.5);
  background-color: rgba(255, 255, 255, 0.05);
}

.select-trigger.is-open {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

.selected-label {
  font-size: 0.8125rem;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chevron-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--text-muted);
  transition: transform 0.2s ease;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.rotate-180 {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 0;
  width: 100%;
  background-color: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.25rem;
  z-index: 100;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 
              0 8px 10px -6px rgba(0, 0, 0, 0.5);
  max-height: 12rem;
  overflow-y: auto;
}

.dropdown-menu::-webkit-scrollbar {
  width: 4px;
}
.dropdown-menu::-webkit-scrollbar-track {
  background: transparent;
}
.dropdown-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.dropdown-item {
  padding: 0.375rem 0.5rem;
  font-size: 0.8125rem;
  color: #cbd5e1;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: rgba(59, 130, 246, 0.1);
  color: #ffffff;
}

.dropdown-item.is-active {
  background-color: var(--accent);
  color: #ffffff;
}

/* Dropdown Animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
