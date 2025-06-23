// 区域图表分析器 - 专门处理单个区域的详细数据分析
import { HouseDataAnalyzer } from './chartAnalysis.js'
import { getSubdistrictsForDistrict, isSubdistrictInDistrict } from './districtMapping.js'

export class DistrictChartAnalyzer extends HouseDataAnalyzer {
  constructor(data, district) {
    super(data)
    this.district = district
    
    // 由于预处理阶段已经统一了区域名称，这里直接使用前端传入的区域名进行筛选
    // 前端传入的是"天河区"，但CSV中统一存储为"天河"，需要去除"区"字后缀
    const actualDistrict = district.replace('区', '')
    
    this.filteredData = data.filter(item => item.district === actualDistrict)
    console.log(`区域筛选: ${district} -> ${actualDistrict}, 筛选出 ${this.filteredData.length} 条数据`)
  }

  // 获取小区分布分析
  getCommunityAnalysis() {
    const communityData = {}
    
    this.filteredData.forEach(item => {
      const community = item.community || '未知'
      if (!communityData[community]) {
        communityData[community] = { count: 0, totalPrice: 0, areas: [] }
      }
      communityData[community].count++
      communityData[community].totalPrice += item.price
      communityData[community].areas.push(item.area)
    })

    return Object.entries(communityData)
      .map(([community, data]) => ({
        community,
        count: data.count,
        avgPrice: Math.round(data.totalPrice / data.count),
        avgArea: Math.round(data.areas.reduce((sum, area) => sum + area, 0) / data.areas.length)
      }))
      .sort((a, b) => b.count - a.count)
  }

  // 获取片区(地块)分析 - 使用详细地区映射
  getSubDistrictAnalysis() {
    const actualDistrict = this.district.replace('区', '')
    const validSubdistricts = getSubdistrictsForDistrict(actualDistrict)
    const subDistrictData = {}
    
    // 初始化所有有效地块
    validSubdistricts.forEach(subdistrict => {
      subDistrictData[subdistrict] = { count: 0, totalPrice: 0, communities: new Set() }
    })
    
    // 添加"其他"分类用于未分类的地块
    subDistrictData['其他'] = { count: 0, totalPrice: 0, communities: new Set() }
    
    console.log(`开始分析片区分布，区域: ${actualDistrict}`)
    console.log(`有效地块列表:`, validSubdistricts)
    console.log(`待分析数据条数: ${this.filteredData.length}`)
    console.log(`前5条数据的地块字段:`, this.filteredData.slice(0, 5).map(item => ({ 
      title: item.title, 
      subdistrict: item.subdistrict,
      district: item.district 
    })))
    
    this.filteredData.forEach(item => {
      // 修正字段名：CSV中是"地块"，对应subdistrict字段
      const subDistrict = item.subdistrict || item['地块'] || '未知'
      
      console.log(`处理地块: ${subDistrict}, 是否在预定义列表中: ${isSubdistrictInDistrict(subDistrict, actualDistrict)}`)
      
      // 检查地块是否在预定义列表中
      if (isSubdistrictInDistrict(subDistrict, actualDistrict)) {
        if (!subDistrictData[subDistrict]) {
          subDistrictData[subDistrict] = { count: 0, totalPrice: 0, communities: new Set() }
        }
        subDistrictData[subDistrict].count++
        subDistrictData[subDistrict].totalPrice += item.price
        subDistrictData[subDistrict].communities.add(item.community)
      } else {
        // 不在预定义列表中的归入"其他"
        subDistrictData['其他'].count++
        subDistrictData['其他'].totalPrice += item.price
        subDistrictData['其他'].communities.add(item.community)
      }
    })

    const result = Object.entries(subDistrictData)
      .map(([subDistrict, data]) => ({
        subDistrict,
        count: data.count,
        avgPrice: data.count > 0 ? Math.round(data.totalPrice / data.count) : 0,
        communityCount: data.communities.size
      }))
      .filter(item => item.count > 0) // 只显示有数据的地块
      .sort((a, b) => b.count - a.count)
    
    console.log('片区分析结果:', result)
    return result
  }

  // 区域内价格分布详细分析
  getDetailedPriceDistribution() {
    const ranges = ['≤1500', '1501-2000', '2001-2500', '2501-3000', '3001-4000', '4001-5000', '5001-8000', '>8000']
    const distribution = ranges.reduce((acc, range) => ({ ...acc, [range]: 0 }), {})
    
    this.filteredData.forEach(item => {
      const price = item.price
      if (price <= 1500) distribution['≤1500']++
      else if (price <= 2000) distribution['1501-2000']++
      else if (price <= 2500) distribution['2001-2500']++
      else if (price <= 3000) distribution['2501-3000']++
      else if (price <= 4000) distribution['3001-4000']++
      else if (price <= 5000) distribution['4001-5000']++
      else if (price <= 8000) distribution['5001-8000']++
      else distribution['>8000']++
    })

    return Object.entries(distribution).map(([range, count]) => ({ range, count }))
  }

  // 区域内面积分布分析
  getAreaDistribution() {
    const ranges = ['≤30㎡', '31-50㎡', '51-70㎡', '71-90㎡', '91-120㎡', '>120㎡']
    const distribution = ranges.reduce((acc, range) => ({ ...acc, [range]: 0 }), {})
    
    this.filteredData.forEach(item => {
      const area = item.area
      if (area <= 30) distribution['≤30㎡']++
      else if (area <= 50) distribution['31-50㎡']++
      else if (area <= 70) distribution['51-70㎡']++
      else if (area <= 90) distribution['71-90㎡']++
      else if (area <= 120) distribution['91-120㎡']++
      else distribution['>120㎡']++
    })

    return Object.entries(distribution).map(([range, count]) => ({ range, count }))
  }

  // 价格面积相关性分析
  getPriceAreaCorrelation() {
    return this.filteredData.map(item => [item.area, item.price, item.community])
  }

  // 区域内户型价格分析
  getLayoutPriceAnalysis() {
    const layoutData = {}
    
    this.filteredData.forEach(item => {
      const layout = this.categorizeLayout(item.layout)
      if (!layoutData[layout]) {
        layoutData[layout] = { prices: [], count: 0 }
      }
      layoutData[layout].prices.push(item.price)
      layoutData[layout].count++
    })

    return Object.entries(layoutData).map(([layout, data]) => ({
      layout,
      count: data.count,
      avgPrice: Math.round(data.prices.reduce((sum, price) => sum + price, 0) / data.prices.length),
      minPrice: Math.min(...data.prices),
      maxPrice: Math.max(...data.prices)
    }))
  }

  // 热门标签分析
  getTagAnalysis() {
    const tagCount = {}
    
    this.filteredData.forEach(item => {
      // 检查标签字段格式
      let tags = []
      if (typeof item.tags === 'string') {
        // 如果是字符串，按分隔符分割
        tags = item.tags.split('|').map(tag => tag.trim()).filter(tag => tag)
      } else if (Array.isArray(item.tags)) {
        // 如果是数组，直接使用
        tags = item.tags
      }
      
      tags.forEach(tag => {
        if (tag && tag.trim()) {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        }
      })
    })

    return Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20) // 取前20个热门标签
  }

  // 朝向偏好分析
  getOrientationAnalysis() {
    const orientationCount = {}
    
    this.filteredData.forEach(item => {
      const orientation = item.orientation || '未知'
      orientationCount[orientation] = (orientationCount[orientation] || 0) + 1
    })

    return Object.entries(orientationCount)
      .map(([orientation, count]) => ({ orientation, count }))
      .sort((a, b) => b.count - a.count)
  }

  // 分类户型
  categorizeLayout(layout) {
    if (!layout || layout === '未知') return '未知'
    
    const match = layout.match(/(\d+)室/)
    if (match) {
      const roomCount = parseInt(match[1])
      if (roomCount === 1) return '一居室'
      else if (roomCount === 2) return '二居室'
      else if (roomCount === 3) return '三居室'
      else return '四居室及以上'
    }
    
    if (layout.includes('开间')) return '一居室'
    return '未知'
  }
}

// 区域详细图表配置
export const districtChartConfigs = {
  // 1. 小区房源数量排行
  communityRanking: (data) => ({
    title: { text: `热门小区房源排行 (${data[0]?.community ? '前10名' : '无数据'})`, left: 'center' },
    tooltip: { 
      trigger: 'axis',
      formatter: (params) => {
        const item = params[0]
        const dataItem = data.find(d => d.community === item.name)
        return `${item.name}<br/>房源数量: ${item.value}套<br/>平均租金: ¥${dataItem.avgPrice}/月<br/>平均面积: ${dataItem.avgArea}㎡`
      }
    },
    grid: {
      left: '25%',  // 增加左边距以显示完整的小区名称
      right: '4%',
      top: '10%',
      bottom: '3%'
    },
    xAxis: { type: 'value', name: '房源数量(套)' },
    yAxis: { 
      type: 'category', 
      data: data.slice(0, 10).map(item => item.community),
      axisLabel: { 
        fontSize: 11,
        interval: 0,  // 显示所有标签
        formatter: function(value) {
          // 如果名称太长，进行换行处理
          if (value.length > 8) {
            return value.substring(0, 8) + '\n' + value.substring(8)
          }
          return value
        }
      }
    },
    series: [{
      type: 'bar',
      data: data.slice(0, 10).map(item => item.count),
      itemStyle: { color: '#f59e0b' }
    }]
  }),

  // 2. 片区分布饼图
  subDistrictDistribution: (data) => ({
    title: { text: '片区房源分布', left: 'center' },
    tooltip: { 
      trigger: 'item',
      formatter: (params) => {
        const dataItem = data.find(d => d.subDistrict === params.name)
        return `${params.name}<br/>房源数量: ${params.value}套 (${params.percent}%)<br/>平均租金: ¥${dataItem.avgPrice}/月<br/>小区数量: ${dataItem.communityCount}个`
      }
    },
    legend: { 
      orient: 'vertical', 
      left: 'left',
      // 如果数据过多，隐藏图例
      show: data.length <= 8
    },
    series: [{
      type: 'pie',
      radius: '50%',
      data: data.map(item => ({ name: item.subDistrict, value: item.count })),
      label: {
        // 默认隐藏标签，减少视觉混乱
        show: false
      },
      labelLine: {
        show: false
      },
      emphasis: {
        label: {
          // 鼠标悬停时显示标签
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        },
        labelLine: {
          show: true
        },
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }),

  // 3. 详细价格分布柱状图
  detailedPriceDistribution: (data) => ({
    title: { text: '详细价格区间分布', left: 'center' },
    tooltip: { 
      trigger: 'axis',
      formatter: (params) => {
        const item = params[0]
        const total = data.reduce((sum, d) => sum + d.count, 0)
        return `${item.name}<br/>房源数量: ${item.value}套<br/>占比: ${((item.value / total) * 100).toFixed(1)}%`
      }
    },
    xAxis: { 
      type: 'category', 
      data: data.map(item => item.range),
      axisLabel: { rotate: 45 }
    },
    yAxis: { type: 'value', name: '房源数量(套)' },
    series: [{
      type: 'bar',
      data: data.map(item => item.count),
      itemStyle: { 
        color: (params) => {
          const colors = ['#22c55e', '#84cc16', '#eab308', '#f59e0b', '#ef4444', '#dc2626', '#991b1b', '#7f1d1d']
          return colors[params.dataIndex] || '#6b7280'
        }
      }
    }]
  }),

  // 4. 面积分布环形图
  areaDistribution: (data) => ({
    title: { text: '房源面积分布', left: 'center' },
    tooltip: { 
      trigger: 'item',
      formatter: (params) => `${params.name}<br/>数量: ${params.value}套 (${params.percent}%)`
    },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: data.map(item => ({ name: item.range, value: item.count })),
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      }
    }]
  }),

  // 5. 价格面积散点图
  priceAreaScatter: (data) => ({
    title: { text: '价格与面积相关性分析', left: 'center' },
    tooltip: { 
      trigger: 'item',
      formatter: (params) => `小区: ${params.data[2]}<br/>面积: ${params.data[0]}㎡<br/>租金: ¥${params.data[1]}/月`
    },
    xAxis: { 
      type: 'value', 
      name: '面积(㎡)',
      nameLocation: 'middle',
      nameGap: 30
    },
    yAxis: { 
      type: 'value', 
      name: '租金(元/月)',
      nameLocation: 'middle',
      nameGap: 50
    },
    series: [{
      type: 'scatter',
      data: data,
      symbolSize: 8,
      itemStyle: { color: '#8b5cf6', opacity: 0.7 },
      emphasis: { itemStyle: { color: '#7c3aed' } }
    }]
  }),

  // 6. 户型价格对比
  layoutPriceComparison: (data) => ({
    title: { text: '不同户型价格对比', left: 'center' },
    tooltip: { 
      trigger: 'axis',
      formatter: (params) => {
        const seriesData = params.map(p => {
          const dataItem = data.find(d => d.layout === p.name)
          return `${p.seriesName}: ¥${p.value}/月<br/>房源数量: ${dataItem.count}套`
        }).join('<br/>')
        return `${params[0].name}<br/>${seriesData}`      }
    },
    legend: { data: ['平均价格', '最低价格', '最高价格'], top: 30 },
    xAxis: { 
      type: 'category', 
      data: data.map(item => item.layout)
    },
    yAxis: { type: 'value', name: '租金(元/月)' },
    series: [
      {
        name: '平均价格',
        type: 'bar',
        data: data.map(item => item.avgPrice),
        itemStyle: { color: '#3b82f6' }
      },
      {
        name: '最低价格',
        type: 'line',
        data: data.map(item => item.minPrice),
        itemStyle: { color: '#10b981' }
      },
      {
        name: '最高价格',
        type: 'line',
        data: data.map(item => item.maxPrice),
        itemStyle: { color: '#ef4444' }
      }
    ]
  }),

  // 7. 热门标签词云图
  tagWordcloud: (data) => ({
    title: { text: '热门房源标签', left: 'center' },
    tooltip: { 
      trigger: 'axis',
      formatter: (params) => {
        const item = params[0]
        return `${item.name}: ${item.value}次出现`
      }
    },
    xAxis: { 
      type: 'category', 
      data: data.slice(0, 15).map(item => item.tag),
      axisLabel: { rotate: 45, fontSize: 10 }
    },
    yAxis: { type: 'value', name: '出现次数' },
    series: [{
      type: 'bar',
      data: data.slice(0, 15).map(item => item.count),
      itemStyle: { 
        color: (params) => {
          const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']
          return colors[params.dataIndex % colors.length]
        }
      }
    }]
  }),

  // 8. 朝向偏好分析雷达图
  orientationRadar: (data) => ({
    title: { text: '朝向偏好分析', left: 'center' },
    tooltip: { trigger: 'item' },
    radar: {
      indicator: data.map(item => ({ 
        name: item.orientation, 
        max: Math.max(...data.map(d => d.count)) * 1.2 
      }))
    },
    series: [{
      type: 'radar',
      data: [{
        value: data.map(item => item.count),
        name: '房源数量'
      }],
      areaStyle: { color: 'rgba(59, 130, 246, 0.3)' }
    }]
  })
} 
