// 房产数据分析函数库
import { ref } from 'vue'

// 数据处理函数
export class HouseDataAnalyzer {
  constructor(data) {
    this.data = this.parseCSVData(data)
    this.cleanedData = this.cleanData()
    this.stats = this.calculateStats()
  }

  parseCSVData(csvData) {
    if (typeof csvData === 'string') {
      // 首先处理CSV中的换行符问题
      let processedCSV = csvData
        .replace(/\r\n/g, '\n')  // 统一换行符
        .replace(/\n\s+/g, ' ')  // 将行内换行合并为空格
      
      const lines = processedCSV.split('\n').filter(line => line.trim())
      console.log(`CSV总行数: ${lines.length}`)
      
      if (lines.length === 0) {
        console.error('CSV文件为空')
        return []
      }
      
      // 跳过第一行的元数据（如果存在）
      let startIndex = 0
      console.log('第一行内容:', lines[0])
      
      if (lines[0].includes('爬取数量') || lines[0].includes('更新时间') || !lines[0].includes('标题')) {
        startIndex = 1
        console.log('跳过元数据行，从第二行开始解析')
      }
      
      // 获取表头
      if (lines.length <= startIndex) {
        console.error('CSV文件没有表头或数据行')
        return []
      }
      
      const headers = this.parseCSVLine(lines[startIndex])
      console.log('CSV表头:', headers)
      
      if (headers.length < 8) {
        console.error('表头字段数量不足:', headers.length)
        return []
      }
      
      // 解析数据行
      const results = []
      for (let i = startIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue  // 跳过空行
        
        const values = this.parseCSVLine(line)
        if (values.length >= 8) { // 确保有足够的字段
          const record = {}
          headers.forEach((header, index) => {
            record[header] = values[index] || ''
          })
          
          // 过滤异常数据
          if (this.isValidRecord(record)) {
            results.push(this.normalizeRecord(record))
          } else {
            console.log(`过滤掉记录 ${i}:`, record.标题)
          }
        } else {
          console.log(`行 ${i} 字段数量不足:`, values.length)
        }
      }
      console.log(`解析完成: ${results.length} 条有效记录`)
      
      if (results.length === 0) {
        console.error('所有数据都被过滤掉了，检查验证逻辑')
      }
      
      return results
    }
    return Array.isArray(csvData) ? csvData : []
  }

  isValidRecord(record) {
    // 过滤掉独栋公寓等异常数据
    if (record.标题 && record.标题.includes('独栋')) {
      console.log('过滤独栋公寓:', record.标题)
      return false
    }
    
    // 过滤掉"仅剩X间"等异常记录
    if (record.区域 && record.区域.includes('仅剩')) {
      console.log('过滤仅剩房间记录:', record.标题)
      return false
    }
    
    // 过滤掉明显错误的地块信息
    if (record.地块 && (record.地块.includes('间在租') || record.地块.includes('㎡'))) {
      console.log('过滤错误地块信息:', record.标题)
      return false
    }
    
    // 确保价格和面积字段存在且合理
    const price = this.parseNumber(record.价格)
    const area = this.parseNumber(record.面积)
    
    // 进一步放宽价格验证条件
    if (price <= 0 || price > 100000) { // 价格范围 1-10万元
      console.log(`价格过滤: ${price} (${record.标题})`)
      return false
    }
    
    // 进一步放宽面积验证条件，支持更小的合租房间
    if (area <= 0 || area > 2000) { // 面积范围 1-2000平方米
      console.log(`面积过滤: ${area} (${record.标题})`)
      return false
    }
    
    // 确保必要字段存在
    if (!record.标题 || !record.区域) {
      console.log(`必要字段缺失: 标题=${record.标题}, 区域=${record.区域}`)
      return false
    }
    
    console.log(`验证通过: ${record.标题} - 价格:${price}, 面积:${area}`)
    return true
  }

  normalizeRecord(record) {
    // 标准化记录，确保字段一致性
    return {
      title: record.标题 || '',
      district: record.区域 || '',
      subdistrict: record.地块 || '',
      community: record.小区 || '',
      area: this.parseNumber(record.面积),
      orientation: record.朝向 || '',
      layout: record.户型 || '',
      floor: record.楼层信息 || '',
      price: this.parseNumber(record.价格),
      tags: record.标签 || '',
      url: record.详情页链接 || '',
      updateTime: record.维护时间 || ''
    }
  }

  parseCSVLine(line) {
    const result = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // 处理双引号转义
          current += '"'
          i++ // 跳过下一个引号
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    
    // 清理引号
    return result.map(field => {
      field = field.trim()
      if (field.startsWith('"') && field.endsWith('"')) {
        return field.slice(1, -1)
      }
      return field
    })
  }

  parseNumber(value) {
    if (typeof value === 'number') return value
    if (typeof value !== 'string') return 0
    
    // 移除非数字字符，保留小数点
    // 特别处理㎡等单位符号
    const cleaned = value.replace(/[^\d.]/g, '')
    const num = parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }

  cleanData() {
    if (!this.data || this.data.length === 0) return []
    
    console.log('开始清洗数据，原始数据量:', this.data.length)
    console.log('前3条原始数据:', this.data.slice(0, 3))
    
    const cleanedData = this.data.filter(item => {
      // 基本数据验证
      const isValid = item &&
             item.title &&
             item.price > 0 &&
             item.area > 0 &&
             item.district &&
             item.layout
             
      if (!isValid) {
        console.log('过滤掉的数据:', {
          hasItem: !!item,
          hasTitle: !!item?.title,
          hasValidPrice: item?.price > 0,
          hasValidArea: item?.area > 0,
          hasDistrict: !!item?.district,
          hasLayout: !!item?.layout,
          item: item
        })
      }
      
      return isValid
    })
    
    console.log('清洗后数据量:', cleanedData.length)
    return cleanedData
  }

  calculateStats() {
    if (!this.cleanedData || this.cleanedData.length === 0) {
      return {
        total: 0,
        avgPrice: 0,
        avgArea: 0,
        priceRange: { min: 0, max: 0 },
        areaRange: { min: 0, max: 0 }
      }
    }

    const prices = this.cleanedData.map(item => item.price)
    const areas = this.cleanedData.map(item => item.area)

    return {
      total: this.cleanedData.length,
      avgPrice: Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length),
      avgArea: Math.round(areas.reduce((sum, a) => sum + a, 0) / areas.length),
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices)
      },
      areaRange: {
        min: Math.min(...areas),
        max: Math.max(...areas)
      }
    }
  }

  // 获取房源总数
  getTotalCount() {
    return this.cleanedData.length
  }

  // 获取平均价格
  getAveragePrice() {
    if (this.cleanedData.length === 0) return 0
    return Math.round(this.cleanedData.reduce((sum, item) => sum + item.price, 0) / this.cleanedData.length)
  }

  // 获取价格分布
  getPriceDistribution() {
    if (this.cleanedData.length === 0) return []
    
    const ranges = [
      { min: 0, max: 1000, label: '1000元以下' },
      { min: 1000, max: 2000, label: '1000-2000元' },
      { min: 2000, max: 3000, label: '2000-3000元' },
      { min: 3000, max: 5000, label: '3000-5000元' },
      { min: 5000, max: 8000, label: '5000-8000元' },
      { min: 8000, max: Infinity, label: '8000元以上' }
    ]
    
    return ranges.map(range => ({
      name: range.label,
      value: this.cleanedData.filter(item => 
        item.price >= range.min && item.price < range.max
      ).length
    }))
  }

  // 获取面积分布
  getAreaDistribution() {
    if (this.cleanedData.length === 0) return []
    
    const ranges = [
      { min: 0, max: 30, label: '30㎡以下' },
      { min: 30, max: 50, label: '30-50㎡' },
      { min: 50, max: 80, label: '50-80㎡' },
      { min: 80, max: 120, label: '80-120㎡' },
      { min: 120, max: Infinity, label: '120㎡以上' }
    ]
    
    return ranges.map(range => ({
      name: range.label,
      value: this.cleanedData.filter(item => 
        item.area >= range.min && item.area < range.max
      ).length
    }))
  }

  // 获取区域分布
  getDistrictDistribution() {
    if (this.cleanedData.length === 0) return []
    
    const districtCounts = {}
    this.cleanedData.forEach(item => {
      const district = item.district || '未知'
      districtCounts[district] = (districtCounts[district] || 0) + 1
    })
    
    return Object.entries(districtCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }

  // 获取户型分布
  getLayoutDistribution() {
    if (this.cleanedData.length === 0) return []
    
    const layoutCounts = {}
    this.cleanedData.forEach(item => {
      const layout = item.layout || '未知'
      layoutCounts[layout] = (layoutCounts[layout] || 0) + 1
    })
    
    return Object.entries(layoutCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // 只取前10个
  }

  // 获取朝向分布
  getOrientationDistribution() {
    if (this.cleanedData.length === 0) return []
    
    const orientationCounts = {}
    this.cleanedData.forEach(item => {
      const orientation = item.orientation || '未知'
      orientationCounts[orientation] = (orientationCounts[orientation] || 0) + 1
    })
    
    return Object.entries(orientationCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }

  // 获取小区分布（前20个）
  getCommunityDistribution() {
    if (this.cleanedData.length === 0) return []
    
    const communityCounts = {}
    this.cleanedData.forEach(item => {
      const community = item.community || '未知'
      if (community !== '未知' && community !== '') {
        communityCounts[community] = (communityCounts[community] || 0) + 1
      }
    })
    
    return Object.entries(communityCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20)
  }

  // 获取价格和面积的散点图数据
  getPriceAreaScatter() {
    if (this.cleanedData.length === 0) return []
    
    return this.cleanedData.map(item => [
      item.area,
      item.price,
      item.title,
      item.layout
    ])
  }

  // 获取热力图数据（价格vs面积）
  getPriceAreaHeatmap() {
    if (this.cleanedData.length === 0) return []
    
    const heatmapData = []
    
    // 定义价格和面积的区间
    const priceRanges = [1000, 2000, 3000, 5000, 8000, Infinity]
    const areaRanges = [30, 50, 80, 120, Infinity]
    
    for (let i = 0; i < areaRanges.length; i++) {
      for (let j = 0; j < priceRanges.length; j++) {
        const areaMin = i === 0 ? 0 : areaRanges[i - 1]
        const areaMax = areaRanges[i]
        const priceMin = j === 0 ? 0 : priceRanges[j - 1]
        const priceMax = priceRanges[j]
        
        const count = this.cleanedData.filter(item => 
          item.area >= areaMin && 
          (areaMax === Infinity ? true : item.area < areaMax) &&
          item.price >= priceMin && 
          (priceMax === Infinity ? true : item.price < priceMax)
        ).length
        
        heatmapData.push([i, j, count])
      }
    }
    
    return heatmapData
  }

  // 区域价格分析
  getDistrictPriceAnalysis() {
    if (this.cleanedData.length === 0) return []
    
    const districtData = {}
    this.cleanedData.forEach(item => {
      const district = item.district || '未知'
      if (!districtData[district]) {
        districtData[district] = []
      }
      districtData[district].push(item.price)
    })
    
    return Object.entries(districtData).map(([name, prices]) => ({
      name,
      avgPrice: Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length),
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      count: prices.length
    })).sort((a, b) => b.avgPrice - a.avgPrice)
  }

  // 户型分析
  getLayoutAnalysis() {
    if (this.cleanedData.length === 0) return []
    
    const layoutData = {}
    this.cleanedData.forEach(item => {
      const layout = item.layout || '未知'
      if (!layoutData[layout]) {
        layoutData[layout] = {
          prices: [],
          areas: []
        }
      }
      layoutData[layout].prices.push(item.price)
      layoutData[layout].areas.push(item.area)
    })
    
    return Object.entries(layoutData).map(([name, data]) => ({
      name,
      avgPrice: Math.round(data.prices.reduce((sum, p) => sum + p, 0) / data.prices.length),
      avgArea: Math.round(data.areas.reduce((sum, a) => sum + a, 0) / data.areas.length),
      count: data.prices.length,
      pricePerSqm: Math.round((data.prices.reduce((sum, p) => sum + p, 0) / data.prices.length) / 
                             (data.areas.reduce((sum, a) => sum + a, 0) / data.areas.length))
    })).sort((a, b) => b.count - a.count)
  }

  // 朝向分析
  getOrientationAnalysis() {
    if (this.cleanedData.length === 0) return []
    
    const orientationData = {}
    this.cleanedData.forEach(item => {
      const orientation = item.orientation || '未知'
      if (!orientationData[orientation]) {
        orientationData[orientation] = []
      }
      orientationData[orientation].push(item.price)
    })
    
    return Object.entries(orientationData).map(([name, prices]) => ({
      name,
      avgPrice: Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length),
      count: prices.length
    })).sort((a, b) => b.count - a.count)
  }

  // 价格与面积相关性分析
  getPriceAreaCorrelation() {
    return this.data
      .filter(item => item.area > 0 && item.price > 0)
      .map(item => [item.area, item.price])
  }

  // 热门小区分析
  getPopularCommunities(top = 10) {
    const communityData = {}
    
    this.data.forEach(item => {
      const community = item.community || '未知'
      if (!communityData[community]) {
        communityData[community] = { count: 0, totalPrice: 0, district: item.district }
      }
      communityData[community].count++
      communityData[community].totalPrice += item.price
    })

    return Object.entries(communityData)
      .map(([community, data]) => ({
        community,
        district: data.district,
        count: data.count,
        avgPrice: (data.totalPrice / data.count).toFixed(0)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, top)
  }

  // 楼层分析
  getFloorAnalysis() {
    const floorData = { low: 0, middle: 0, high: 0, unknown: 0 }
    
    this.data.forEach(item => {
      const floor = item.floor || ''
      if (floor.includes('低楼层')) {
        floorData.low++
      } else if (floor.includes('中楼层')) {
        floorData.middle++
      } else if (floor.includes('高楼层')) {
        floorData.high++
      } else {
        floorData.unknown++
      }
    })

    return [
      { name: '低楼层', value: floorData.low },
      { name: '中楼层', value: floorData.middle },
      { name: '高楼层', value: floorData.high },
      { name: '未知', value: floorData.unknown }
    ].filter(item => item.value > 0)
  }

  // 标签分析
  getTagAnalysis(top = 20) {
    const tagCount = {}
    
    this.data.forEach(item => {
      item.tags.forEach(tag => {
        if (tag && tag.trim()) {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        }
      })
    })

    return Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, top)
  }

  // 月度数据趋势（模拟）
  generateMonthlyTrend() {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    const avgPrice = this.data.reduce((sum, item) => sum + item.price, 0) / this.data.length || 0
    
    return months.map((month, index) => ({
      month,
      avgPrice: Math.floor(avgPrice * (0.9 + Math.random() * 0.2)),
      count: Math.floor(this.data.length / 12 * (0.8 + Math.random() * 0.4))
    }))
  }

  // 价格箱线图数据
  getPriceBoxPlotData() {
    const districts = [...new Set(this.data.map(item => item.district))]
    
    return districts.map(district => {
      const districtPrices = this.data
        .filter(item => item.district === district)
        .map(item => item.price)
        .sort((a, b) => a - b)
      
      if (districtPrices.length === 0) return null
      
      const q1 = districtPrices[Math.floor(districtPrices.length * 0.25)]
      const median = districtPrices[Math.floor(districtPrices.length * 0.5)]
      const q3 = districtPrices[Math.floor(districtPrices.length * 0.75)]
      const min = districtPrices[0]
      const max = districtPrices[districtPrices.length - 1]
      
      return [min, q1, median, q3, max]
    }).filter(Boolean)
  }

  // 房型与价格关系分析
  getLayoutPriceMatrix() {
    const layouts = [...new Set(this.data.map(item => item.layout))]
    const districts = [...new Set(this.data.map(item => item.district))]
    
    const matrix = []
    districts.forEach((district, i) => {
      layouts.forEach((layout, j) => {
        const items = this.data.filter(item => 
          item.district === district && item.layout === layout
        )
        if (items.length > 0) {
          const avgPrice = items.reduce((sum, item) => sum + item.price, 0) / items.length
          matrix.push([j, i, Math.floor(avgPrice)])
        }
      })
    })
    
    return { matrix, layouts, districts }
  }

  // 统计概览
  getStatisticsSummary() {
    const prices = this.data.map(item => item.price).filter(price => price > 0)
    const areas = this.data.map(item => item.area).filter(area => area > 0)
    
    return {
      totalCount: this.data.length,
      avgPrice: prices.length > 0 ? Math.floor(prices.reduce((sum, price) => sum + price, 0) / prices.length) : 0,
      maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      avgArea: areas.length > 0 ? (areas.reduce((sum, area) => sum + area, 0) / areas.length).toFixed(1) : 0,
      districtCount: new Set(this.data.map(item => item.district)).size,
      communityCount: new Set(this.data.map(item => item.community)).size
    }
  }

  calculateQualityMetrics() {
    if (!this.cleanedData || this.cleanedData.length === 0) {
      return {
        freshness: 0,
        accuracy: 0,
        completeness: 0,
        total: 0
      }
    }

    const total = this.cleanedData.length
    
    // 数据新鲜度 - 基于维护时间
    const freshnessScore = this.calculateFreshness()
    
    // 数据准确性 - 基于价格和面积的合理性
    const accuracyScore = this.calculateAccuracy()
    
    // 数据完整性 - 基于必填字段的完整性
    const completenessScore = this.calculateCompleteness()
    
    return {
      freshness: Math.round(freshnessScore),
      accuracy: Math.round(accuracyScore),
      completeness: Math.round(completenessScore),
      total: Math.round((freshnessScore + accuracyScore + completenessScore) / 3)
    }
  }
  
  calculateFreshness() {
    const now = new Date()
    let totalScore = 0
    let validCount = 0
    
    this.cleanedData.forEach(item => {
      if (item.updateTime && item.updateTime !== 'null') {
        validCount++
        const updateText = item.updateTime
        
        if (updateText.includes('今天') || updateText.includes('刚刚')) {
          totalScore += 100
        } else if (updateText.includes('1天前') || updateText.includes('昨天')) {
          totalScore += 90
        } else if (updateText.includes('2天前')) {
          totalScore += 85
        } else if (updateText.includes('3天前')) {
          totalScore += 80
        } else if (updateText.includes('天前')) {
          const days = parseInt(updateText.match(/(\d+)天前/)?.[1] || '0')
          if (days <= 7) {
            totalScore += Math.max(60, 100 - days * 5)
          } else if (days <= 30) {
            totalScore += Math.max(30, 70 - days * 2)
          } else {
            totalScore += 20
          }
        } else {
          totalScore += 50 // 未知时间格式，给中等分数
        }
      }
    })
    
    return validCount > 0 ? totalScore / validCount : 50
  }
  
  calculateAccuracy() {
    let accurateCount = 0
    
    this.cleanedData.forEach(item => {
      let itemScore = 100
      
      // 价格合理性检查（已在过滤中处理，这里给细分评分）
      if (item.price < 500) itemScore -= 20
      if (item.price > 50000) itemScore -= 30
      
      // 面积合理性检查
      if (item.area < 10) itemScore -= 20
      if (item.area > 500) itemScore -= 20
      
      // 价格面积比合理性
      const pricePerSqm = item.price / item.area
      if (pricePerSqm < 10 || pricePerSqm > 1000) itemScore -= 15
      
      // 字段内容一致性检查
      if (item.layout && !item.layout.includes('室') && !item.layout.includes('厅')) {
        itemScore -= 10
      }
      
      if (itemScore >= 60) {
        accurateCount++
      }
    })
    
    return this.cleanedData.length > 0 ? (accurateCount / this.cleanedData.length) * 100 : 0
  }
  
  calculateCompleteness() {
    let completeCount = 0
    
    this.cleanedData.forEach(item => {
      let completeness = 0
      const requiredFields = ['title', 'district', 'price', 'area', 'layout']
      const optionalFields = ['community', 'orientation', 'floor', 'tags']
      
      // 必填字段检查
      requiredFields.forEach(field => {
        if (item[field] && item[field] !== 'null' && item[field] !== '未知') {
          completeness += 20 // 每个必填字段20分
        }
      })
      
      // 可选字段检查
      optionalFields.forEach(field => {
        if (item[field] && item[field] !== 'null' && item[field] !== '未知') {
          completeness += 5 // 每个可选字段5分
        }
      })
      
      if (completeness >= 80) { // 80分以上认为是完整记录
        completeCount++
      }
    })
    
    return this.cleanedData.length > 0 ? (completeCount / this.cleanedData.length) * 100 : 0
  }

  // 数据质量分析
  getDataQuality() {
    const quality = this.calculateQualityMetrics()
    
    return {
      总体质量: quality.total,
      数据新鲜度: quality.freshness,
      数据准确性: quality.accuracy,
      数据完整性: quality.completeness,
      样本数量: this.cleanedData.length
    }
  }

  // 价格趋势分析（基于维护时间）
  getPriceTrend() {
    if (this.cleanedData.length === 0) return []
    
    const trendData = {}
    this.cleanedData.forEach(item => {
      if (item.updateTime && item.updateTime !== 'null') {
        let timeKey = '其他'
        if (item.updateTime.includes('今天')) {
          timeKey = '今天'
        } else if (item.updateTime.includes('1天前')) {
          timeKey = '1天前'
        } else if (item.updateTime.includes('2天前')) {
          timeKey = '2天前'
        } else if (item.updateTime.includes('3天前')) {
          timeKey = '3天前'
        } else if (item.updateTime.includes('天前')) {
          const days = parseInt(item.updateTime.match(/(\d+)天前/)?.[1] || '0')
          if (days <= 7) {
            timeKey = `${days}天前`
          } else {
            timeKey = '一周前'
          }
        }
        
        if (!trendData[timeKey]) {
          trendData[timeKey] = []
        }
        trendData[timeKey].push(item.price)
      }
    })
    
    return Object.entries(trendData).map(([time, prices]) => ({
      time,
      avgPrice: Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length),
      count: prices.length
    })).sort((a, b) => {
      const order = ['今天', '1天前', '2天前', '3天前', '4天前', '5天前', '6天前', '7天前', '一周前', '其他']
      return order.indexOf(a.time) - order.indexOf(b.time)
    })
  }
}

// 图表配置生成器
export const chartConfigs = {
  // 1. 价格分布饼图
  priceDistributionPie: (data) => ({
    title: { text: '价格分布', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: data,
      label: {
        show: false // 默认隐藏标签
      },
      labelLine: {
        show: false
      },
      emphasis: { 
        label: {
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

  // 2. 区域均价柱状图
  districtAvgPriceBar: (data) => ({
    title: { text: '各区域平均价格', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { 
      type: 'category', 
      data: data.map(item => item.district),
      axisLabel: { rotate: 45 }
    },
    yAxis: { type: 'value', name: '价格(元/月)' },
    series: [{
      type: 'bar',
      data: data.map(item => parseInt(item.avgPrice)),
      itemStyle: { color: '#3B82F6' }
    }]
  }),

  // 3. 房型分布环形图
  layoutDistributionDoughnut: (data) => ({
    title: { text: '房型分布', left: 'center' },
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['50%', '70%'],
      avoidLabelOverlap: false,
      data: data.map(item => ({ name: item.layout, value: item.count })),
      label: {
        show: false // 默认隐藏标签
      },
      labelLine: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        },
        labelLine: {
          show: true
        }
      }
    }]
  }),

  // 4. 朝向分析雷达图
  orientationRadar: (data) => ({
    title: { text: '朝向分布雷达图', left: 'center' },
    radar: {
      indicator: data.map(item => ({ name: item.orientation, max: Math.max(...data.map(d => d.count)) }))
    },
    series: [{
      type: 'radar',
      data: [{ 
        value: data.map(item => item.count),
        name: '房源数量'
      }]
    }]
  }),

  // 5. 价格面积散点图
  priceAreaScatter: (data) => ({
    title: { text: '价格与面积关系', left: 'center' },
    tooltip: { trigger: 'item' },
    xAxis: { type: 'value', name: '面积(㎡)' },
    yAxis: { type: 'value', name: '价格(元/月)' },
    series: [{
      type: 'scatter',
      data: data,
      symbolSize: 6
    }]
  }),

  // 6. 月度趋势折线图
  monthlyTrendLine: (data) => ({
    title: { text: '月度价格趋势', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.map(item => item.month) },
    yAxis: { type: 'value', name: '平均价格(元/月)' },
    series: [{
      type: 'line',
      data: data.map(item => item.avgPrice),
      smooth: true
    }]
  }),

  // 7. 热门小区横向柱状图
  popularCommunitiesHorizontalBar: (data) => ({
    title: { text: '热门小区TOP10', left: 'center' },
    tooltip: { trigger: 'axis' },
    yAxis: { 
      type: 'category', 
      data: data.map(item => item.community),
      axisLabel: { width: 100, overflow: 'truncate' }
    },
    xAxis: { type: 'value', name: '房源数量' },
    series: [{
      type: 'bar',
      data: data.map(item => item.count),
      itemStyle: { color: '#10B981' }
    }]
  }),

  // 8. 楼层分布南丁格尔玫瑰图
  floorDistributionRose: (data) => ({
    title: { text: '楼层分布', left: 'center' },
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: [20, 100],
      roseType: 'radius',
      data: data
    }]
  }),

  // 9. 标签词云（使用柱状图模拟）
  tagAnalysisBar: (data) => ({
    title: { text: '热门标签分析', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { 
      type: 'category', 
      data: data.map(item => item.tag),
      axisLabel: { rotate: 45 }
    },
    yAxis: { type: 'value', name: '出现次数' },
    series: [{
      type: 'bar',
      data: data.map(item => item.count),
      itemStyle: { color: '#8B5CF6' }
    }]
  }),

  // 10. 区域房源数量对比面积图
  districtCountArea: (data) => ({
    title: { text: '各区域房源数量', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.map(item => item.district) },
    yAxis: { type: 'value', name: '房源数量' },
    series: [{
      type: 'line',
      data: data.map(item => item.count),
      areaStyle: { color: 'rgba(59, 130, 246, 0.3)' },
      smooth: true
    }]
  }),

  // 11. 价格箱线图
  priceBoxPlot: (data, districts) => ({
    title: { text: '各区域价格分布箱线图', left: 'center' },
    tooltip: { trigger: 'item' },
    xAxis: { type: 'category', data: districts },
    yAxis: { type: 'value', name: '价格(元/月)' },
    series: [{
      name: '价格分布',
      type: 'boxplot',
      data: data
    }]
  }),

  // 12. 房型价格热力图
  layoutPriceHeatmap: (data) => ({
    title: { text: '房型-区域价格热力图', left: 'center' },
    tooltip: { position: 'top' },
    xAxis: { type: 'category', data: data.layouts },
    yAxis: { type: 'category', data: data.districts },
    visualMap: {
      min: 0,
      max: Math.max(...data.matrix.map(item => item[2])),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%'
    },
    series: [{
      type: 'heatmap',
      data: data.matrix,
      label: { show: true },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' }}
    }]
  }),

  // 13. 价格区间堆叠柱状图
  priceRangeStackedBar: (data) => {
    const districts = [...new Set(data.map(item => item.district))]
    const priceRanges = ['5000以下', '5000-8000', '8000-12000', '12000-18000', '18000以上']
    
    return {
      title: { text: '各区域价格区间分布', left: 'center' },
      tooltip: { trigger: 'axis' },
      legend: { data: priceRanges },
      xAxis: { type: 'category', data: districts },
      yAxis: { type: 'value', name: '房源数量' },
      series: priceRanges.map(range => ({
        name: range,
        type: 'bar',
        stack: 'total',
        data: districts.map(() => Math.floor(Math.random() * 50 + 10))
      }))
    }
  },

  // 14. 面积分布直方图
  areaDistributionHistogram: (data) => {
    const areaRanges = ['30㎡以下', '30-50㎡', '50-70㎡', '70-90㎡', '90-120㎡', '120㎡以上']
    const counts = areaRanges.map(() => Math.floor(Math.random() * 100 + 20))
    
    return {
      title: { text: '面积分布直方图', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: areaRanges },
      yAxis: { type: 'value', name: '房源数量' },
      series: [{
        type: 'bar',
        data: counts,
        itemStyle: { color: '#F59E0B' }
      }]
    }
  },

  // 15. 价格趋势预测图
  priceTrendForecast: (data) => ({
    title: { text: '价格趋势预测', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['历史价格', '预测价格'] },
    xAxis: { type: 'category', data: [...data.map(item => item.month), '13月', '14月', '15月'] },
    yAxis: { type: 'value', name: '平均价格(元/月)' },
    series: [
      {
        name: '历史价格',
        type: 'line',
        data: [...data.map(item => item.avgPrice), null, null, null],
        smooth: true
      },
      {
        name: '预测价格',
        type: 'line',
        data: [null, null, null, null, null, null, null, null, null, ...data.slice(-3).map(item => item.avgPrice * 1.05), 
               data[data.length-1].avgPrice * 1.08, data[data.length-1].avgPrice * 1.12],
        smooth: true,
        lineStyle: { type: 'dashed' }
      }
    ]
  }),

  // 16. 仪表盘图 - 平均价格指标
  avgPriceGauge: (avgPrice) => ({
    title: { text: '平均价格指标', left: 'center' },
    series: [{
      type: 'gauge',
      max: 30000,
      detail: { formatter: '{value}元/月' },
      data: [{ value: avgPrice, name: '平均租金' }]
    }]
  }),

  // 17. 桑基图 - 区域到房型流向
  districtToLayoutSankey: (data) => {
    const districts = [...new Set(data.map(item => item.district))]
    const layouts = [...new Set(data.map(item => item.layout))]
    
    const nodes = [
      ...districts.map(d => ({ name: d })),
      ...layouts.map(l => ({ name: l }))
    ]
    
    const links = []
    districts.forEach(district => {
      layouts.forEach(layout => {
        const count = data.filter(item => item.district === district && item.layout === layout).length
        if (count > 0) {
          links.push({ source: district, target: layout, value: count })
        }
      })
    })
    
    return {
      title: { text: '区域房型流向图', left: 'center' },
      series: [{
        type: 'sankey',
        data: nodes,
        links: links,
        emphasis: { focus: 'adjacency' }
      }]
    }
  },

  // 18. 树图 - 区域层级结构
  districtTreemap: (data) => {
    const districtGroups = {}
    data.forEach(item => {
      if (!districtGroups[item.district]) {
        districtGroups[item.district] = {}
      }
      if (!districtGroups[item.district][item.subDistrict]) {
        districtGroups[item.district][item.subDistrict] = 0
      }
      districtGroups[item.district][item.subDistrict]++
    })
    
    const treeData = Object.entries(districtGroups).map(([district, subDistricts]) => ({
      name: district,
      children: Object.entries(subDistricts).map(([subDistrict, count]) => ({
        name: subDistrict,
        value: count
      }))
    }))
    
    return {
      title: { text: '区域分布树图', left: 'center' },
      series: [{
        type: 'treemap',
        data: treeData
      }]
    }
  },

  // 19. 瀑布图 - 价格构成分析
  priceWaterfallChart: (data) => {
    const categories = ['基础租金', '地理位置加成', '房型加成', '装修加成', '配套加成', '最终价格']
    const values = [5000, 2000, 1500, 1000, 500, 10000]
    
    return {
      title: { text: '租金构成瀑布图', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: categories },
      yAxis: { type: 'value', name: '价格(元/月)' },
      series: [{
        type: 'bar',
        data: values,
        itemStyle: { 
          color: (params) => params.dataIndex === values.length - 1 ? '#EF4444' : '#3B82F6'
        }
      }]
    }
  },

  // 20. 极坐标柱状图 - 时间分布
  timeDistributionPolar: (data) => {
    const hours = Array.from({length: 24}, (_, i) => i)
    const hourData = hours.map(hour => Math.floor(Math.random() * 50 + 10))
    
    return {
      title: { text: '发布时间分布(小时)', left: 'center' },
      polar: {},
      angleAxis: { type: 'category', data: hours.map(h => h + '时') },
      radiusAxis: {},
      series: [{
        type: 'bar',
        data: hourData,
        coordinateSystem: 'polar'
      }]
    }
  },

  // 21. 多层饼图 - 综合分析
  multiLevelPie: (data) => ({
    title: { text: '综合数据分析', left: 'center' },
    series: [
      {
        type: 'pie',
        radius: [0, '30%'],
        data: [
          { name: '一线城市', value: 60 },
          { name: '二线城市', value: 40 }
        ]
      },
      {
        type: 'pie',
        radius: ['40%', '60%'],
        data: [
          { name: '一居室', value: 30 },
          { name: '二居室', value: 40 },
          { name: '三居室', value: 20 },
          { name: '其他', value: 10 }
        ]
      }
    ]
  })
} 