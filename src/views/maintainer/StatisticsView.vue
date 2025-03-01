<template>
  <div class="statistics-container">
    <el-row :gutter="20">
      <!-- 数据概览卡片 -->
      <el-col :span="8" v-for="stat in stats" :key="stat.title">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="stat-header">
              <span>{{ stat.title }}</span>
              <el-tag :type="stat.type">{{ stat.tag }}</el-tag>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-number">{{ stat.value }}</div>
            <div class="stat-trend">
              <span :class="['trend-text', stat.trend > 0 ? 'up' : 'down']">
                {{ Math.abs(stat.trend) }}%
              </span>
              <span class="trend-label">较上月</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 工单处理趋势图 -->
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <h3>工单处理趋势</h3>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">全年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <!-- 这里将使用图表组件 -->
          <div class="chart-placeholder">
            工单处理趋势图表
          </div>
        </el-card>
      </el-col>

      <!-- 评分分布 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <h3>维修评分分布</h3>
          </template>
          <div class="rating-stats">
            <div v-for="rating in ratings" :key="rating.score" class="rating-item">
              <span class="rating-score">{{ rating.score }}星</span>
              <el-progress
                :percentage="rating.percentage"
                :color="rating.color"
                :show-text="false"
                class="rating-progress"
              />
              <span class="rating-count">{{ rating.count }}次</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 工单类型分布 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <h3>工单类型分布</h3>
          </template>
          <!-- 这里将使用饼图组件 -->
          <div class="chart-placeholder">
            工单类型分布图表
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 时间范围选择
const timeRange = ref('month')

// Mock数据 - 统计概览
const stats = ref([
  {
    title: '本月完成工单',
    value: 128,
    trend: 12.5,
    type: 'success',
    tag: '良好'
  },
  {
    title: '平均处理时长',
    value: '2.5小时',
    trend: -8.3,
    type: 'warning',
    tag: '一般'
  },
  {
    title: '平均评分',
    value: '4.8',
    trend: 5.2,
    type: 'success',
    tag: '优秀'
  }
])

// Mock数据 - 评分分布
const ratings = ref([
  { score: 5, percentage: 75, count: 150, color: '#67C23A' },
  { score: 4, percentage: 20, count: 40, color: '#E6A23C' },
  { score: 3, percentage: 3, count: 6, color: '#F56C6C' },
  { score: 2, percentage: 1, count: 2, color: '#909399' },
  { score: 1, percentage: 1, count: 2, color: '#909399' }
])
</script>

<style scoped lang="scss">
.statistics-container {
  padding: 20px;

  .stat-card {
    margin-bottom: 20px;

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-content {
      text-align: center;
      padding: 10px 0;

      .stat-number {
        font-size: 24px;
        font-weight: bold;
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
      }

      .stat-trend {
        font-size: 14px;

        .trend-text {
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

        .trend-label {
          color: var(--el-text-color-secondary);
          margin-left: 4px;
        }
      }
    }
  }

  .chart-card {
    margin-bottom: 20px;

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: normal;
      }
    }

    .chart-placeholder {
      height: 300px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: var(--el-fill-color-lighter);
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }
  }

  .rating-stats {
    padding: 20px 0;

    .rating-item {
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .rating-score {
        width: 40px;
        font-size: 14px;
      }

      .rating-progress {
        flex: 1;
        margin: 0 12px;
      }

      .rating-count {
        width: 50px;
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}
</style>