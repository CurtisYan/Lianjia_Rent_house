<script setup>
import { ref } from 'vue'
import { ChartBarIcon, MapIcon, BuildingOfficeIcon } from '@heroicons/vue/24/outline'

const isLoading = ref(false)

const navigation = [
  { name: '房源列表', href: '/houses', icon: BuildingOfficeIcon },
  { name: '数据分析', href: '/analysis', icon: ChartBarIcon },
  { name: '地图视图', href: '/map', icon: MapIcon },
]
</script>

<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- 导航栏 -->
    <nav class="backdrop-blur-md bg-white/80 shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="flex justify-between h-20">
          <div class="flex items-center">
            <router-link to="/houses" class="flex items-center space-x-4 group">
              <div class="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
                <BuildingOfficeIcon class="w-7 h-7 text-white" />
              </div>
              <span class="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">链家二手房数据平台</span>
            </router-link>
          </div>
          
          <div class="flex items-center space-x-2">
            <router-link 
              v-for="item in navigation" 
              :key="item.name"
              :to="item.href"
              class="px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center group transform hover:scale-105"
              :class="$route.path === item.href 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md' 
                : 'text-slate-700 hover:text-emerald-600 hover:bg-white/50 hover:shadow-sm'"
            >
              <component :is="item.icon" class="w-5 h-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
              {{ item.name }}
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区域 -->
    <main class="max-w-7xl mx-auto py-8 px-6 lg:px-8">
      <transition name="page-transition" mode="out-in">
        <router-view />
      </transition>
    </main>

    <!-- 加载指示器 -->
    <div v-if="isLoading" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white/90 backdrop-blur-md rounded-2xl p-8 flex items-center space-x-4 shadow-2xl border border-white/20">
        <div class="animate-spin rounded-full h-8 w-8 border-4 border-emerald-200 border-t-emerald-600"></div>
        <span class="text-slate-700 font-medium text-lg">加载中...</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 页面过渡动画 */
.page-transition-enter-active,
.page-transition-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 玻璃态效果 */
.backdrop-blur-md {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* 导航链接悬停效果 */
nav a {
  position: relative;
  overflow: hidden;
}

nav a::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.6s;
}

nav a:hover::before {
  left: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .max-w-7xl {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  nav .flex.space-x-2 {
    flex-direction: column;
    space-x: 0;
    gap: 0.5rem;
  }
  
  nav .h-20 {
    height: auto;
    padding: 1rem 0;
  }
  
  nav .justify-between {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
