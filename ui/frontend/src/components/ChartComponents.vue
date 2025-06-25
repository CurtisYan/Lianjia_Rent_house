<template>
  <div class="space-y-6">
    <!-- 图表控制面板 -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">图表分析控制台</h3>
        <div class="flex space-x-2">
          <button @click="refreshAllCharts" class="btn-secondary">刷新图表</button>
          <button @click="exportCharts" class="btn-secondary">导出图表</button>
        </div>
      </div>
      
      <!-- 图表类型选择 -->
      <div class="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">快速筛选</label>
          <div class="flex flex-wrap gap-2">
            <button @click="setQuickFilter('highPrice')" 
                    :class="quickFilter === 'highPrice' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'"
                    class="px-3 py-1 rounded-full text-sm transition-colors">
              高价房源 (>6000)
            </button>
            <button @click="setQuickFilter('lowPrice')" 
                    :class="quickFilter === 'lowPrice' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'"
                    class="px-3 py-1 rounded-full text-sm transition-colors">
              实惠房源 (≤1500)
            </button>
            <button @click="setQuickFilter('largeArea')" 
                    :class="quickFilter === 'largeArea' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'"
                    class="px-3 py-1 rounded-full text-sm transition-colors">
              大面积 (>80㎡)
            </button>
            <button @click="setQuickFilter('all')" 
                    :class="quickFilter === 'all' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    class="px-3 py-1 rounded-full text-sm transition-colors">
              全部数据
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据概览卡片 -->
    <!-- <div v-if="!selectedDistrict" class="overview-cards grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
        <h3 class="text-lg font-semibold">房源总数</h3>
        <p class="text-2xl font-bold">{{ overviewStats.totalHouses }}套</p>
        <p class="text-sm opacity-90">覆盖{{ overviewStats.districtCount }}个区域</p>
      </div>
      <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
        <h3 class="text-lg font-semibold">平均租金</h3>
        <p class="text-2xl font-bold">¥{{ overviewStats.avgPrice }}</p>
        <p class="text-sm opacity-90">每月</p>
      </div>
      <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
        <h3 class="text-lg font-semibold">小区数量</h3>
        <p class="text-2xl font-bold">{{ overviewStats.communityCount }}</p>
        <p class="text-sm opacity-90">个小区</p>
      </div>
      <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
        <h3 class="text-lg font-semibold">平均面积</h3>
        <p class="text-2xl font-bold">{{ overviewStats.avgArea }}㎡</p>
        <p class="text-sm opacity-90">平均居住面积</p>
      </div>
    </div> -->

    <!-- 图表网格 -->
    <div class="charts-grid">
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
      
      <div v-else-if="!hasValidData" class="text-center py-12">
        <div class="text-gray-500 text-lg">{{ noDataMessage }}</div>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div v-for="(chart, index) in displayedCharts" 
             :key="`${selectedDistrict || 'city'}-${chart.type}-${index}`"
             class="chart-item bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
          
          <!-- 图表标题和操作 -->
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-semibold text-gray-800">{{ chart.title }}</h3>
            <div class="flex space-x-2">
              <button @click="expandChart(chart)" 
                      class="text-gray-500 hover:text-blue-500 transition-colors" 
                      title="放大查看">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
                </svg>
              </button>
              <button @click="exportChart(chart)" 
                      class="text-gray-500 hover:text-green-500 transition-colors" 
                      title="导出图表">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- ECharts 图表 -->
          <div class="chart-wrapper" style="height: 300px;">
            <VChart :option="chart.config" 
                     :autoresize="true" 
                     @click="onChartClick"
                     class="h-full w-full" />
          </div>

          <!-- 数据洞察 -->
          <div class="insights mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-semibold text-gray-700 mb-2">数据洞察</h4>
            <ul class="text-xs text-gray-600 space-y-1">
              <li v-for="insight in chart.insights" :key="insight" class="flex items-start">
                <span class="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                {{ insight }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表详情模态框 -->
    <div v-if="expandedChart" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeExpandedChart">
      <div class="bg-white rounded-lg p-6 m-4 max-w-6xl w-full max-h-[90vh] overflow-auto" @click.stop>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">{{ expandedChart.title }}</h2>
          <button @click="closeExpandedChart" class="text-gray-500 hover:text-red-500">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div style="height: 500px;">
          <VChart :option="expandedChart.config" :autoresize="true" class="h-full w-full" />
        </div>
        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-semibold mb-2">详细分析</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div v-for="insight in expandedChart.insights" :key="insight">
              <p class="text-gray-700">{{ insight }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import {
  PieChart,
  BarChart,
  LineChart,
  ScatterChart,
  RadarChart,
  BoxplotChart,
  HeatmapChart,
  SankeyChart,
  TreemapChart,
  GaugeChart
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  PolarComponent,
  RadarComponent,
  DataZoomComponent,
  BrushComponent,
  VisualMapComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { HouseDataAnalyzer, chartConfigs } from '../utils/chartAnalysis.js'
import { CityChartAnalyzer, cityChartConfigs } from '../utils/cityChartAnalysis.js'
import { DistrictChartAnalyzer, districtChartConfigs } from '../utils/districtChartAnalysis.js'

// 注册必要的组件
use([
  CanvasRenderer,
  PieChart, BarChart, LineChart, ScatterChart, RadarChart, BoxplotChart, 
  HeatmapChart, SankeyChart, TreemapChart, GaugeChart,
  TitleComponent, TooltipComponent, LegendComponent, GridComponent,
  PolarComponent, RadarComponent, DataZoomComponent, BrushComponent, VisualMapComponent
])

// 注册VChart组件
const components = {
  VChart
}

// 组件参数和 emit 定义
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  selectedCity: {
    type: String,
    default: ''
  },
  selectedDistrict: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// 响应式数据
const loading = ref(false)
const quickFilter = ref('all')
const expandedChart = ref(null)
const availableDistricts = ref([])
const rawData = ref([])
const dataStatus = ref({ color: 'bg-green-500', text: '数据有效' })
const noDataMessage = ref('暂无数据')
const hasValidData = ref(true)

// 数据分析器
const cityAnalyzer = ref(null)
const districtAnalyzer = ref(null)

// 数据
const selectedChart = ref('')

// 计算属性
const dataScope = computed(() => {
  if (props.selectedDistrict) {
    return `${props.selectedDistrict} - 区域分析`
  }
  return `${props.selectedCity === 'guangzhou' ? '广州' : props.selectedCity} - 全市分析`
})

// 计算属性：获取当前有效的数据分析器
const currentAnalyzer = computed(() => {
  if (props.selectedDistrict && districtAnalyzer.value) {
    return districtAnalyzer.value
  }
  return cityAnalyzer.value
})

// 计算属性：获取当前分析模式
const analysisMode = computed(() => {
  return props.selectedDistrict ? 'district' : 'city'
})

// 图表配置
const chartDefinitions = computed(() => {
  if (!currentAnalyzer.value) return []
  
  if (analysisMode.value === 'city') {
    // 全市级别图表
    return [
      {
        id: 'district-overview',
        title: '区域房源分布总览',
        description: '各区域房源数量和均价对比',
        type: 'comparison',
        category: 'bar',
        generator: () => {
          const data = cityAnalyzer.value.getDistrictOverview()
          return cityChartConfigs.districtOverview(data)
        },
        insights: [
          '中心区域房源数量较多',
          '各区域价格差异明显',
          '热门区域集中度高'
        ]
      },
      {
        id: 'district-avg-price',
        title: '区域平均租金对比',
        description: '各区域平均租金水平横向对比',
        type: 'comparison',
        category: 'line',
        generator: () => {
          const data = cityAnalyzer.value.getDistrictOverview()
          return cityChartConfigs.districtAvgPrice(data)
        },
        insights: [
          '核心区域价格明显高于外围区域',
          '商业中心区域溢价显著',
          '交通便利性是价格重要影响因素'
        ]
      },
      {
        id: 'district-price-ranges',
        title: '区域价格区间分布',
        description: '各区域不同价格段房源分布',
        type: 'distribution',
        category: 'stacked-bar',
        generator: () => {
          const data = cityAnalyzer.value.getDistrictPriceRanges()
          return cityChartConfigs.districtPriceRanges(data)
        },
        insights: [
          '不同区域价格结构差异显著',
          '高端房源主要集中在核心区域',
          '外围区域以中低价位为主'
        ]
      },
      {
        id: 'district-layout-heatmap',
        title: '区域户型分布热力图',
        description: '区域与户型的分布关系',
        type: 'advanced',
        category: 'heatmap',
        generator: () => {
          const data = cityAnalyzer.value.getDistrictLayoutComparison()
          return cityChartConfigs.districtLayoutHeatmap(data)
        },
        insights: [
          '不同区域户型偏好明显',
          '核心区域小户型占比高',
          '郊区大户型供应充足'
        ]
      },
      {
        id: 'district-flow',
        title: '区域房源流向桑基图',
        description: '区域与价格区间的流向关系',
        type: 'advanced',
        category: 'sankey',
        generator: () => {
          const data = cityAnalyzer.value.getDistrictFlowData()
          return cityChartConfigs.districtFlow(data)
        },
        insights: [
          '不同区域价格定位明确',
          '中价区间房源最受欢迎',
          '高端房源集中在核心区域'
        ]
      },
      {
        id: 'district-radar',
        title: '区域综合竞争力雷达图',
        description: '多维度评估各区域竞争力',
        type: 'advanced',
        category: 'radar',
        generator: () => {
          const data = cityAnalyzer.value.getDistrictOverview()
          return cityChartConfigs.districtCompetitiveness(data)
        },
        insights: [
          '综合竞争力差异明显',
          '热门区域全方位领先',
          '新兴区域潜力较大'
        ]
      }
    ]
  } else {
    // 区域级别图表
    return [
      {
        id: 'community-ranking',
        title: '热门小区排行',
        description: '区域内房源最多的小区TOP10',
        type: 'comparison',
        category: 'horizontal-bar',
        generator: () => {
          const data = districtAnalyzer.value.getCommunityAnalysis()
          return districtChartConfigs.communityRanking(data)
        },
        insights: [
          '品牌开发商小区更受欢迎',
          '地铁沿线小区供应量大',
          '学区房小区关注度高'
        ]
      },
      {
        id: 'subdistrict-distribution',
        title: '片区分布',
        description: '区域内各片区房源分布情况',
        type: 'distribution',
        category: 'pie',
        generator: () => {
          const data = districtAnalyzer.value.getSubDistrictAnalysis()
          return districtChartConfigs.subDistrictDistribution(data)
        },
        insights: [
          '核心片区房源集中',
          '各片区发展不平衡',
          '交通枢纽周边供应充足'
        ]
      },
      {
        id: 'detailed-price-distribution',
        title: '详细价格分布',
        description: '区域内精细价格区间分析',
        type: 'distribution',
        category: 'bar',
        generator: () => {
          const data = districtAnalyzer.value.getDetailedPriceDistribution()
          return districtChartConfigs.detailedPriceDistribution(data)
        },
        insights: [
          '价格分布相对集中',
          '主流价格区间明确',
          '高端房源比例适中'
        ]
      },
      {
        id: 'area-distribution',
        title: '面积分布',
        description: '区域内房源面积分布情况',
        type: 'distribution',
        category: 'doughnut',
        generator: () => {
          const data = districtAnalyzer.value.getAreaDistribution()
          return districtChartConfigs.areaDistribution(data)
        },
        insights: [
          '中小户型是市场主流',
          '面积分布呈正态分布',
          '超大户型供应稀少'
        ]
      },
      {
        id: 'price-area-correlation',
        title: '价格面积散点图',
        description: '区域内价格与面积相关性分析',
        type: 'correlation',
        category: 'scatter',
        generator: () => {
          const data = districtAnalyzer.value.getPriceAreaCorrelation()
          return districtChartConfigs.priceAreaScatter(data)
        },
        insights: [
          '价格与面积呈正相关',
          '存在高性价比房源',
          '大面积房源价格波动大'
        ]
      },
      {
        id: 'layout-price-analysis',
        title: '户型价格对比',
        description: '区域内不同户型的价格分析',
        type: 'comparison',
        category: 'bar',
        generator: () => {
          const data = districtAnalyzer.value.getLayoutPriceAnalysis()
          return districtChartConfigs.layoutPriceComparison(data)
        },
        insights: [
          '户型差异化明显',
          '大户型单价相对较低',
          '小户型性价比突出'
        ]
      },
      {
        id: 'tag-analysis',
        title: '热门标签词云',
        description: '区域内房源特色标签分析',
        type: 'distribution',
        category: 'wordcloud',
        generator: () => {
          const data = districtAnalyzer.value.getTagAnalysis()
          return districtChartConfigs.tagWordcloud(data)
        },
        insights: [
          '精装修是最常见卖点',
          '交通便利性备受关注',
          '智能家居成为新趋势'
        ]
      },
      {
        id: 'orientation-analysis',
        title: '朝向偏好分析',
        description: '区域内房源朝向分布',
        type: 'distribution',
        category: 'radar',
        generator: () => {
          const data = districtAnalyzer.value.getOrientationAnalysis()
          return districtChartConfigs.orientationRadar(data)
        },
        insights: [
          '南向房源最受青睐',
          '东南朝向性价比高',
          '北向房源价格较低'
        ]
      }
    ]
  }
})

// 计算属性
const visibleCharts = computed(() => {
  let charts = chartDefinitions.value

  // 移除按图表类型筛选的逻辑，显示所有图表
  // 快速筛选只影响数据计数，不影响图表显示

  // 生成图表配置
  return charts.map(chart => {
    try {
      return {
        ...chart,
        config: chart.generator(),
        expanded: false
      }
    } catch (error) {
      console.error(`生成图表 ${chart.id} 时出错:`, error)
      return {
        ...chart,
        config: null,
        expanded: false,
        error: error.message
      }
    }
  })
})

// 显示的图表（用于模板）
const displayedCharts = computed(() => {
  return visibleCharts.value.filter(chart => chart.config && !chart.error)
})

// 概览统计数据
const overviewStats = computed(() => {
  if (!currentAnalyzer.value || !props.data || props.data.length === 0) {
    return {
      totalHouses: 0,
      avgPrice: 0,
      communityCount: 0,
      avgArea: 0,
      districtCount: 0
    }
  }
  
  const data = props.data
  const totalHouses = data.length
  const avgPrice = Math.round(data.reduce((sum, item) => sum + (item.price || 0), 0) / totalHouses)
  const avgArea = Math.round(data.reduce((sum, item) => sum + (item.area || 0), 0) / totalHouses)
  const communityCount = new Set(data.map(item => item.community).filter(Boolean)).size
  const districtCount = new Set(data.map(item => item.district).filter(Boolean)).size
  
  return {
    totalHouses,
    avgPrice,
    communityCount,
    avgArea,
    districtCount
  }
})

// 方法
const initializeAnalyzers = (data) => {
  if (data && data.length > 0) {
    cityAnalyzer.value = new CityChartAnalyzer(data)
    
    // 获取可用区域列表
    const districts = [...new Set(data.map(item => item.district))].filter(d => d && d !== '未知')
    availableDistricts.value = districts
    
    // 如果选择了区域，初始化区域分析器
    if (props.selectedDistrict) {
      districtAnalyzer.value = new DistrictChartAnalyzer(data, props.selectedDistrict)
    }
    
    hasValidData.value = true
    dataStatus.value = { color: 'bg-green-500', text: '数据有效' }
  } else {
    cityAnalyzer.value = null
    districtAnalyzer.value = null
    hasValidData.value = false
    dataStatus.value = { color: 'bg-red-500', text: '数据无效' }
    noDataMessage.value = '当前选择的城市或区域没有可用数据'
  }
}

const setQuickFilter = (filter) => {
  quickFilter.value = filter
  console.log(`设置快速筛选: ${filter}`)
}

const refreshAllCharts = () => {
  loading.value = true
  setTimeout(() => {
    if (props.data && props.data.length > 0) {
      initializeAnalyzers(props.data)
    }
    loading.value = false
  }, 1000)
}

const exportCharts = () => {
  // 导出图表功能
  console.log('导出图表')
}

const expandChart = (chart) => {
  expandedChart.value = chart
}

const exportChart = (chart) => {
  console.log('导出单个图表:', chart.title)
}

const closeExpandedChart = () => {
  expandedChart.value = null
}

const onChartClick = (params) => {
  console.log('图表点击事件:', params)
}

// 生命周期
onMounted(() => {
  initializeAnalyzers(props.data)
})

// 监听数据变化
watch(() => props.data, (newData) => {
  if (newData) {
    initializeAnalyzers(newData)
  }
}, { deep: true })

// 监听城市和区域变化
watch(() => [props.selectedCity, props.selectedDistrict], ([newCity, newDistrict]) => {
  if (props.data && props.data.length > 0) {
    initializeAnalyzers(props.data)
  }
}, { deep: true })
</script>

<style scoped>
.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium;
}

.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}
</style> 