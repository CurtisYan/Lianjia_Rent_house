<template>
  <div class="min-h-screen">
    <!-- 页面标题 -->
    <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0 mb-8">
      <div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">数据分析中心</h1>
        <p class="text-slate-600 mt-3 text-lg">深度数据挖掘与可视化分析，洞察房产市场趋势</p>
      </div>
      <div class="flex space-x-3">
        <button @click="exportAnalysisReport" class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg flex items-center">
          <DocumentArrowDownIcon class="w-5 h-5 mr-2" />
          导出分析报告
        </button>
      </div>
    </div>

    <!-- 数据概览卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- 房源总数 -->
      <div class="bg-white rounded-2xl p-8 shadow-lg border border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <div class="flex items-center justify-between mb-4">
          <div class="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-md">
            <HomeIcon class="h-8 w-8 text-white" />
          </div>
          <div class="text-right">
            <p class="text-3xl font-bold text-slate-800">{{ statisticsSummary.totalCount }}</p>
            <p class="text-sm text-slate-500">套房源</p>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-700">房源总数</h3>
          <div v-if="statisticsSummary.totalCountChange !== null" class="flex items-center">
            <span class="text-xs px-2 py-1 rounded-full" :class="statisticsSummary.totalCountChange >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">
              {{ statisticsSummary.totalCountChange >= 0 ? '+' : '' }}{{ statisticsSummary.totalCountChange }}%
            </span>
          </div>
        </div>
      </div>

      <!-- 平均价格 -->
      <div class="bg-white rounded-2xl p-8 shadow-lg border border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <div class="flex items-center justify-between mb-4">
          <div class="w-14 h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-md">
            <CurrencyDollarIcon class="h-8 w-8 text-white" />
          </div>
          <div class="text-right">
            <p class="text-3xl font-bold text-slate-800">¥{{ statisticsSummary.avgPrice }}</p>
            <p class="text-sm text-slate-500">元/月</p>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-700">平均租金</h3>
          <div v-if="statisticsSummary.avgPriceChange !== null" class="flex items-center">
            <span class="text-xs px-2 py-1 rounded-full" :class="statisticsSummary.avgPriceChange >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">
              {{ statisticsSummary.avgPriceChange >= 0 ? '+' : '' }}{{ statisticsSummary.avgPriceChange }}%
            </span>
          </div>
        </div>
      </div>

      <!-- 平均面积 -->
      <div class="bg-white rounded-2xl p-8 shadow-lg border border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <div class="flex items-center justify-between mb-4">
          <div class="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
            <MapIcon class="h-8 w-8 text-white" />
          </div>
          <div class="text-right">
            <p class="text-3xl font-bold text-slate-800">{{ statisticsSummary.avgArea }}</p>
            <p class="text-sm text-slate-500">㎡</p>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-700">平均面积</h3>
          <div v-if="statisticsSummary.avgAreaChange !== null" class="flex items-center">
            <span class="text-xs px-2 py-1 rounded-full" :class="statisticsSummary.avgAreaChange >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">
              {{ statisticsSummary.avgAreaChange >= 0 ? '+' : '' }}{{ statisticsSummary.avgAreaChange }}%
            </span>
          </div>
        </div>
      </div>

      <!-- 小区数量 -->
      <div class="bg-white rounded-2xl p-8 shadow-lg border border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <div class="flex items-center justify-between mb-4">
          <div class="w-14 h-14 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-md">
            <BuildingOfficeIcon class="h-8 w-8 text-white" />
          </div>
          <div class="text-right">
            <p class="text-3xl font-bold text-slate-800">{{ statisticsSummary.communityCount }}</p>
            <p class="text-sm text-slate-500">个小区</p>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-700">小区总数</h3>
          <div v-if="statisticsSummary.communityCountChange !== null" class="flex items-center">
            <span class="text-xs px-2 py-1 rounded-full" :class="statisticsSummary.communityCountChange >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">
              {{ statisticsSummary.communityCountChange >= 0 ? '+' : '' }}{{ statisticsSummary.communityCountChange }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据状态 -->
    <div class="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm mb-8">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-4">
          <div class="w-10 h-10 bg-gradient-to-r from-slate-500 to-slate-600 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-slate-800">数据状态</h3>
        </div>
      </div>
      
      <!-- 数据状态详情 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-slate-50 rounded-xl p-4">
          <div class="flex items-center space-x-3 mb-2">
            <div class="w-3 h-3 rounded-full" :class="dataStatus.color"></div>
            <span class="text-sm font-medium text-slate-700">{{ dataStatus.text }}</span>
          </div>
          <div class="text-lg font-bold text-slate-800">{{ dataStatus.count }} 条</div>
          <div class="text-sm text-slate-500">数据记录</div>
        </div>
        
        <div class="bg-slate-50 rounded-xl p-4">
          <div class="flex items-center space-x-3 mb-2">
            <div class="w-3 h-3 rounded-full" :class="qualityStatus.color"></div>
            <span class="text-sm font-medium text-slate-700">质量{{ qualityStatus.text }}</span>
          </div>
          <div class="text-lg font-bold" :class="qualityColor">{{ dataQuality.total }}分</div>
          <div class="text-sm text-slate-500">数据质量</div>
        </div>
        
        <div class="bg-slate-50 rounded-xl p-4">
          <div class="flex items-center space-x-3 mb-2">
            <div class="w-3 h-3 rounded-full bg-blue-500"></div>
            <span class="text-sm font-medium text-slate-700">加载状态</span>
          </div>
          <div class="text-lg font-bold text-slate-800">{{ loading ? '加载中' : '已完成' }}</div>
          <div class="text-sm text-slate-500">{{ loading ? '正在处理...' : '数据就绪' }}</div>
        </div>
        
        <div class="bg-slate-50 rounded-xl p-4">
          <div class="flex items-center space-x-3 mb-2">
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
            <span class="text-sm font-medium text-slate-700">数据范围</span>
          </div>
          <div class="text-lg font-bold text-slate-800">{{ selectedCity === 'guangzhou' ? '广州' : selectedCity }}</div>
          <div class="text-sm text-slate-500">{{ selectedDistrict || '全部区域' }}</div>
        </div>
      </div>
    </div>

    <!-- 城市和数据源选择 -->
    <div class="bg-white rounded-2xl p-8 shadow-lg border border-white/20 backdrop-blur-sm mb-8">
      <h3 class="text-xl font-bold text-slate-800 mb-6 flex items-center">
        <svg class="w-6 h-6 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        数据源配置
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-3">选择城市</label>
          <select v-model="selectedCity" @change="onCityChange" class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
            <option value="guangzhou">广州</option>
            <option value="shanghai" disabled>上海（暂无数据）</option>
            <option value="beijing" disabled>北京（暂无数据）</option>
            <option value="shenzhen" disabled>深圳（暂无数据）</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-3">区域筛选</label>
          <select v-model="selectedDistrict" @change="onDistrictChange" class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
            <option value="">全部区域</option>
            <option v-for="district in availableDistricts" :key="district.code" :value="district.name">
              {{ district.name }}
              <span v-if="district.dataStatus" class="text-xs">({{ district.dataStatus }})</span>
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 mb-8">
      <div class="flex items-center">
        <div class="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <p class="text-red-700 font-medium">{{ error }}</p>
      </div>
    </div>

    <!-- 数据为空时的提示 -->
    <div v-if="!loading && filteredData.length === 0" class="bg-white rounded-2xl p-16 text-center shadow-lg border border-white/20 backdrop-blur-sm mb-8">
      <div class="text-slate-400 mb-6">
        <svg class="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      </div>
      <h3 class="text-2xl font-bold text-slate-800 mb-4">暂无数据</h3>
      <p class="text-slate-600 mb-6 text-lg">请选择城市并加载数据，或者运行爬虫获取最新房源信息</p>
      <button @click="loadData" class="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg">加载数据</button>
    </div>

    <!-- 图表分析组件 -->
    <ChartComponents v-if="filteredData.length > 0" 
                     :data="filteredData" 
                     :selectedCity="selectedCity"
                     :selectedDistrict="selectedDistrict"
                     :loading="loading" />

    <!-- 数据质量分析 -->
    <div v-if="filteredData.length > 0" class="bg-white rounded-2xl p-8 shadow-lg border border-white/20 backdrop-blur-sm">
      <h3 class="text-xl font-bold text-slate-800 mb-6 flex items-center">
        <svg class="w-6 h-6 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        数据质量报告
      </h3>
      <div class="space-y-6">
        <div class="bg-slate-50 rounded-xl p-6">
          <div class="flex justify-between items-center mb-3">
            <span class="font-semibold text-slate-700">数据新鲜度</span>
            <span class="text-sm font-bold text-slate-800">{{ dataQuality.freshness }}%</span>
          </div>
          <div class="w-full bg-slate-200 rounded-full h-3">
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" :style="`width: ${dataQuality.freshness}%`"></div>
          </div>
          <div class="text-sm text-slate-500 mt-2">
            基于房源维护时间的新鲜程度评估
          </div>
        </div>
        
        <div class="bg-slate-50 rounded-xl p-6">
          <div class="flex justify-between items-center mb-3">
            <span class="font-semibold text-slate-700">数据准确性</span>
            <span class="text-sm font-bold text-slate-800">{{ dataQuality.accuracy }}%</span>
          </div>
          <div class="w-full bg-slate-200 rounded-full h-3">
            <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500" :style="`width: ${dataQuality.accuracy}%`"></div>
          </div>
          <div class="text-sm text-slate-500 mt-2">
            基于价格、面积合理性及字段一致性评估
          </div>
        </div>
        
        <div class="bg-slate-50 rounded-xl p-6">
          <div class="flex justify-between items-center mb-3">
            <span class="font-semibold text-slate-700">数据完整性</span>
            <span class="text-sm font-bold text-slate-800">{{ dataQuality.completeness }}%</span>
          </div>
          <div class="w-full bg-slate-200 rounded-full h-3">
            <div class="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500" :style="`width: ${dataQuality.completeness}%`"></div>
          </div>
          <div class="text-sm text-slate-500 mt-2">
            基于必填字段完整性评估
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { DocumentArrowDownIcon } from '@heroicons/vue/24/outline'
import { HomeIcon, CurrencyDollarIcon, BuildingOfficeIcon, MapIcon } from '@heroicons/vue/24/solid'
import ChartComponents from '../components/ChartComponents.vue'
import { HouseDataAnalyzer } from '../utils/chartAnalysis.js'
import axios from 'axios'

// 响应式数据
const selectedCity = ref(localStorage.getItem('selectedCity') || 'guangzhou')
const selectedDistrict = ref(localStorage.getItem('selectedDistrict') || '')
const loading = ref(false)
const error = ref('')
const rawData = ref([])
const analyzer = ref(null)
const previousStats = ref(null)
const availableDistrictsForCity = ref([])

// 计算属性
const filteredData = computed(() => {
  return rawData.value
})

const availableDistricts = computed(() => {
  return availableDistrictsForCity.value
})

const statisticsSummary = computed(() => {
  if (!analyzer.value) return {}
  
  const stats = analyzer.value.getStatisticsSummary()
  const currentStats = {
    totalCount: stats.totalCount,
    avgPrice: stats.avgPrice,
    avgArea: stats.avgArea,
    communityCount: stats.communityCount
  }
  
  // 计算变化率（与之前的数据对比）
  let totalCountChange = null
  let avgPriceChange = null
  let avgAreaChange = null
  let communityCountChange = null
  
  if (previousStats.value) {
    totalCountChange = previousStats.value.totalCount > 0 
      ? ((currentStats.totalCount - previousStats.value.totalCount) / previousStats.value.totalCount * 100).toFixed(1)
      : null
    avgPriceChange = previousStats.value.avgPrice > 0
      ? ((currentStats.avgPrice - previousStats.value.avgPrice) / previousStats.value.avgPrice * 100).toFixed(1)
      : null
    avgAreaChange = previousStats.value.avgArea > 0
      ? ((currentStats.avgArea - previousStats.value.avgArea) / previousStats.value.avgArea * 100).toFixed(1)
      : null
    communityCountChange = previousStats.value.communityCount > 0
      ? ((currentStats.communityCount - previousStats.value.communityCount) / previousStats.value.communityCount * 100).toFixed(1)
      : null
  }
  
  return {
    totalCount: stats.totalCount.toLocaleString(),
    avgPrice: `¥${stats.avgPrice.toLocaleString()}`,
    avgArea: `${stats.avgArea}`,
    communityCount: stats.communityCount.toLocaleString(),
    totalCountChange,
    avgPriceChange,
    avgAreaChange,
    communityCountChange
  }
})

const dataStatus = computed(() => {
  if (loading.value) {
    return { color: 'bg-yellow-500', text: '加载中...', count: 0 }
  }
  
  if (error.value) {
    return { color: 'bg-red-500', text: '数据错误', count: 0 }
  }
  
  if (filteredData.value.length === 0) {
    return { color: 'bg-gray-500', text: '无数据', count: 0 }
  }
  
  return { 
    color: 'bg-green-500', 
    text: '数据正常', 
    count: filteredData.value.length 
  }
})

const dataQuality = computed(() => {
  if (!analyzer.value) {
    return {
      freshness: 0,
      accuracy: 0,
      completeness: 0,
      total: 0,
      details: {
        totalRecords: 0,
        validRecords: 0,
        filteredOutRecords: 0
      }
    }
  }
  
  const quality = analyzer.value.calculateQualityMetrics()
  const totalRecords = rawData.value.length
  const validRecords = analyzer.value.cleanedData.length
  
  return {
    ...quality,
    details: {
      totalRecords,
      validRecords,
      filteredOutRecords: totalRecords - validRecords
    }
  }
})

const qualityColor = computed(() => {
  const score = dataQuality.value.total
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
})

const qualityStatus = computed(() => {
  const score = dataQuality.value.total
  if (score >= 80) return { color: 'bg-green-500', text: '优秀' }
  if (score >= 60) return { color: 'bg-yellow-500', text: '良好' }
  return { color: 'bg-red-500', text: '需要改进' }
})

// 方法
const loadAvailableDistricts = async () => {
  try {
    // 根据城市获取可用区域
    if (selectedCity.value === 'guangzhou') {
      // 通过检查数据文件来动态获取可用区域
      const districtFiles = [
        { code: 'tianhe', name: '天河区', file: 'houses_guangzhou_tianhe.csv' },
        { code: 'huangpu', name: '黄埔区', file: 'houses_guangzhou_huangpu.csv' },
        { code: 'zengcheng', name: '增城区', file: 'houses_guangzhou_zengcheng.csv' },
        { code: 'conghua', name: '从化区', file: 'houses_guangzhou_conghua.csv' },
        { code: 'yuexiu', name: '越秀区', file: 'houses_guangzhou_yuexiu.csv' },
        { code: 'nansha', name: '南沙区', file: 'houses_guangzhou_nansha.csv' },
        { code: 'panyu', name: '番禺区', file: 'houses_guangzhou_panyu.csv' },
        { code: 'haizhu', name: '海珠区', file: 'houses_guangzhou_haizhu.csv' },
        { code: 'huadu', name: '花都区', file: 'houses_guangzhou_huadu.csv' },
        { code: 'baiyun', name: '白云区', file: 'houses_guangzhou_baiyun.csv' },
        { code: 'liwan', name: '荔湾区', file: 'houses_guangzhou_liwan.csv' }
      ]
      
      const availableDistricts = []
      
      for (const district of districtFiles) {
        try {
          const response = await fetch(`/data/${district.file}`, { method: 'HEAD' })
          if (response.ok) {
            // 检查文件是否有实际数据（大于1KB表示有数据）
            const contentLength = response.headers.get('content-length')
            if (contentLength && parseInt(contentLength) > 1024) {
              availableDistricts.push(district)
            }
          }
        } catch (e) {
          // 文件不存在，跳过
          continue
        }
      }
      
      availableDistrictsForCity.value = availableDistricts
      console.log('可用区域:', availableDistricts.map(d => d.name).join(', '))
    }
  } catch (error) {
    console.error('加载可用区域失败:', error)
    // 使用默认区域作为后备
    availableDistrictsForCity.value = [
      { code: 'tianhe', name: '天河区', file: 'houses_guangzhou_tianhe.csv' },
      { code: 'huangpu', name: '黄埔区', file: 'houses_guangzhou_huangpu.csv' },
      { code: 'zengcheng', name: '增城区', file: 'houses_guangzhou_zengcheng.csv' },
      { code: 'conghua', name: '从化区', file: 'houses_guangzhou_conghua.csv' }
    ]
  }
}

const getDistrictFile = (districtName) => {
  const district = availableDistrictsForCity.value.find(d => d.name === districtName)
  return district ? district.file : null
}

const loadData = async () => {
  if (!selectedCity.value) {
    error.value = '请先选择城市'
    return
  }

  loading.value = true
  error.value = ''
  
  try {
    // 只有广州有真实数据
    if (selectedCity.value !== 'guangzhou') {
      throw new Error(`抱歉，目前只支持广州地区的真实数据分析。其他城市数据正在收集中...`)
    }
    
    // 根据是否选择了区域来决定加载哪个文件
    let fileName
    if (selectedDistrict.value) {
      // 使用动态获取的文件映射
      fileName = getDistrictFile(selectedDistrict.value)
      
      if (!fileName) {
        throw new Error(`区域 ${selectedDistrict.value} 的数据文件不存在或无可用数据`)
      }
    } else {
      // 如果没有选择区域，加载全市数据
      fileName = 'houses_guangzhou_all.csv'
    }
    
    console.log(`加载数据文件: ${fileName}`)
    const response = await fetch(`/data/${fileName}?t=${Date.now()}`) // 添加时间戳防止缓存
    
    if (!response.ok) {
      // 如果全市数据文件不存在，尝试加载天河区数据作为示例
      if (fileName === 'houses_guangzhou_all.csv') {
        console.log('全市数据文件不存在，加载天河区数据作为示例')
        const fallbackResponse = await fetch(`/data/houses_guangzhou_tianhe.csv?t=${Date.now()}`)
        if (!fallbackResponse.ok) {
          throw new Error('数据文件不存在，请检查数据源')
        }
        const csvText = await fallbackResponse.text()
        
        const tempAnalyzer = new HouseDataAnalyzer([])
        const parsedData = tempAnalyzer.parseCSVData(csvText)
        
        console.log(`Fallback数据解析结果: ${parsedData.length} 条记录`)
        
        if (parsedData.length === 0) {
          console.error('Fallback数据也解析失败')
          throw new Error('示例数据文件也无法解析，请检查数据格式')
        }
        
        rawData.value = parsedData
        analyzer.value = new HouseDataAnalyzer(parsedData)
        
        console.log(`Fallback清洗后数据: ${analyzer.value.cleanedData.length} 条`)
        
        // 更新提示信息
        if (analyzer.value.cleanedData.length > 0) {
          error.value = '提示：当前显示的是天河区数据（示例数据）'
          setTimeout(() => { error.value = '' }, 3000)
        } else {
          error.value = '示例数据加载成功但清洗后无有效数据'
        }
        return
      }
      
      throw new Error(`数据文件不存在: ${fileName}`)
    }
    
    const csvText = await response.text()
    
    // 使用分析器解析数据
    const tempAnalyzer = new HouseDataAnalyzer([])
    const parsedData = tempAnalyzer.parseCSVData(csvText)
    
    console.log(`CSV文件大小: ${csvText.length} 字符`)
    console.log(`解析后数据行数: ${parsedData.length}`)
    console.log('CSV前100字符:', csvText.substring(0, 100))
    
    if (parsedData.length === 0) {
      console.error('解析后数据为空，可能的原因：')
      console.error('1. CSV格式错误')
      console.error('2. 数据验证条件过严')
      console.error('3. 文件编码问题')
      
      // 尝试更宽松的处理
      error.value = '数据解析失败，正在尝试修复...'
      
      // 检查是否是编码问题或格式问题
      const lines = csvText.split('\n').filter(line => line.trim())
      console.log('文件总行数:', lines.length)
      if (lines.length > 0) {
        console.log('第一行:', lines[0])
        console.log('第二行:', lines[1] || '无')
        console.log('第三行:', lines[2] || '无')
      }
      
      throw new Error(`数据文件解析失败。文件大小: ${csvText.length} 字符，行数: ${lines.length}`)
    }
    
    rawData.value = parsedData
    analyzer.value = new HouseDataAnalyzer(parsedData)
    
    console.log(`成功加载 ${parsedData.length} 条数据记录`)
    console.log(`清洗后有效数据: ${analyzer.value.cleanedData.length} 条`)
    
    // 如果清洗后数据为空，提供更详细的错误信息但不抛出异常
    if (analyzer.value.cleanedData.length === 0) {
      error.value = `数据已加载但清洗后无有效数据。原始数据: ${parsedData.length} 条。请检查数据质量或联系管理员。`
      console.warn('数据清洗后无有效记录，请检查数据质量')
      return // 不抛出异常，让用户看到具体的错误信息
    } else {
      // 清除之前的错误信息
      error.value = ''
    }
    
  } catch (err) {
    console.error('加载数据失败:', err)
    error.value = err.message
    rawData.value = []
    analyzer.value = null
  } finally {
    loading.value = false
  }
}

const onCityChange = async () => {
  // 保存城市选择到localStorage
  localStorage.setItem('selectedCity', selectedCity.value)
  
  selectedDistrict.value = ''
  localStorage.setItem('selectedDistrict', '')
  
  rawData.value = []
  analyzer.value = null
  
  // 加载新城市的可用区域
  await loadAvailableDistricts()
  
  if (selectedCity.value) {
    loadData()
  }
}

const onDistrictChange = () => {
  // 保存区域选择到localStorage
  localStorage.setItem('selectedDistrict', selectedDistrict.value)
  
  console.log(`区域切换到: ${selectedDistrict.value || '全部区域'}`)
  
  // 当区域改变时，重新加载对应区域的数据文件
  if (selectedCity.value) {
    loadData()
  }
}

const exportAnalysisReport = () => {
  if (!analyzer.value) {
    alert('请先加载数据')
    return
  }
  
  // 生成分析报告
  const stats = analyzer.value.getStatisticsSummary()
  const reportData = {
    city: selectedCity.value,
    district: selectedDistrict.value || '全部区域',
    timestamp: new Date().toLocaleString(),
    statistics: stats,
    dataQuality: dataQuality.value
  }
  
  // 下载JSON格式的报告
  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analysis_report_${selectedCity.value}_${new Date().getTime()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 生命周期钩子
onMounted(async () => {
  // 页面加载时先加载可用区域
  await loadAvailableDistricts()
  // 然后自动加载广州数据
  loadData()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  // 清理逻辑可以在这里添加
})

// 添加watch来监听selectedCity和selectedDistrict的变化，确保自动保存到localStorage
watch(selectedCity, (newValue) => {
  localStorage.setItem('selectedCity', newValue)
})

watch(selectedDistrict, (newValue) => {
  localStorage.setItem('selectedDistrict', newValue)
})
</script>

<style scoped>
.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium inline-flex items-center;
}

.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}
</style> 