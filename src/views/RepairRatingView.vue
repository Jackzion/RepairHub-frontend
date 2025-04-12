<template>
  <div class="rating-statistics-container">
    <el-card class="statistics-card">
      <template #header>
        <div class="card-header">
          <h2>维修评价统计</h2>
          <div class="header-actions">
            <el-radio-group v-model="timeRange" size="small">
              <el-radio-button label="week">本周</el-radio-button>
              <el-radio-button label="month">本月</el-radio-button>
              <el-radio-button label="year">本年</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="8">
          <div class="statistics-item">
            <h3>平均评分</h3>
            <div class="score">
              <span class="number">{{ averageScore }}</span>
              <el-rate v-model="averageScore" disabled show-score />
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="statistics-item">
            <h3>评价总数</h3>
            <div class="total">
              <span class="number">{{ totalRatings }}</span>
              <span class="label">条</span>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="statistics-item">
            <h3>满意度</h3>
            <div class="satisfaction">
              <el-progress
                type="dashboard"
                :percentage="satisfactionRate"
                :color="progressColor"
              />
            </div>
          </div>
        </el-col>
      </el-row>

      <el-divider>评分分布</el-divider>

      <div class="rating-distribution">
        <div v-for="score in ratingDistribution" :key="score.rating" class="distribution-item">
          <span class="rating-label">{{ score.rating }}星</span>
          <el-progress
            :percentage="score.percentage"
            :color="getProgressColor(score.rating)"
          />
          <span class="rating-count">({{ score.count }})</span>
        </div>
      </div>

      <el-divider>评价列表</el-divider>

      <div class="rating-list">
        <el-table :data="ratingList" style="width: 100%">
          <el-table-column prop="repairId" label="工单编号" width="120" />
          <el-table-column prop="userId" label="评论者" width="120" />
          <el-table-column label="评分" width="200">
            <template #default="{ row }">
              <el-rate v-model="row.score" disabled show-score />
            </template>
          </el-table-column>
          <el-table-column prop="content" label="评价内容" show-overflow-tooltip />
          <el-table-column prop="createdAt" label="评价时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { ref, computed, onMounted } from 'vue'
import { getRatingStatistics } from '../api/ratingController'

// 工具函数
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
}

// 时间范围选择
const timeRange = ref('month')

// 监听时间范围变化
watch(timeRange, async (newValue) => {
  fetchRatingRes()
})

// 统计数据
const averageScore = ref(4.5)
const totalRatings = ref(256)
const satisfactionRate = ref(92)

// 评分分布数据
const ratingDistribution = ref([
  { rating: 5, count: 150, percentage: 58.6 },
  { rating: 4, count: 80, percentage: 31.2 },
  { rating: 3, count: 15, percentage: 5.9 },
  { rating: 2, count: 8, percentage: 3.1 },
  { rating: 1, count: 3, percentage: 1.2 }
])

// 评价列表数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(256)

onMounted( async () => {
  fetchRatingRes()
})

const fetchRatingRes = async () => {
  const res = await getRatingStatistics({
    timeRange: timeRange.value
  })
  ratingDistribution.value = res.data.data.ratingDistribution
  averageScore.value = res.data.data.averageScore
  totalRatings.value = res.data.data.totalRatings
  satisfactionRate.value = res.data.data.satisfactionRate
  ratingList.value = res.data.data.ratingsList
}

// Mock评价列表数据
const ratingList = ref([
  {
    repairId: 'R2023080001',
    type: '空调',
    score: 5,
    comment: '维修人员专业性强，服务态度好，修理及时到位',
    createdAt: '2023-08-15 14:30:00'
  },
  {
    repairId: 'R2023080002',
    type: '水管',
    score: 4,
    comment: '维修效果不错，但是现场清理可以更干净一些',
    createdAt: '2023-08-14 16:20:00'
  },
  {
    repairId: 'R2023080003',
    type: '电路',
    score: 5,
    comment: '非常感谢维修人员的耐心解答和细致工作',
    createdAt: '2023-08-14 11:15:00'
  },
  {
    repairId: 'R2023080004',
    type: '门锁',
    score: 3,
    comment: '维修时间有点长，但最终修好了',
    createdAt: '2023-08-13 09:45:00'
  },
  {
    repairId: 'R2023080005',
    type: '网络',
    score: 5,
    comment: '响应速度快，解决问题专业',
    createdAt: '2023-08-12 15:30:00'
  }
])

// 计算进度条颜色
const progressColor = computed(() => {
  if (satisfactionRate.value >= 90) return '#67C23A'
  if (satisfactionRate.value >= 70) return '#E6A23C'
  return '#F56C6C'
})

// 获取评分分布进度条颜色
const getProgressColor = (rating: number) => {
  const colors = {
    5: '#67C23A',
    4: '#85CE61',
    3: '#E6A23C',
    2: '#F56C6C',
    1: '#FF4949'
  }
  return colors[rating]
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  // TODO: 重新加载数据
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // TODO: 重新加载数据
}
</script>

<style scoped lang="scss">
.rating-statistics-container {
  padding: 20px;

  .statistics-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
      }
    }

    .statistics-item {
      text-align: center;
      padding: 20px;

      h3 {
        margin: 0 0 15px;
        color: #606266;
      }

      .number {
        font-size: 24px;
        font-weight: bold;
        color: #303133;
      }

      .score {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }

      .total {
        .label {
          margin-left: 5px;
          color: #909399;
        }
      }

      .satisfaction {
        display: flex;
        justify-content: center;
      }
    }

    .rating-distribution {
      padding: 20px 0;

      .distribution-item {
        display: flex;
        align-items: center;
        margin-bottom: 15px;

        .rating-label {
          width: 50px;
          text-align: right;
          margin-right: 15px;
        }

        .el-progress {
          flex: 1;
          margin-right: 15px;
        }

        .rating-count {
          width: 50px;
          color: #909399;
        }
      }
    }

    .rating-list {
      .pagination {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>