<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- 页面标题和筛选器 -->
    <div class="bg-white rounded-2xl p-8 shadow-lg border border-white/20 backdrop-blur-sm">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">房源列表</h1>
          <p class="text-slate-600 mt-2 text-lg">{{ getLocationDisplay() }} - 共找到 <span class="font-semibold text-emerald-600">{{ filteredHouses.length }}</span> 套房源</p>
          <p v-if="lastUpdateTime" class="text-sm text-slate-500 mt-1 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            数据更新时间: {{ lastUpdateTime }}
          </p>
        </div>
        
        <!-- 筛选器和更新按钮 -->
        <div class="flex flex-wrap gap-3 items-center">
          <select 
            v-model="selectedCity" 
            @change="changeCity"
            class="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <option v-for="city in cities" :key="city.code" :value="city.code">{{ city.name }}</option>
          </select>
          
          <!-- 地区横排按钮 -->
          <div class="flex flex-wrap gap-2">
            <button 
              @click="selectedArea = ''"
              :class="[
                'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105',
                selectedArea === '' 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-sm'
              ]"
            >
              不限
            </button>
            <button 
              v-for="area in availableAreas" 
              :key="area"
              @click="selectedArea = area"
              :class="[
                'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105',
                selectedArea === area 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-sm'
              ]"
            >
              {{ area }}
            </button>
          </div>
          
          <select 
            v-model="selectedHouseType"
            class="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <option value="">户型</option>
            <option v-for="type in houseTypes" :key="type" :value="type">{{ type }}</option>
          </select>
          
          <!-- 搜索框 -->
          <div class="relative">
            <input 
              v-model="searchKeyword"
              type="text" 
              placeholder="搜索房源标题..." 
              class="pl-4 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 w-52 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
            />
            <button 
              v-if="searchKeyword"
              @click="clearSearch"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- 更新数据按钮 -->
          <button 
            @click="updateData"
            :disabled="isUpdating"
            :class="[
              'px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 transform hover:scale-105',
              isUpdating 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg'
            ]"
          >
            <svg v-if="isUpdating" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span>{{ isUpdating ? '更新中...' : '更新数据' }}</span>
          </button>
        </div>
      </div>

      <!-- 朝向筛选 -->
      <div class="mt-6">
        <div class="flex items-center space-x-3">
          <span class="text-sm font-semibold text-slate-700 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4h10l2 16H5L7 4z"></path>
            </svg>
            朝向
          </span>
          <div class="flex flex-wrap gap-2">
            <button 
              @click="selectedDirection = ''"
              :class="[
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                selectedDirection === '' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              ]"
            >
              不限
            </button>
            <button 
              v-for="direction in directions" 
              :key="direction"
              @click="selectedDirection = direction"
              :class="[
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                selectedDirection === direction 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              ]"
            >
              {{ direction }}
            </button>
          </div>
        </div>
      </div>

      <!-- 价格筛选 -->
      <div class="mt-6">
        <div class="flex items-center space-x-3 mb-3">
          <span class="text-sm font-semibold text-slate-700 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
            租金
          </span>
          <div class="flex flex-wrap gap-2">
            <button 
              @click="selectedPriceRange = ''"
              :class="[
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                selectedPriceRange === '' 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              ]"
            >
              不限
            </button>
            <button 
              v-for="range in priceRanges" 
              :key="range.value"
              @click="selectedPriceRange = range.value"
              :class="[
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                selectedPriceRange === range.value 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              ]"
            >
              {{ range.label }}
            </button>
          </div>
        </div>
        
        <!-- 自定义价格 -->
        <div class="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl">
          <span class="text-sm text-slate-600 font-medium">自定义:</span>
          <input 
            v-model="customMinPrice"
            type="number" 
            placeholder="最低价格"
            class="px-3 py-2 w-28 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-white"
          />
          <span class="text-sm text-slate-600">-</span>
          <input 
            v-model="customMaxPrice"
            type="number" 
            placeholder="最高价格"
            class="px-3 py-2 w-28 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-white"
          />
          <span class="text-sm text-slate-600">元</span>
          <button 
            @click="applyCustomPrice"
            class="px-4 py-2 text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-sm"
          >
            确定
          </button>
          <button 
            v-if="customMinPrice || customMaxPrice"
            @click="clearCustomPrice"
            class="px-4 py-2 text-sm bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-all duration-200"
          >
            清空
          </button>
        </div>
      </div>
    </div>

    <!-- 房源列表 -->
    <div class="bg-white rounded-2xl shadow-lg border border-white/20 backdrop-blur-sm mt-6">
      <div v-if="filteredHouses.length === 0" class="p-12 text-center">
        <div class="text-slate-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
        </div>
        <p class="text-slate-500 text-lg">暂无房源数据</p>
      </div>
      
      <div v-else class="divide-y divide-slate-100">
        <div 
          v-for="(house, index) in paginatedHouses" 
          :key="index"
          class="p-8 hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent transition-all duration-300 border-l-4 border-transparent hover:border-emerald-400"
        >
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <!-- 房源信息 -->
            <div class="flex-1 space-y-3">
              <h3 class="text-xl font-bold text-slate-800 mb-3">
                <a 
                  v-if="house.link && house.link !== 'null'"
                  :href="house.link" 
                  target="_blank"
                  class="text-slate-800 hover:text-emerald-600 hover:underline transition-colors duration-200"
                >
                  {{ house.title }}
                </a>
                <span v-else>{{ house.title }}</span>
              </h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
                <div class="flex items-center"><span class="font-semibold text-slate-700">区域:</span><span class="ml-1">{{ house.area }}</span></div>
                <div class="flex items-center"><span class="font-semibold text-slate-700">地块:</span><span class="ml-1">{{ house.block }}</span></div>
                <div class="flex items-center"><span class="font-semibold text-slate-700">小区:</span><span class="ml-1">{{ house.community }}</span></div>
                <div class="flex items-center"><span class="font-semibold text-slate-700">户型:</span><span class="ml-1">{{ house.houseType }}</span></div>
                <div class="flex items-center"><span class="font-semibold text-slate-700">面积:</span><span class="ml-1">{{ house.size }}</span></div>
                <div class="flex items-center"><span class="font-semibold text-slate-700">朝向:</span><span class="ml-1">{{ house.direction }}</span></div>
                <div class="flex items-center"><span class="font-semibold text-slate-700">楼层:</span><span class="ml-1">{{ house.floor }}</span></div>
              </div>
              <!-- 标签展示 -->
              <div class="mt-4">
                <span class="font-semibold text-slate-700 text-sm flex items-center mb-2">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                  标签:
                </span>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="tag in getHouseTags(house.tags)" 
                    :key="tag"
                    :class="getTagStyle(tag)"
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 transform hover:scale-105 shadow-sm"
                  >
                    {{ tag }}
                  </span>
                  <span 
                    v-if="getHouseTags(house.tags).length === 0"
                    class="text-slate-400 text-xs italic"
                  >
                    暂无标签
                  </span>
                </div>
              </div>
            </div>
            
            <!-- 价格和操作 -->
            <div class="flex flex-col lg:items-end space-y-3">
              <div class="text-right">
                <div class="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent mb-2">{{ house.price }}元/月</div>
                <div class="text-sm text-slate-500 flex items-center lg:justify-end">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ house.updateTime }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页导航 -->
    <div v-if="totalPages > 1" class="mt-8 flex justify-center items-center space-x-2">
      <button 
        @click="currentPage = 1"
        :disabled="currentPage === 1"
        :class="[
          'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
          currentPage === 1 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md'
        ]"
      >
        首页
      </button>
      <button 
        @click="currentPage = Math.max(currentPage - 1, 1)"
        :disabled="currentPage === 1"
        :class="[
          'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
          currentPage === 1 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md'
        ]"
      >
        上一页
      </button>
      
      <!-- 页码显示 -->
      <div class="flex items-center space-x-1">
        <template v-for="page in getPageNumbers()" :key="page">
          <button
            v-if="page !== '...'"
            @click="currentPage = page"
            :class="[
              'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
              currentPage === page
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md'
            ]"
          >
            {{ page }}
          </button>
          <span v-else class="px-2 py-2 text-slate-500">...</span>
        </template>
      </div>
      
      <button 
        @click="currentPage = Math.min(currentPage + 1, totalPages)"
        :disabled="currentPage === totalPages"
        :class="[
          'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
          currentPage === totalPages 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md'
        ]"
      >
        下一页
      </button>
      <button 
        @click="currentPage = totalPages"
        :disabled="currentPage === totalPages"
        :class="[
          'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
          currentPage === totalPages 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md'
        ]"
      >
        尾页
      </button>
    </div>
  </div>

  <!-- 更新进度弹窗 -->
  <div v-if="showUpdateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[80vh] flex flex-col">
      <div class="flex items-center justify-between p-4 border-b">
        <h3 class="text-lg font-semibold">更新数据进度</h3>
        <button 
          @click="closeUpdateModal"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="flex-1 p-4 overflow-hidden">
        <div 
          ref="logContainer"
          class="terminal-log bg-black text-green-400 font-mono text-sm p-4 rounded-lg h-full overflow-y-auto whitespace-pre-wrap"
          style="min-height: 400px; max-height: 400px;"
        >{{ updateLog }}</div>
      </div>
      
      <div class="p-4 border-t flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <div v-if="isUpdating" class="flex items-center space-x-2 text-blue-600">
            <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>正在更新数据...</span>
          </div>
          <div v-else-if="updateCompleted" class="flex items-center space-x-2 text-green-600">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>更新完成</span>
          </div>
        </div>
        
        <div class="flex space-x-2">
          <button 
            @click="closeUpdateModal"
            class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            {{ updateCompleted.value ? '关闭并刷新数据' : '关闭' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import Papa from 'papaparse'

export default {
  name: 'HouseList',
  setup() {
    // 响应式数据
    const houses = ref([])
    const selectedCity = ref('guangzhou')
    const selectedArea = ref('')
    const selectedHouseType = ref('')
    const selectedDirection = ref('')
    const searchKeyword = ref('')
    const selectedPriceRange = ref('')
    const customMinPrice = ref('')
    const customMaxPrice = ref('')
    const currentPage = ref(1)
    const pageSize = ref(30)
    const isUpdating = ref(false)
    const showUpdateModal = ref(false)
    const updateLog = ref('')
    const updateCompleted = ref(false)
    const logContainer = ref(null)
    const lastUpdateTime = ref('')

    // 城市配置
    const cities = [
      { code: 'guangzhou', name: '广州' },
      { code: 'beijing', name: '北京' },
      { code: 'shanghai', name: '上海' },
      { code: 'shenzhen', name: '深圳' }
    ]

    // 价格范围配置
    const priceRanges = [
      { value: '0-1200', label: '≤1200元' },
      { value: '1200-2000', label: '1200-2000元' },
      { value: '2000-2500', label: '2000-2500元' },
      { value: '2500-3000', label: '2500-3000元' },
      { value: '3000-4000', label: '3000-4000元' },
      { value: '4000-5000', label: '4000-5000元' },
      { value: '5000-9000', label: '5000-9000元' },
      { value: '9000+', label: '≥9000元' }
    ]

    // 朝向固定选项
    const directions = ref(['东', '西', '南', '北', '南北'])

    // 计算属性
    const availableAreas = computed(() => {
      if (selectedCity.value === 'guangzhou') {
        return ['天河区', '越秀区', '海珠区', '番禺区', '黄埔区', '南沙区', '荔湾区', '白云区', '从化区', '增城区', '花都区']
      } else if (selectedCity.value === 'beijing') {
        return ['朝阳区', '海淀区', '西城区', '东城区']
      } else if (selectedCity.value === 'shanghai') {
        return ['黄浦区', '徐汇区', '长宁区', '静安区']
      } else if (selectedCity.value === 'shenzhen') {
        return ['福田区', '罗湖区', '南山区', '宝安区']
      }
      return []
    })

    const houseTypes = computed(() => {
      const types = new Set()
      houses.value.forEach(house => {
        if (house.houseType) {
          // 提取房间数，如"3室2厅2卫" -> "三居室"
          const match = house.houseType.match(/(\d+)室/)
          if (match) {
            const roomCount = parseInt(match[1])
            if (roomCount === 1) types.add('一居室')
            else if (roomCount === 2) types.add('二居室')
            else if (roomCount === 3) types.add('三居室')
            else if (roomCount >= 4) types.add('四居以上')
          }
          // 特殊户型
          if (house.houseType.includes('开间') || house.houseType.includes('0厅')) {
            types.add('开间')
          }
        }
      })
      return Array.from(types).sort()
    })

    const filteredHouses = computed(() => {
      let filtered = houses.value
      
      // 户型筛选
      if (selectedHouseType.value) {
        filtered = filtered.filter(house => {
          if (!house.houseType) return false
          
          const match = house.houseType.match(/(\d+)室/)
          if (match) {
            const roomCount = parseInt(match[1])
            switch (selectedHouseType.value) {
              case '一居室': return roomCount === 1
              case '二居室': return roomCount === 2
              case '三居室': return roomCount === 3
              case '四居以上': return roomCount >= 4
              default: return false
            }
          }
          return selectedHouseType.value === '开间' && (house.houseType.includes('开间') || house.houseType.includes('0厅'))
        })
      }
      
      // 朝向筛选
      if (selectedDirection.value) {
        filtered = filtered.filter(house => {
          return house.direction && house.direction.includes(selectedDirection.value)
        })
      }
      
      // 价格筛选
      if (selectedPriceRange.value || customMinPrice.value || customMaxPrice.value) {
        filtered = filtered.filter(house => {
          const price = parseFloat(house.price?.replace(/[^\d.]/g, '')) || 0
          
          // 自定义价格优先
          if (customMinPrice.value || customMaxPrice.value) {
            const min = parseFloat(customMinPrice.value) || 0
            const max = parseFloat(customMaxPrice.value) || Infinity
            return price >= min && price <= max
          }
          
          // 预设价格范围
          switch (selectedPriceRange.value) {
            case '0-1200': return price <= 1200
            case '1200-2000': return price > 1200 && price <= 2000
            case '2000-2500': return price > 2000 && price <= 2500
            case '2500-3000': return price > 2500 && price <= 3000
            case '3000-4000': return price > 3000 && price <= 4000
            case '4000-5000': return price > 4000 && price <= 5000
            case '5000-9000': return price > 5000 && price <= 9000
            case '9000+': return price > 9000
            default: return true
          }
        })
      }
      
      // 关键词搜索
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase()
        filtered = filtered.filter(house => {
          return house.title && house.title.toLowerCase().includes(keyword)
        })
      }
      
      return filtered
    })

    // 分页相关计算属性
    const totalPages = computed(() => {
      return Math.ceil(filteredHouses.value.length / pageSize.value)
    })

    const paginatedHouses = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredHouses.value.slice(start, end)
    })

    // 方法
    const loadDataFile = async (fileName) => {
      try {
        const response = await fetch(`/data/${fileName}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const csvText = await response.text()
        houses.value = parseCSV(csvText)
      } catch (error) {
        console.error('加载数据文件失败:', error)
        houses.value = []
      }
    }

    const parseCSV = (csvText) => {
      const lines = csvText.split('\n').filter(line => line.trim())
      if (lines.length < 2) return []
      
      // 从第一行元信息中提取更新时间
      const firstLine = lines[0]
      if (firstLine.includes('更新时间')) {
        const match = firstLine.match(/更新时间:\s*([^,]+)/)
        if (match) {
          lastUpdateTime.value = match[1].trim()
        }
      }
      
      // 跳过第一行元信息，使用第二行作为表头
      const headers = lines[1].split(',').map(h => h.replace(/"/g, '').trim())
      const data = []
      
      for (let i = 2; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim())
        if (values.length >= headers.length) {
          const row = {}
          headers.forEach((header, index) => {
            switch (header) {
              case '标题': row.title = values[index]; break
              case '区域': row.area = values[index]; break
              case '地块': row.block = values[index]; break
              case '小区': row.community = values[index]; break
              case '面积': row.size = values[index]; break
              case '朝向': row.direction = values[index]; break
              case '户型': row.houseType = values[index]; break
              case '楼层信息': row.floor = values[index]; break
              case '价格': row.price = values[index]; break
              case '标签': row.tags = values[index]; break
              case '详情页链接': row.link = values[index]; break
              case '维护时间': row.updateTime = values[index]; break
            }
          })
          data.push(row)
        }
      }
      return data
    }

    const getDataFileName = () => {
      const cityAreaMap = {
        guangzhou: {
          '': 'houses_guangzhou_all.csv',
          '天河区': 'houses_guangzhou_tianhe.csv',
          '越秀区': 'houses_guangzhou_yuexiu.csv',
          '海珠区': 'houses_guangzhou_haizhu.csv',
          '荔湾区': 'houses_guangzhou_liwan.csv',
          '白云区': 'houses_guangzhou_baiyun.csv',
          '黄埔区': 'houses_guangzhou_huangpu.csv',
          '番禺区': 'houses_guangzhou_panyu.csv',
          '花都区': 'houses_guangzhou_huadu.csv',
          '南沙区': 'houses_guangzhou_nansha.csv',
          '从化区': 'houses_guangzhou_conghua.csv',
          '增城区': 'houses_guangzhou_zengcheng.csv'
        },
        beijing: {
          '': 'houses_beijing_all.csv',
          '朝阳区': 'houses_beijing_chaoyang.csv',
          '海淀区': 'houses_beijing_haidian.csv',
          '西城区': 'houses_beijing_xicheng.csv',
          '东城区': 'houses_beijing_dongcheng.csv'
        },
        shanghai: {
          '': 'houses_shanghai_all.csv',
          '黄浦区': 'houses_shanghai_huangpu.csv',
          '徐汇区': 'houses_shanghai_xuhui.csv',
          '长宁区': 'houses_shanghai_changning.csv',
          '静安区': 'houses_shanghai_jingan.csv'
        },
        shenzhen: {
          '': 'houses_shenzhen_all.csv',
          '福田区': 'houses_shenzhen_futian.csv',
          '罗湖区': 'houses_shenzhen_luohu.csv',
          '南山区': 'houses_shenzhen_nanshan.csv',
          '宝安区': 'houses_shenzhen_baoan.csv'
        }
      }
      
      return cityAreaMap[selectedCity.value]?.[selectedArea.value] || 'houses_guangzhou_all.csv'
    }

    const changeCity = () => {
      selectedArea.value = ''
      currentPage.value = 1
      loadDataFile(getDataFileName())
    }

    const resetPagination = () => {
      currentPage.value = 1
    }

    const getPageNumbers = () => {
      const pages = []
      const total = totalPages.value
      const current = currentPage.value
      
      if (total <= 7) {
        // 如果总页数不超过7页，显示所有页码
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        // 总是显示第一页
        pages.push(1)
        
        if (current <= 4) {
          // 当前页在前面时
          for (let i = 2; i <= 5; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 3) {
          // 当前页在后面时
          pages.push('...')
          for (let i = total - 4; i <= total; i++) {
            pages.push(i)
          }
        } else {
          // 当前页在中间时
          pages.push('...')
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        }
      }
      
      return pages
    }

    const getLocationDisplay = () => {
      const city = cities.find(c => c.code === selectedCity.value)
      const cityName = city ? city.name : '广州'
      
      if (selectedArea.value) {
        return `${cityName} - ${selectedArea.value}`
      } else {
        return `${cityName} - 不限地区`
      }
    }

    const clearSearch = () => {
      searchKeyword.value = ''
    }

    const applyCustomPrice = () => {
      // 清空预设价格范围，让自定义价格生效
      selectedPriceRange.value = ''
    }

    const clearCustomPrice = () => {
      customMinPrice.value = ''
      customMaxPrice.value = ''
    }

    const updateData = async () => {
      isUpdating.value = true
      showUpdateModal.value = true
      updateLog.value = ''
      updateCompleted.value = false
      
      try {
        const response = await fetch('api/update-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            city: selectedCity.value,
            area: selectedArea.value
          })
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          updateLog.value += chunk
          
          // 自动滚动到底部
          nextTick(() => {
            if (logContainer.value) {
              logContainer.value.scrollTop = logContainer.value.scrollHeight
            }
          })
        }
        
        updateCompleted.value = true
        updateLog.value += '\n\n✅ 数据更新完成！点击关闭按钮来刷新页面数据。'
        
      } catch (error) {
        console.error('更新数据失败:', error)
        updateLog.value += `\n错误: ${error.message}\n`
        updateCompleted.value = true
      } finally {
        isUpdating.value = false
      }
    }

    const closeUpdateModal = () => {
      showUpdateModal.value = false
      
      // 如果更新完成，刷新页面数据
      if (updateCompleted.value) {
        loadDataFile(getDataFileName())
        updateLog.value = ''
        updateCompleted.value = false
      }
    }

    // 生命周期
    onMounted(() => {
      loadDataFile(getDataFileName())
    })

    // 监听区域变化
    watch(selectedArea, () => {
      loadDataFile(getDataFileName())
      currentPage.value = 1
    })

    // 监听筛选条件变化，重置分页
    watch([selectedHouseType, selectedDirection, searchKeyword, selectedPriceRange, customMinPrice, customMaxPrice], () => {
      currentPage.value = 1
    })

    // 处理房源标签
    const getHouseTags = (tags) => {
      if (!tags || tags === 'null' || tags.trim() === '') {
        return []
      }
      
      // 按 | 分隔符分割标签，去除空白并过滤空标签
      return tags.split('|')
        .map(tag => tag.trim())
        .filter(tag => tag && tag !== '')
    }

    // 标签样式
    const getTagStyle = (tag) => {
      // 根据标签内容返回不同的样式
      if (tag.includes('精装') || tag.includes('豪华') || tag.includes('高端')) {
        return 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 hover:from-purple-200 hover:to-purple-300 border border-purple-200'
      } else if (tag.includes('地铁') || tag.includes('交通') || tag.includes('便利')) {
        return 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 hover:from-emerald-200 hover:to-emerald-300 border border-emerald-200'
      } else if (tag.includes('新上') || tag.includes('新') || tag.includes('首次')) {
        return 'bg-gradient-to-r from-rose-100 to-rose-200 text-rose-800 hover:from-rose-200 hover:to-rose-300 border border-rose-200'
      } else if (tag.includes('价格') || tag.includes('优惠') || tag.includes('便宜')) {
        return 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 hover:from-orange-200 hover:to-orange-300 border border-orange-200'
      } else if (tag.includes('独立') || tag.includes('公寓') || tag.includes('卫生间')) {
        return 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 hover:from-indigo-200 hover:to-indigo-300 border border-indigo-200'
      } else if (tag.includes('家具') || tag.includes('家电') || tag.includes('全配')) {
        return 'bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 hover:from-teal-200 hover:to-teal-300 border border-teal-200'
      } else {
        return 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 hover:from-slate-200 hover:to-slate-300 border border-slate-200'
      }
    }

    return {
      houses,
      filteredHouses,
      cities,
      selectedCity,
      availableAreas,
      selectedArea,
      houseTypes,
      selectedHouseType,
      directions,
      selectedDirection,
      searchKeyword,
      selectedPriceRange,
      customMinPrice,
      customMaxPrice,
      priceRanges,
      currentPage,
      pageSize,
      changeCity,
      clearSearch,
      applyCustomPrice,
      getLocationDisplay,
      totalPages,
      paginatedHouses,
      resetPagination,
      getPageNumbers,
      clearCustomPrice,
      isUpdating,
      updateData,
      showUpdateModal,
      updateLog,
      updateCompleted,
      closeUpdateModal,
      logContainer,
      lastUpdateTime,
      getHouseTags,
      getTagStyle
    }
  }
}
</script>

<style scoped>
/* 主题色彩 */
.bg-primary-500 {
  background: linear-gradient(135deg, #10b981, #059669);
}

.text-primary-600 {
  color: #047857;
}

.focus\:ring-primary-500:focus {
  --tw-ring-color: #10b981;
}

.focus\:border-primary-500:focus {
  border-color: #10b981;
}

/* 终端日志样式 */
.terminal-log {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  line-height: 1.6;
  border: 1px solid #374151;
  background: linear-gradient(135deg, #1f2937, #111827);
}

.terminal-log::-webkit-scrollbar {
  width: 8px;
}

.terminal-log::-webkit-scrollbar-track {
  background: #1f2937;
  border-radius: 4px;
}

.terminal-log::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 4px;
}

.terminal-log::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #059669, #047857);
}

/* 页面背景渐变 */
body {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
}

/* 玻璃态效果 */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

/* 按钮悬停效果 */
button {
  position: relative;
  overflow: hidden;
}

button::before {
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

button:hover::before {
  left: 100%;
}

/* 卡片阴影效果 */
.shadow-card {
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

.shadow-card:hover {
  box-shadow: 
    0 10px 25px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}
</style> 