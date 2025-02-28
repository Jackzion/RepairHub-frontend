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
            <div class="chart-placeholder">此处显示饼图</div>
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
import { ref } from 'vue'
import { CaretTop, CaretBottom } from '@element-plus/icons-vue'

const timeRange = ref('month')

// Mock数据
const workloadStats = ref([
  { title: '总维修工单', value: 256, percentage: '+15%', trend: 'up' },
  { title: '平均处理时间', value: '2.5小时', percentage: '-10%', trend: 'down' },
  { title: '满意度评分', value: '4.8', percentage: '+5%', trend: 'up' }
])

const repairTypeData = ref([
  { type: '空调维修', percentage: 35, color: '#409EFF' },
  { type: '电路维修', percentage: 25, color: '#67C23A' },
  { type: '水管维修', percentage: 20, color: '#E6A23C' },
  { type: '其他设备', percentage: 20, color: '#F56C6C' }
])

const ratingStats = ref([
  { maintainer: '张三', completedCount: 45, avgRating: 4.8 },
  { maintainer: '李四', completedCount: 38, avgRating: 4.6 },
  { maintainer: '王五', completedCount: 42, avgRating: 4.7 },
  { maintainer: '赵六', completedCount: 35, avgRating: 4.5 }
])
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

    .chart-placeholder {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #909399;
    }

    .chart-legend {
      width: 150px;
      padding: 20px;

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