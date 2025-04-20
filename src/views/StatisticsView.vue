<template>
  <div class="statistics-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>维修工作量统计</h3>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">本年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <el-row :gutter="20">
              <el-col :span="8" v-for="stat in workloadStats" :key="stat.title">
                <div class="stat-card">
                  <h4>{{ stat.title }}</h4>
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-trend" :class="stat.trend">
                    {{ stat.percentage }}
                    <el-icon><CaretTop v-if="stat.trend === 'up'" /><CaretBottom v-else /></el-icon>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>维修类型分布</h3>
            </div>
          </template>
          <div class="pie-chart-container">
            <v-chart class="chart" :option="pieChartOption" :autoresize="true" />
            <div class="chart-legend">
              <div v-for="item in repairTypeData" :key="item.type" class="legend-item">
                <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
                <span>{{ item.type }} ({{ item.percentage }}%)</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>维修评价统计</h3>
            </div>
          </template>
          <el-table :data="ratingStats" style="width: 100%">
            <el-table-column prop="maintainer" label="维修人员" />
            <el-table-column prop="completedCount" label="完成数" />
            <el-table-column prop="avgRating" label="平均评分">
              <template #default="{ row }">
                <el-rate v-model="row.avgRating" disabled show-score text-color="#ff9900" />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { CaretTop, CaretBottom } from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { LegendComponent, TooltipComponent, GridComponent, TitleComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { getRepairRatingVo } from '../api/repairsController'

use([
  CanvasRenderer,
  PieChart,
  LegendComponent,
  TooltipComponent,
  GridComponent,
  TitleComponent
])

const timeRange = ref('month')

// Mock数据 - 模拟接口返回的原始数据
const repairRecords = ref([
  { id: 1, type: '投影仪', priority: 'high', creatorId: 6, maintainerName: '张伟', score: 4.5, createdAt: '2025-03-14T01:00:00.000+00:00', updatedAt: '2025-04-12T05:19:22.000+00:00' },
  { id: 2, type: '空调', priority: 'medium', creatorId: 7, maintainerName: '张伟', score: 5, createdAt: '2025-03-13T06:30:00.000+00:00', updatedAt: '2025-03-15T12:44:37.000+00:00' },
  { id: 3, type: '电脑', priority: 'low', creatorId: 6, maintainerName: '刘强', score: 5, createdAt: '2025-03-12T02:15:00.000+00:00', updatedAt: '2025-03-15T12:44:37.000+00:00' },
  { id: 4, type: '水龙头', priority: 'high', creatorId: 8, maintainerName: '李明', score: 4.8, createdAt: '2025-03-14T05:00:00.000+00:00', updatedAt: '2025-03-15T12:44:37.000+00:00' },
  { id: 5, type: '电灯', priority: 'medium', creatorId: 9, maintainerName: '王华', score: 4.2, createdAt: '2025-03-14T07:30:00.000+00:00', updatedAt: '2025-03-15T12:44:37.000+00:00' },
  { id: 6, type: '打印机', priority: 'low', creatorId: 10, maintainerName: '张伟', score: 5, createdAt: '2025-03-13T01:45:00.000+00:00', updatedAt: '2025-03-15T12:44:37.000+00:00' },
  { id: 7, type: '椅子', priority: 'low', creatorId: 6, maintainerName: '刘强', score: 4.6, createdAt: '2025-03-14T03:00:00.000+00:00', updatedAt: '2025-03-15T12:44:37.000+00:00' },
  { id: 8, type: '门锁', priority: 'high', creatorId: 7, maintainerName: '李明', score: 4.9, createdAt: '2025-03-15T00:00:00.000+00:00', updatedAt: '2025-04-20T07:24:44.000+00:00' },
  { id: 9, type: '空调', priority: 'low', creatorId: 2, maintainerName: '王华', score: 4.7, createdAt: '2025-03-15T13:27:57.000+00:00', updatedAt: '2025-04-12T05:19:22.000+00:00' },
  { id: 10, type: '空调', priority: 'medium', creatorId: 13, maintainerName: '张伟', score: 5, createdAt: '2025-04-12T06:47:03.000+00:00', updatedAt: '2025-04-12T06:47:03.000+00:00' }
])

onMounted( async () => {
  // 获取数据并更新图表
  const res = await getRepairRatingVo();
  repairRecords.value = res.data.data;
})

// 计算工作量统计数据
const workloadStats = computed(() => {
  // 根据时间范围筛选当前时间段数据
  const now = new Date()
  const currentRecords = repairRecords.value.filter(record => {
    const recordDate = new Date(record.createdAt)
    if (timeRange.value === 'week') {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      return recordDate >= startOfWeek
    } else if (timeRange.value === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      return recordDate >= startOfMonth
    } else { // year
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      return recordDate >= startOfYear
    }
  })

  // 计算上一时间段的数据
  const previousRecords = repairRecords.value.filter(record => {
    const recordDate = new Date(record.createdAt)
    if (timeRange.value === 'week') {
      const startOfLastWeek = new Date(now)
      startOfLastWeek.setDate(now.getDate() - now.getDay() - 7)
      const endOfLastWeek = new Date(now)
      endOfLastWeek.setDate(now.getDate() - now.getDay())
      return recordDate >= startOfLastWeek && recordDate < endOfLastWeek
    } else if (timeRange.value === 'month') {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      return recordDate >= startOfLastMonth && recordDate <= endOfLastMonth
    } else { // year
      const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1)
      const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31)
      return recordDate >= startOfLastYear && recordDate <= endOfLastYear
    }
  })

  // 计算当前时间段的统计数据
  const currentTotalOrders = currentRecords.length
  const currentCompletedOrders = currentRecords.filter(record => record.status === 'completed').length || 0
  const currentAvgScore = currentCompletedOrders > 0
    ? (currentRecords.filter(record => record.score !== null).reduce((sum, record) => sum + (record.score || 0), 0) / currentCompletedOrders)
    : 0

  // 计算上一时间段的统计数据
  const previousTotalOrders = previousRecords.length
  const previousCompletedOrders = previousRecords.filter(record => record.status === 'completed').length || 0
  const previousAvgScore = previousCompletedOrders > 0
    ? (previousRecords.filter(record => record.score !== null).reduce((sum, record) => sum + (record.score || 0), 0) / previousCompletedOrders)
    : 0

  // 计算同比变化率
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%'
    const change = ((current - previous) / previous) * 100
    const cappedChange = Math.max(Math.min(change, 100), -100)
    return `${cappedChange > 0 ? '+' : ''}${cappedChange.toFixed(1)}%`
  }

  const currentCompletionRate = currentTotalOrders > 0 ? (currentCompletedOrders / currentTotalOrders) * 100 : 0
  const previousCompletionRate = previousTotalOrders > 0 ? (previousCompletedOrders / previousTotalOrders) * 100 : 0

  const periodText = timeRange.value === 'week' ? '上周' : timeRange.value === 'month' ? '上月' : '去年'
  
  return [
    { 
      title: '总维修工单', 
      value: currentTotalOrders, 
      percentage: calculatePercentageChange(currentTotalOrders, previousTotalOrders),
      trend: currentTotalOrders >= previousTotalOrders ? 'up' : 'down',
      comparison: `较${periodText}${previousTotalOrders}单`
    },
    { 
      title: '完成率', 
      value: currentTotalOrders > 0 ? `${Math.round(currentCompletionRate)}%` : '0%',
      percentage: calculatePercentageChange(currentCompletionRate, previousCompletionRate),
      trend: currentCompletionRate >= previousCompletionRate ? 'up' : 'down',
      comparison: `较${periodText}${Math.round(previousCompletionRate)}%`
    },
    { 
      title: '满意度评分', 
      value: currentAvgScore.toFixed(1),
      percentage: calculatePercentageChange(currentAvgScore, previousAvgScore),
      trend: currentAvgScore >= previousAvgScore ? 'up' : 'down',
      comparison: `较${periodText}${previousAvgScore.toFixed(1)}分`
    }
  ]
})

// 计算维修类型分布数据
const repairTypeData = computed(() => {
  const typeCount = {}
  let totalCount = 0
  
  // 根据时间范围筛选数据
  const now = new Date()
  const filteredRecords = repairRecords.value.filter(record => {
    const recordDate = new Date(record.createdAt)
    if (timeRange.value === 'week') {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      return recordDate >= startOfWeek
    } else if (timeRange.value === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      return recordDate >= startOfMonth
    } else { // year
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      return recordDate >= startOfYear
    }
  })

  filteredRecords.forEach(record => {
    if (record.type) {
      typeCount[record.type] = (typeCount[record.type] || 0) + 1
      totalCount++
    }
  })
  
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
  return Object.entries(typeCount).map(([type, count], index) => ({
    type,
    value: count,
    percentage: totalCount > 0 ? Math.round(count / totalCount * 100) : 0,
    color: colors[index % colors.length]
  }))
})

// 配置饼图选项
const pieChartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  series: [{
    type: 'pie',
    radius: ['50%', '70%'],
    center: ['50%', '50%'],
    data: repairTypeData.value.map(item => ({
      name: item.type,
      value: item.value,
      itemStyle: {
        color: item.color
      }
    })),
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    },
    label: {
      show: false
    },
    labelLine: {
      show: false
    }
  }]
}))

// 计算维修人员评分统计
const ratingStats = computed(() => {
  const maintainerStats = {}
  
  // 根据时间范围筛选数据
  const now = new Date()
  const filteredRecords = repairRecords.value.filter(record => {
    const recordDate = new Date(record.createdAt)
    if (timeRange.value === 'week') {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      return recordDate >= startOfWeek
    } else if (timeRange.value === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      return recordDate >= startOfMonth
    } else { // year
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      return recordDate >= startOfYear
    }
  })

  filteredRecords.forEach(record => {
    if (!record.maintainerName) return
    if (!maintainerStats[record.maintainerName]) {
      maintainerStats[record.maintainerName] = {
        maintainer: record.maintainerName,
        completedCount: 0,
        ratedCount: 0,
        totalScore: 0
      }
    }
    maintainerStats[record.maintainerName].completedCount++
    if (record.score !== null && record.score !== undefined) {
      maintainerStats[record.maintainerName].ratedCount++
      maintainerStats[record.maintainerName].totalScore += record.score
    }
  })
  
  return Object.values(maintainerStats).map(stat => ({
    maintainer: stat.maintainer,
    completedCount: stat.completedCount,
    avgRating: stat.ratedCount > 0 ? (stat.totalScore / stat.ratedCount).toFixed(1) : '0.0'
  })).sort((a, b) => parseFloat(b.avgRating) - parseFloat(a.avgRating))
})
</script>

<style scoped lang="scss">
.statistics-container {
  padding: 20px;

  .chart-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
      }
    }
  }

  .chart-container {
    min-height: 200px;
  }

  .stat-card {
    padding: 20px;
    text-align: center;
    background-color: #f8f9fa;
    border-radius: 8px;

    h4 {
      margin: 0 0 10px;
      color: #606266;
    }

    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #303133;
    }

    .stat-trend {
      margin-top: 10px;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;

      &.up {
        color: #67C23A;
      }

      &.down {
        color: #F56C6C;
      }
    }
  }

  .pie-chart-container {
    display: flex;
    min-height: 300px;
    padding: 20px;

    .chart {
      flex: 1;
      min-height: 300px;
    }

    .chart-legend {
      width: 150px;
      padding-left: 20px;

      .legend-item {
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          margin-right: 8px;
        }
      }
    }
  }
}
</style>