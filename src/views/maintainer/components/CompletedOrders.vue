<template>
  <el-card class="completed-orders-card">
    <template #header>
      <div class="card-header">
        <h3>已完成的工单</h3>
        <div class="header-actions">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :shortcuts="dateShortcuts"
            class="date-picker"
          />
          <el-input
            v-model="searchKeyword"
            placeholder="搜索工单"
            :prefix-icon="Search"
            class="search-input"
          />
        </div>
      </div>
    </template>

    <div class="orders-grid">
      <el-card
        v-for="order in filteredOrders"
        :key="order.id"
        class="order-card"
        shadow="hover"
      >
        <div class="order-header">
          <span class="order-id">{{ order.id }}</span>
          <el-tag type="success" effect="dark" size="small">已完成</el-tag>
        </div>

        <div class="order-content">
          <div class="order-info">
            <el-icon><Tools /></el-icon>
            <span>{{ order.type }}</span>
          </div>
          <div class="order-info">
            <el-icon><Location /></el-icon>
            <span>{{ order.location }}</span>
          </div>
          <div class="order-description">
            <el-icon><Document /></el-icon>
            <el-text class="mx-1" truncated>{{ order.description }}</el-text>
          </div>
        </div>

        <div class="order-footer">
          <div class="order-times">
            <span class="order-time">
              <el-icon><Timer /></el-icon>
              接单：{{ order.acceptedAt }}
            </span>
            <span class="order-time">
              <el-icon><CircleCheck /></el-icon>
              完成：{{ order.completedAt }}
            </span>
          </div>
          <div class="order-actions">
            <el-button type="primary" link @click="viewDetail(order.id)">
              查看详情
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="totalOrders"
        :page-sizes="[8, 16, 24, 32]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Tools, Location, Document, Timer, CircleCheck } from '@element-plus/icons-vue'

const router = useRouter()

// 搜索和日期筛选
const searchKeyword = ref('')
const dateRange = ref([])

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

// 分页
const currentPage = ref(1)
const pageSize = ref(8)
const totalOrders = ref(0)

// Props
const props = defineProps<{
  orders: Array<{
    id: string
    type: string
    location: string
    description: string
    priority: string
    status: string
    acceptedAt: string
    completedAt: string
  }>
}>()

// 过滤工单列表
const filteredOrders = computed(() => {
  let filtered = props.orders

  // 日期筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const startDate = dateRange.value[0]
    const endDate = dateRange.value[1]
    filtered = filtered.filter(order => {
      const completedDate = new Date(order.completedAt)
      return completedDate >= startDate && completedDate <= endDate
    })
  }

  // 关键词搜索
  if (searchKeyword.value) {
    filtered = filtered.filter(order =>
      Object.values(order).some(value =>
        String(value).toLowerCase().includes(searchKeyword.value.toLowerCase())
      )
    )
  }

  totalOrders.value = filtered.length
  const start = (currentPage.value - 1) * pageSize.value
  return filtered.slice(start, start + pageSize.value)
})

// 查看详情
const viewDetail = (id: string) => {
  router.push(`/repair/${id}`)
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}
</script>

<style scoped lang="scss">
.completed-orders-card {
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

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;

      .date-picker {
        width: 320px;
      }

      .search-input {
        width: 200px;
      }
    }
  }

  .orders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    margin: 16px 0;
  }

  .order-card {
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .order-id {
        font-weight: 600;
        color: #606266;
      }
    }

    .order-content {
      .order-info {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        color: #606266;

        .el-icon {
          margin-right: 8px;
        }
      }

      .order-description {
        display: flex;
        align-items: flex-start;
        margin-top: 12px;
        color: #606266;

        .el-icon {
          margin-right: 8px;
          margin-top: 3px;
        }
      }
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #ebeef5;

      .order-times {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .order-time {
          display: flex;
          align-items: center;
          color: #909399;
          font-size: 13px;

          .el-icon {
            margin-right: 4px;
          }
        }
      }

      .order-actions {
        display: flex;
        gap: 8px;
      }
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>