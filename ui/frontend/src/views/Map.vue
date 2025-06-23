<template>
  <div class="min-h-screen">
    <!-- 页面标题 -->
    <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0 mb-8">
      <div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">地图视图</h1>
        <p class="text-slate-600 mt-3 text-lg">房产数据地理分布可视化，直观展示区域价格分布</p>
      </div>
      <div class="flex space-x-3">
        <button class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg flex items-center">
          <MapIcon class="w-5 h-5 mr-2" />
          切换视图
        </button>
        <button class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg flex items-center">
          <ArrowPathIcon class="w-5 h-5 mr-2" />
          刷新地图
        </button>
      </div>
    </div>

    <!-- 地图容器 -->
    <div class="bg-white rounded-2xl shadow-lg border border-white/20 backdrop-blur-sm overflow-hidden mb-8">
      <div class="h-[600px] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
        <!-- 背景装饰 -->
        <div class="absolute inset-0 opacity-5">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" stroke-width="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div class="text-center z-10">
          <div class="w-24 h-24 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MapIcon class="w-12 h-12 text-white" />
          </div>
          <h3 class="text-2xl font-bold text-slate-800 mb-4">地图功能开发中</h3>
          <p class="text-slate-600 text-lg mb-6">正在集成高德地图或百度地图 API</p>
          <div class="flex flex-wrap justify-center gap-3">
            <span class="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-sm font-medium">
              🗺️ 地理分布展示
            </span>
            <span class="px-4 py-2 bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 rounded-full text-sm font-medium">
              🔥 价格热力图
            </span>
            <span class="px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full text-sm font-medium">
              📍 房源定位
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 地图工具栏 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- 热力图控制 -->
      <div class="bg-white rounded-2xl p-8 shadow-lg border border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
        <div class="flex items-center mb-6">
          <div class="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mr-4">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-slate-800">热力图模式</h3>
        </div>
        <div class="space-y-4">
          <label class="flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
            <input type="radio" name="heatmap" value="price" class="mr-4 text-emerald-600 focus:ring-emerald-400" checked />
            <div class="flex items-center">
              <div class="w-3 h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mr-3"></div>
              <span class="font-medium text-slate-700">价格热力图</span>
            </div>
          </label>
          <label class="flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
            <input type="radio" name="heatmap" value="density" class="mr-4 text-emerald-600 focus:ring-emerald-400" />
            <div class="flex items-center">
              <div class="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></div>
              <span class="font-medium text-slate-700">房源密度</span>
            </div>
          </label>
          <label class="flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
            <input type="radio" name="heatmap" value="transaction" class="mr-4 text-emerald-600 focus:ring-emerald-400" />
            <div class="flex items-center">
              <div class="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mr-3"></div>
              <span class="font-medium text-slate-700">交易活跃度</span>
            </div>
          </label>
        </div>
      </div>

      <!-- 地图图层控制 -->
      <div class="bg-white rounded-2xl p-8 shadow-lg border border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
        <div class="flex items-center mb-6">
          <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-4">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-slate-800">图层控制</h3>
        </div>
        <div class="space-y-4">
          <label class="flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
            <input type="checkbox" class="mr-4 text-emerald-600 focus:ring-emerald-400 rounded" checked />
            <div class="flex items-center">
              <div class="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mr-3"></div>
              <span class="font-medium text-slate-700">地铁线路</span>
            </div>
          </label>
          <label class="flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
            <input type="checkbox" class="mr-4 text-emerald-600 focus:ring-emerald-400 rounded" checked />
            <div class="flex items-center">
              <div class="w-3 h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mr-3"></div>
              <span class="font-medium text-slate-700">学校分布</span>
            </div>
          </label>
          <label class="flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
            <input type="checkbox" class="mr-4 text-emerald-600 focus:ring-emerald-400 rounded" />
            <div class="flex items-center">
              <div class="w-3 h-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mr-3"></div>
              <span class="font-medium text-slate-700">商圈位置</span>
            </div>
          </label>
          <label class="flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
            <input type="checkbox" class="mr-4 text-emerald-600 focus:ring-emerald-400 rounded" />
            <div class="flex items-center">
              <div class="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mr-3"></div>
              <span class="font-medium text-slate-700">医院设施</span>
            </div>
          </label>
        </div>
      </div>

      <!-- 筛选条件 -->
      <div class="bg-white rounded-2xl p-8 shadow-lg border border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
        <div class="flex items-center mb-6">
          <div class="w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center mr-4">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-slate-800">筛选条件</h3>
        </div>
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-3">价格范围</label>
            <select class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
              <option>全部价格</option>
              <option>1000-3000元</option>
              <option>3000-5000元</option>
              <option>5000-8000元</option>
              <option>8000元以上</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-3">房型筛选</label>
            <select class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
              <option>全部户型</option>
              <option>一居室</option>
              <option>二居室</option>
              <option>三居室</option>
              <option>四居及以上</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-3">区域选择</label>
            <select class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
              <option>全部区域</option>
              <option>天河区</option>
              <option>海珠区</option>
              <option>越秀区</option>
              <option>荔湾区</option>
            </select>
          </div>
          <button class="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg">
            应用筛选
          </button>
        </div>
      </div>
    </div>

    <!-- 功能说明卡片 -->
    <div class="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
      <div class="flex items-center mb-4">
        <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-slate-800">即将上线的功能</h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <h4 class="font-semibold text-slate-700 mb-2">🗺️ 实时地图</h4>
          <p class="text-slate-600 text-sm">集成高德地图，实时显示房源位置</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <h4 class="font-semibold text-slate-700 mb-2">🔥 价格热力图</h4>
          <p class="text-slate-600 text-sm">可视化展示各区域价格分布</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <h4 class="font-semibold text-slate-700 mb-2">🚇 交通便利度</h4>
          <p class="text-slate-600 text-sm">显示地铁站点和公交路线</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <h4 class="font-semibold text-slate-700 mb-2">🏫 周边设施</h4>
          <p class="text-slate-600 text-sm">学校、医院、商场等设施标注</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <h4 class="font-semibold text-slate-700 mb-2">📊 区域分析</h4>
          <p class="text-slate-600 text-sm">点击区域查看详细数据分析</p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <h4 class="font-semibold text-slate-700 mb-2">🎯 智能推荐</h4>
          <p class="text-slate-600 text-sm">基于地理位置的房源推荐</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MapIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
</script>

<style scoped>
/* 自定义复选框和单选框样式 */
input[type="checkbox"]:checked,
input[type="radio"]:checked {
  background-color: #10b981;
  border-color: #10b981;
}

/* 悬停效果 */
.hover\:shadow-xl:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* 渐变背景动画 */
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradientShift 6s ease infinite;
}
</style> 