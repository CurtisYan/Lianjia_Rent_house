// 全市图表分析器 - 专门处理整个城市的数据分析
import { HouseDataAnalyzer } from './chartAnalysis.js'

export class CityChartAnalyzer extends HouseDataAnalyzer {
  constructor(data) {
    super(data)
  }

  // 各区域房源数量和均价对比
  getDistrictOverview() {
    const districtData = {}
    
    this.data.forEach(item => {
      const district = item.district || '未知'
      if (!districtData[district]) {
        districtData[district] = { count: 0, totalPrice: 0, areas: new Set() }
      }
      districtData[district].count++
      districtData[district].totalPrice += item.price
      districtData[district].areas.add(item.subDistrict)
    })

    return Object.entries(districtData)
      .map(([district, data]) => ({
        district,
        count: data.count,
        avgPrice: Math.round(data.totalPrice / data.count),
        subDistrictCount: data.areas.size
      }))
      .sort((a, b) => b.count - a.count)
  }

  // 区域房源密度热力图数据
  getDistrictHeatmapData() {
    const overview = this.getDistrictOverview()
    return {
      districts: overview.map(item => item.district),
      counts: overview.map(item => item.count),
      avgPrices: overview.map(item => item.avgPrice),
      matrix: overview.map((item, index) => [index, 0, item.count])
    }
  }

  // 区域价格区间分布
  getDistrictPriceRanges() {
    const ranges = ['≤2000', '2001-3000', '3001-4000', '4001-5000', '5001-8000', '>8000']
    const districtRanges = {}
    
    this.data.forEach(item => {
      const district = item.district || '未知'
      const price = item.price
      
      if (!districtRanges[district]) {
        districtRanges[district] = { '≤2000': 0, '2001-3000': 0, '3001-4000': 0, '4001-5000': 0, '5001-8000': 0, '>8000': 0 }
      }
      
      if (price <= 2000) districtRanges[district]['≤2000']++
      else if (price <= 3000) districtRanges[district]['2001-3000']++
      else if (price <= 4000) districtRanges[district]['3001-4000']++
      else if (price <= 5000) districtRanges[district]['4001-5000']++
      else if (price <= 8000) districtRanges[district]['5001-8000']++
      else districtRanges[district]['>8000']++
    })

    return { ranges, districts: Object.keys(districtRanges), data: districtRanges }
  }

  // 各区域户型分布对比
  getDistrictLayoutComparison() {
    const layouts = ['一居室', '二居室', '三居室', '四居室及以上']
    const districtLayouts = {}
    
    this.data.forEach(item => {
      const district = item.district || '未知'
      const layout = this.categorizeLayout(item.layout)
      
      if (!districtLayouts[district]) {
        districtLayouts[district] = { '一居室': 0, '二居室': 0, '三居室': 0, '四居室及以上': 0 }
      }
      districtLayouts[district][layout]++
    })

    return { layouts, districts: Object.keys(districtLayouts), data: districtLayouts }
  }

  // 区域房源流向桑基图（模拟租客选择流向）
  getDistrictFlowData() {
    const overview = this.getDistrictOverview()
    const links = []
    const nodes = []
    
    // 添加区域节点
    overview.forEach(item => {
      nodes.push({ name: item.district })
    })
    
    // 添加价格区间节点
    const priceRanges = ['低价区间', '中价区间', '高价区间']
    priceRanges.forEach(range => {
      nodes.push({ name: range })
    })
    
    // 生成流向链接
    overview.forEach(item => {
      let targetRange
      if (item.avgPrice <= 3000) targetRange = '低价区间'
      else if (item.avgPrice <= 6000) targetRange = '中价区间'
      else targetRange = '高价区间'
      
      links.push({
        source: item.district,
        target: targetRange,
        value: item.count
      })
    })

    return { nodes, links }
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

// 全市图表配置
export const cityChartConfigs = {
  // 1. 区域房源总览
  districtOverview: (data) => ({
    title: { text: '各区域房源分布总览', left: 'center' },
    tooltip: { 
      trigger: 'axis',
      formatter: (params) => {
        const item = params[0]
        return `${item.name}<br/>房源数量: ${item.value}套<br/>占比: ${((item.value / data.reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(1)}%`
      }
    },
    xAxis: { 
      type: 'category', 
      data: data.map(item => item.district),
      axisLabel: { rotate: 45 }
    },
    yAxis: { type: 'value', name: '房源数量(套)' },
    series: [{
      type: 'bar',
      data: data.map(item => item.count),
      itemStyle: { color: '#3b82f6' },
      emphasis: { itemStyle: { color: '#1d4ed8' } }
    }]
  }),

  // 2. 区域均价对比
  districtAvgPrice: (data) => ({
    title: { text: '各区域平均租金对比', left: 'center' },
    tooltip: { 
      trigger: 'axis',
      formatter: (params) => {
        const item = params[0]
        return `${item.name}<br/>平均租金: ¥${item.value}/月`
      }
    },
    xAxis: { 
      type: 'category', 
      data: data.map(item => item.district),
      axisLabel: { rotate: 45 }
    },
    yAxis: { type: 'value', name: '平均租金(元/月)' },
    series: [{
      type: 'line',
      data: data.map(item => item.avgPrice),
      smooth: true,
      lineStyle: { width: 3 },
      itemStyle: { color: '#10b981' },
      areaStyle: { color: 'rgba(16, 185, 129, 0.2)' }
    }]
  }),

  // 3. 区域价格区间分布堆叠图
  districtPriceRanges: (rangeData) => ({
    title: { text: '各区域价格区间分布', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { data: rangeData.ranges, top: 30 },
    xAxis: { 
      type: 'category', 
      data: rangeData.districts,
      axisLabel: { rotate: 45 }
    },
    yAxis: { type: 'value', name: '房源数量' },
    series: rangeData.ranges.map((range, index) => ({
      name: range,
      type: 'bar',
      stack: 'total',
      data: rangeData.districts.map(district => rangeData.data[district][range]),
      itemStyle: { 
        color: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'][index] 
      }
    }))
  }),

  // 4. 区域户型分布对比热力图
  districtLayoutHeatmap: (layoutData) => ({
    title: { text: '区域-户型分布热力图', left: 'center' },
    tooltip: { 
      position: 'top',
      formatter: (params) => {
        const district = layoutData.districts[params.data[1]]
        const layout = layoutData.layouts[params.data[0]]
        return `${district} - ${layout}<br/>数量: ${params.data[2]}套`
      }
    },
    xAxis: { 
      type: 'category', 
      data: layoutData.layouts,
      splitArea: { show: true }
    },
    yAxis: { 
      type: 'category', 
      data: layoutData.districts,
      splitArea: { show: true }
    },
    visualMap: {
      min: 0,
      max: Math.max(...layoutData.districts.flatMap(district => 
        layoutData.layouts.map(layout => layoutData.data[district][layout])
      )),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '10%'
    },
    series: [{
      type: 'heatmap',
      data: layoutData.districts.flatMap((district, yIndex) =>
        layoutData.layouts.map((layout, xIndex) => [
          xIndex, yIndex, layoutData.data[district][layout]
        ])
      ),
      label: { show: true },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' }}
    }]
  }),

  // 5. 区域房源流向桑基图
  districtFlow: (flowData) => ({
    title: { text: '区域房源价格流向分析', left: 'center' },
    tooltip: { trigger: 'item' },
    series: [{
      type: 'sankey',
      data: flowData.nodes,
      links: flowData.links,
      nodeWidth: 20,
      nodeGap: 8,
      layoutIterations: 32,
      itemStyle: { borderWidth: 1, borderColor: '#aaa' },
      lineStyle: { color: 'source', curveness: 0.5 }
    }]
  }),

  // 6. 各区域竞争力雷达图
  districtCompetitiveness: (data) => {
    const maxValues = {
      count: Math.max(...data.map(d => d.count)),
      avgPrice: Math.max(...data.map(d => d.avgPrice)),
      subDistrictCount: Math.max(...data.map(d => d.subDistrictCount))
    }
    
    return {
      title: { text: '区域综合竞争力对比', left: 'center' },
      tooltip: { trigger: 'item' },
      legend: { data: data.slice(0, 5).map(d => d.district), top: 30 },
      radar: {
        indicator: [
          { name: '房源数量', max: maxValues.count },
          { name: '平均租金', max: maxValues.avgPrice },
          { name: '片区覆盖', max: maxValues.subDistrictCount }
        ]
      },
      series: [{
        type: 'radar',
        data: data.slice(0, 5).map(item => ({
          value: [item.count, item.avgPrice, item.subDistrictCount],
          name: item.district
        }))
      }]
    }
  }
} 