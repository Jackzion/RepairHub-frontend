<template>
  <el-card class="order-statistics-card">
    <template #header>
      <div class="card-header">
        <h3>工单统计</h3>
        <el-radio-group v-model="timeRange" size="small">
          <el-radio-button label="week">本周</el-radio-button>
          <el-radio-button label="month">本月</el-radio-button>
        </el-radio-group>
      </div>
    </template>

    <div class="statistics-content">
      <div class="statistics-cards">
        <el-card class="stat-card" shadow="hover">
          <template #header>
            <div class="stat-header">
              <el-icon class="stat-icon" color="#409EFF"><DataLine /></el-icon>
              <span>总工单数</span>
            </div>
          </template>
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-trend">
            <span :class="{ 'up': stats.totalTrend > 0, 'down': stats.totalTrend < 0 }">
              {{ Math.abs(stats.totalTrend) }}%
            </span>
            较上{{ timeRange === 'week' ? '周' : '月' }}
          </div>
        </el-card>

        <el-card class="stat-card" shadow="hover">
          <template #header>
            <div class="stat-header">
              <el-icon class="stat-icon" color="#67C23A"><CircleCheck /></el-icon>
              <span>完成率</span>
            </div>
          </template>
          <div class="stat-value">{{ stats.completionRate }}%</div>
          <div class="stat-trend">
            <span :class="{ 'up': stats.completionTrend > 0, 'down': stats.completionTrend < 0 }">
              {{ Math.abs(stats.completionTrend) }}%
            </span>
            较上{{ timeRange === 'week' ? '周' : '月' }}
          </div>
        </el-card>

        <el-card class="stat-card" shadow="hover">
          <template #header>
            <div class="stat-header">
              <el-icon class="stat-icon" color="#E6A23C"><Timer /></el-icon>
              <span>平均处理时间</span>
            </div>
          </template>
          <div class="stat-value">{{ stats.avgProcessTime }}h</div>
          <div class="stat-trend">
            <span :class="{ 'up': stats.timeTrend < 0, 'down': stats.timeTrend > 0 }">
              {{ Math.abs(stats.timeTrend) }}%
            </span>
            较上{{ timeRange === 'week' ? '周' : '月' }}
          </div>
        </el-card>
      </div>

      <div class="chart-container">
        <el-tabs v-model="activeChart">
          <el-tab-pane label="工单趋势" name="trend">
            <div class="chart-wrapper">
              <el-empty v-if="!chartData.length" description="暂无数据" />
              <!-- 这里可以集成 ECharts 等图表库展示趋势图 -->
            </div>
          </el-tab-pane>
          <el-tab-pane label="类型分布" name="types">
            <div class="chart-wrapper">
              <el-empty v-if="!typeData.length" description="暂无数据" />
              <!-- 这里可以集成 ECharts 等图表库展示饼图 -->
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { DataLine, CircleCheck, Timer } from '@element-plus/icons-vue'

// 时间范围选择
const timeRange = ref('week')
const activeChart = ref('trend')

// Mock 数据
const stats = ref({
  total: 28,
  totalTrend: 15,
  completionRate: 92,
  completionTrend: 5,
  avgProcessTime: 4.5,
  timeTrend: -10
})

// Mock 图表数据
const chartData = ref([])
const typeData = ref([])
</script>

<style scoped lang="scss">
.order-statistics-card {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
  }

  .statistics-content {
    .statistics-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;

      .stat-card {
        .stat-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #606266;

          .stat-icon {
            font-size: 20px;
          }
        }

        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
          margin: 16px 0 8px;
        }

        .stat-trend {
          font-size: 13px;
          color: #909399;

          span {
            &.up {
              color: #67C23A;

              &::before {
                content: '↑';
                margin-right: 2px;
              }
            }

            &.down {
              color: #F56C6C;

              &::before {
                content: '↓';
                margin-right: 2px;
              }
            }
          }
        }
      }
    }

    .chart-container {
      margin-top: 20px;

      .chart-wrapper {
        height: 300px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #f5f7fa;
        border-radius: 4px;
      }
    }
  }
}
</style>